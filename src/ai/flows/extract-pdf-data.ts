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
  prompt: `You are an expert data extraction specialist. Your task is to meticulously extract all tabular data from the provided PDF document.
- Identify all column headers accurately. These headers will form the first row of your CSV output.
- Extract all data rows corresponding to these headers.
- Information like a 'course name' or 'program' might be present at the top of each page or section. Ensure this information is correctly associated with the data rows it pertains to, likely as a value in a relevant column (e.g., 'programme' or 'course_name').
- If the document contains multiple tables or sections for different courses, append them sequentially in the CSV.
- Within each individual data cell, aim to represent the content on a single line. If a cell's original text contains newlines, try to replace them with a space. If newlines are absolutely essential for the data's meaning and must be preserved, ensure they are correctly escaped within a properly quoted CSV field.
- Return the entire extracted dataset as a single CSV string. Ensure the CSV format is valid, with values properly quoted if they contain commas, newlines (between rows), or quotes.
- Do not include any explanatory text or summaries, only the CSV data.
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
