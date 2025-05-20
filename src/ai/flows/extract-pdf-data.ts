// This is an AI-powered function that extracts structured data from a PDF document.
// It identifies column headers and aligns data accordingly, returning it in CSV format.
// - extractPdfData - The function to extract data from a PDF.
// - ExtractPdfDataInput - The input type for the function, which includes the PDF data URI.
// - ExtractPdfDataOutput - The output type, a CSV string containing the extracted data.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractPdfDataInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      'The PDF document as a data URI, including MIME type and Base64 encoding (e.g., data:application/pdf;base64,<encoded_data>). Can also be a publicly accessible HTTPS URL to a PDF.'
    ),
});
export type ExtractPdfDataInput = z.infer<typeof ExtractPdfDataInputSchema>;

const ExtractPdfDataOutputSchema = z.object({
  extractedData: z
    .string()
    .describe('The extracted data from the PDF, formatted as a CSV string. The first row of the CSV must be the column headers: Phase,Course,College_Name,College_Code,Type,Rank_Details.'),
});
export type ExtractPdfDataOutput = z.infer<typeof ExtractPdfDataOutputSchema>;

export async function extractPdfData(input: ExtractPdfDataInput): Promise<ExtractPdfDataOutput> {
  return extractPdfDataFlow(input);
}

const extractPdfDataPrompt = ai.definePrompt({
  name: 'extractPdfDataPrompt',
  input: {schema: ExtractPdfDataInputSchema},
  output: {schema: ExtractPdfDataOutputSchema},
  prompt: `You are an expert data extraction specialist. Your task is to meticulously extract specific tabular data from all pages of the provided PDF document and return it as a single, valid CSV string.

The required columns are EXACTLY: Phase,Course,College_Name,College_Code,Type,Rank_Details

Instructions for each column:
1.  **Phase**: Identify the phase. If no phase information is explicitly found in the document for a row, default this value to '1'.
2.  **Course**: Extract the course name or program name. This information might be present at the top of a page or section; ensure it's correctly associated with all relevant data rows.
3.  **College_Name**: Extract the full name of the college. CRITICAL: Remove any newline characters from the college name, presenting it as a single line of text.
4.  **College_Code**: Extract the college code.
5.  **Type**: Extract the type (e.g., of course, institution, program category).
6.  **Rank_Details**: Extract any ranking information or related details.

General Extraction Rules:
- Process ALL pages of the PDF. If data for the same table or logical group spans multiple pages, append the rows sequentially.
- The VERY FIRST ROW of your output CSV string MUST be the headers: "Phase,Course,College_Name,College_Code,Type,Rank_Details".
- For each subsequent row, provide the data corresponding to these headers.
- If a specific field (other than Phase, which defaults to '1') is not found or not applicable for a row, leave the corresponding CSV cell empty.
- Ensure data within each cell is on a single line. If original text contains newlines, replace them with a space. If newlines are absolutely essential for meaning (e.g., within a multi-line rank detail), ensure they are correctly escaped within a properly quoted CSV field.
- Ensure the entire output is a valid CSV format (e.g., values containing commas, newlines between rows, or quotes must be enclosed in double quotes, and internal double quotes must be escaped as "").
- Do NOT include any explanatory text, summaries, or any content other than the CSV data itself. Your entire response should be the CSV string.

Here is the PDF document: {{media url=pdfDataUri}}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const extractPdfDataFlow = ai.defineFlow(
  {name: 'extractPdfDataFlow', inputSchema: ExtractPdfDataInputSchema, outputSchema: ExtractPdfDataOutputSchema},
  async input => {
    const {output} = await extractPdfDataPrompt(input);
    return output!;
  }
);

