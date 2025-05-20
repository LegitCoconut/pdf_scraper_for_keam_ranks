
"use client";

import type { ChangeEvent } from 'react';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { extractPdfData, type ExtractPdfDataInput } from '@/ai/flows/extract-pdf-data';
import { convertToCSV, downloadCSV } from '@/lib/csv-utils';
import { Loader2, UploadCloud, FileText, Download, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import { DataTable } from '@/components/data-table';

export function PdfProcessorClient() {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [pdfUrlInput, setPdfUrlInput] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const [extractedData, setExtractedData] = useState<Record<string, any>[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    setPdfFile(null);
    setFileName(null);
    setPdfUrlInput('');
    setError(null);
    // Keep extractedData to allow users to see previous results if they switch tabs
    // setExtractedData(null); 
  }, [activeTab]);

  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({ title: "Invalid File Type", description: "Please upload a PDF file.", variant: "destructive" });
        setPdfFile(null);
        setFileName(null);
        if (event.target) event.target.value = ""; 
        return;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
         toast({ title: "File Too Large", description: "Please upload a PDF file smaller than 10MB.", variant: "destructive" });
         setPdfFile(null);
         setFileName(null);
         if (event.target) event.target.value = "";
         return;
      }
      setPdfFile(file);
      setFileName(file.name);
    } else {
      setPdfFile(null);
      setFileName(null);
    }
  };

  const handleProcessPdf = async () => {
    setIsLoading(true);
    setError(null);
    setExtractedData(null); // Clear previous results before new processing

    let pdfDataUri = "";

    try {
      if (activeTab === 'upload' && pdfFile) {
        pdfDataUri = await fileToDataUri(pdfFile);
      } else if (activeTab === 'url' && pdfUrlInput.trim()) {
        const url = pdfUrlInput.trim();
        if (url.startsWith('data:application/pdf;base64,')) {
          pdfDataUri = url;
        } else if (url.startsWith('http://') || url.startsWith('https://')) {
          pdfDataUri = url; // Pass public URL to AI flow
          toast({
            title: "Processing URL",
            description: "Attempting to process the public URL. Ensure it's accessible.",
          });
        } else {
          toast({ title: "Invalid URL", description: "Please enter a valid public PDF URL or a Base64 data URI.", variant: "destructive" });
          setIsLoading(false);
          return;
        }
      } else {
        toast({ title: "No PDF Provided", description: "Please upload a PDF file or enter a valid PDF URL.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      if (!pdfDataUri) { // Should not happen if logic above is correct
        toast({ title: "No PDF Data", description: "Could not prepare PDF data for processing.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
      
      const input: ExtractPdfDataInput = { pdfDataUri };
      const result = await extractPdfData(input);
      
      let jsonData;
      try {
        jsonData = JSON.parse(result.extractedData);
      } catch (parseError) {
        console.error("JSON Parsing error:", parseError);
        setError("AI returned invalid JSON. Could not parse extracted data. The PDF might be complex or not machine-readable.");
        toast({ title: "Parsing Error", description: "Invalid data format from AI. Try another PDF.", variant: "destructive" });
        setExtractedData(null);
        setIsLoading(false);
        return;
      }

      if (!Array.isArray(jsonData)) {
        setError("Extracted data is not in a table format. AI might have struggled with this PDF structure.");
        toast({ title: "Extraction Issue", description: "Data not in expected table format. Please check the PDF.", variant: "destructive" });
        setExtractedData(null);
      } else if (jsonData.length === 0) {
        setExtractedData([]); 
        toast({ title: "Extraction Complete", description: "No tabular data found in the PDF.", variant: "default" });
      } else if (typeof jsonData[0] !== 'object' || jsonData[0] === null) {
        setError("Extracted data items are not structured correctly. AI might have struggled with this PDF.");
        toast({ title: "Extraction Issue", description: "Data items not structured correctly. Please check the PDF.", variant: "destructive" });
        setExtractedData(null);
      } else {
        setExtractedData(jsonData);
        toast({ title: "Success!", description: "PDF data extracted successfully.", variant: "default" });
      }

    } catch (e: any) {
      console.error("Processing error:", e);
      const errorMessage = e.message?.includes("DEADLINE_EXCEEDED") || e.message?.includes("timeout")
        ? "Processing timed out. The PDF might be too large/complex or the URL inaccessible. Please try a smaller PDF or upload the file directly."
        : e.message?.includes("INVALID_ARGUMENT")
        ? "Invalid PDF or URL. Please check your input, ensure the PDF is not corrupted and the URL is correct and publicly accessible."
        : (e.message || "An unknown error occurred during PDF processing.");
      setError(errorMessage);
      toast({ title: "Processing Error", description: errorMessage, variant: "destructive" });
      setExtractedData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    if (extractedData && extractedData.length > 0) {
      const baseFileName = (activeTab === 'upload' && fileName) 
        ? fileName.split('.').slice(0, -1).join('.') 
        : (activeTab === 'url' && pdfUrlInput)
        ? pdfUrlInput.substring(pdfUrlInput.lastIndexOf('/') + 1).split('.').slice(0, -1).join('.') || "url_extracted_data"
        : "extracted_data";
      const csvOutputFileName = `${baseFileName}.csv`;
      
      const csvString = convertToCSV(extractedData);
      downloadCSV(csvString, csvOutputFileName);
      toast({ title: "CSV Downloaded", description: `Data saved as ${csvOutputFileName}` });
    } else {
      toast({ title: "No Data", description: "No data available to download.", variant: "destructive" });
    }
  };

  return (
    <Card className="w-full shadow-xl border-t-4 border-primary">
      <CardHeader>
        <CardTitle className="text-2xl">Upload or Link PDF</CardTitle>
        <CardDescription>
          Choose a PDF file from your device or provide a direct public URL to a PDF document. Max file size: 10MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'upload' | 'url')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="upload"><UploadCloud className="mr-2 h-4 w-4" /> Upload File</TabsTrigger>
            <TabsTrigger value="url"><LinkIcon className="mr-2 h-4 w-4" /> Paste URL</TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <div className="space-y-2">
              <Label htmlFor="pdfFile" className="text-sm font-medium">Select PDF File</Label>
              <Input
                id="pdfFile"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full text-sm file:text-sm file:font-semibold file:bg-primary/10 file:text-primary file:py-2 file:px-4 file:rounded-lg file:border-0 hover:file:bg-primary/20 cursor-pointer"
                disabled={isLoading}
              />
              {fileName && <p className="text-sm text-muted-foreground pt-1">Selected: {fileName}</p>}
            </div>
          </TabsContent>
          <TabsContent value="url">
            <div className="space-y-2">
              <Label htmlFor="pdfUrl" className="text-sm font-medium">PDF URL</Label>
              <Input
                id="pdfUrl"
                type="url"
                placeholder="https://example.com/document.pdf"
                value={pdfUrlInput}
                onChange={(e) => setPdfUrlInput(e.target.value)}
                className="w-full"
                disabled={isLoading}
              />
               <p className="text-xs text-muted-foreground pt-1">
                Must be a publicly accessible URL (http/https) or a Base64 data URI.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4 sm:flex-row sm:justify-end pt-6">
         <Button 
          onClick={handleProcessPdf} 
          disabled={isLoading || (activeTab === 'upload' && !pdfFile) || (activeTab === 'url' && !pdfUrlInput.trim())}
          className="w-full sm:w-auto text-base py-3 px-6" // Larger button
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...
            </>
          ) : (
            "Process PDF"
          )}
        </Button>
      </CardFooter>

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8 my-6 border border-dashed rounded-lg bg-card/50 mx-6">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground text-center">Extracting data... This may take a moment for large or complex PDFs.</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="mx-6 my-6">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Extraction Failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}
      
      {extractedData && !isLoading && (
        <div className="mt-8 mx-0 md:mx-6">
          <Card className="shadow-lg border-accent">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle className="text-xl">Extracted Data</CardTitle>
                <Button 
                  onClick={handleDownloadCsv} 
                  disabled={!extractedData || extractedData.length === 0}
                  variant="outline"
                  size="sm"
                  className="border-accent text-accent hover:bg-accent/10 hover:text-accent"
                >
                  <Download className="mr-2 h-4 w-4" /> Download CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {extractedData.length > 0 ? (
                <DataTable data={extractedData} />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-10 w-10 mb-2"/>
                  No tabular data was found in the PDF.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoading && !error && !extractedData && (
        <div className="mt-8 p-10 border-2 border-dashed rounded-lg text-center bg-card/50 mx-6 mb-6">
          <FileText className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-lg text-muted-foreground">
            Your extracted PDF data will appear here once processed.
          </p>
        </div>
      )}
    </Card>
  );
}
