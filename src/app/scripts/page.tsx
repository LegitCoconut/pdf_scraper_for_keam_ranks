
// src/app/scripts/page.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { logout } from '@/app/login/actions';
import { LogOut, Home, Download, FileCode2, Image as ImageIcon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ScriptsPage() {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 flex flex-col items-center">
      <div className="container mx-auto max-w-4xl w-full">
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <Link href="/" passHref>
            <Button variant="outline" size="icon" aria-label="Go to Home">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <ThemeToggleButton />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to log out?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <header className="mb-8 text-center py-6 pt-16 md:pt-6">
          <div className="flex items-center justify-center mb-4">
            <FileCode2 className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
              Python Helper Scripts
            </h1>
          </div>
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Download these Python scripts to help prepare your PDFs for better data extraction.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-accent">PDF Cropper</CardTitle>
              <CardDescription>
                This tool helps to crop only the needed parts of a PDF, removing unwanted areas which could degrade the quality of PDF scraping.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Dependencies:</h4>
                <p className="text-sm text-muted-foreground">Ensure you have Python installed. Then, install the required libraries using pip (it's recommended to use a virtual environment):</p>
                <code className="block bg-muted p-2 rounded-md text-sm my-2 overflow-x-auto">pip install pymupdf opencv-python numpy</code>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Usage:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Ensure the <code className="text-xs bg-muted px-1 rounded">pdf_cropper.py</code> script is accessible.</li>
                  <li>Run the script from your terminal (e.g., <code className="text-xs bg-muted px-1 rounded">python pdf_cropper.py</code>).</li>
                  <li>A popup window will appear. Use it to select the PDF file you want to crop.</li>
                  <li>A window will then open with a preview of the PDF.</li>
                  <li>Use your mouse to draw a rectangle around the area you want to crop. <span className="text-destructive font-semibold">(Note: Markings will appear only after selecting the area)</span>.</li>
                  <li>After selecting the area, press the Enter key to confirm.</li>
                  <li>The cropped PDF will be saved in the same folder as the script.</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                <a href="/scripts/pdf_cropper.py" download="pdf_cropper.py">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF Cropper Script
                </a>
              </Button>
            </CardFooter>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-accent">PDF Cutter</CardTitle>
              <CardDescription>
                Split a large PDF into smaller PDF files, each containing a custom number of pages. This is useful for processing very large documents that might exceed processing limits or take too long.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-1">Dependencies:</h4>
                <p className="text-sm text-muted-foreground">Ensure you have Python installed. Then, install the required library using pip (it's recommended to use a virtual environment):</p>
                <code className="block bg-muted p-2 rounded-md text-sm my-2 overflow-x-auto">pip install PyPDF2</code>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Usage:</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Ensure the <code className="text-xs bg-muted px-1 rounded">pdf_cutter.py</code> script is accessible.</li>
                  <li>Run the script from your terminal: <code className="text-xs bg-muted px-1 rounded">python pdf_cutter.py</code></li>
                  <li>A popup window will appear to select the PDF file you want to cut.</li>
                  <li>After selecting the PDF, the script will prompt you to enter the number of pages for each smaller PDF (e.g., 5).</li>
                  <li>The cut PDFs will be saved in the same folder as the script, with names like <code className="text-xs bg-muted px-1 rounded">1.pdf</code>, <code className="text-xs bg-muted px-1 rounded">2.pdf</code>, and so on.</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90">
                <a href="/scripts/pdf_cutter.py" download="pdf_cutter.py">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF Cutter Script
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <section className="mt-12 py-8 border-t">
          <div className="flex items-center justify-center mb-6">
            <ImageIcon className="h-8 w-8 text-primary mr-3" />
            <h2 className="text-3xl font-bold text-primary tracking-tight">
              Visual Guide: PDF Cropper in Action
            </h2>
          </div>
          <p className="text-center text-muted-foreground mb-6 max-w-xl mx-auto">
            The image below shows an example of how the PDF Cropper script might look when you're selecting an area to crop.
          </p>
          <div className="bg-muted p-4 rounded-lg shadow-md max-w-2xl mx-auto">
            <Image
              src="/scripts/cropper.png"
              alt="Screenshot of PDF Cropper script in use"
              width={800}
              height={600}
              className="rounded-md w-full h-auto object-contain"
              data-ai-hint="screenshot tutorial"
            />
          </div>
        </section>

        <footer className="text-center py-8 mt-8 text-sm text-muted-foreground">
            <p>Note: These scripts are provided as-is. Always back up your original PDF files before processing.</p>
            <p>Ensure Python and the listed dependencies are correctly installed in your environment to run these scripts.</p>
        </footer>
      </div>
    </main>
  );
}

