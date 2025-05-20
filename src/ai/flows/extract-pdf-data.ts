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
    .describe('The extracted data from the PDF, formatted as a CSV string. The first row of the CSV must be the column headers.'),
});
export type ExtractPdfDataOutput = z.infer<typeof ExtractPdfDataOutputSchema>;

export async function extractPdfData(input: ExtractPdfDataInput): Promise<ExtractPdfDataOutput> {
  return extractPdfDataFlow(input);
}

const extractPdfDataPrompt = ai.definePrompt({
  name: 'extractPdfDataPrompt',
  input: {schema: ExtractPdfDataInputSchema},
  output: {schema: ExtractPdfDataOutputSchema},
  prompt: `You are an expert data extraction specialist. Your task is to extract all course data from the provided PDF document. Identify column headers and align the corresponding data accordingly. Return the extracted data as a CSV string. The first row of the CSV must be the column headers. Ensure the CSV format is valid and accurately represents all course data found within the PDF. Here is the PDF document: {{media url=pdfDataUri}}`,
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
