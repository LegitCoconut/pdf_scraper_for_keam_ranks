
"use client";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface DataTableProps {
  data: Record<string, any>[];
}

// Helper to format header strings (e.g., "college_name" to "College Name")
const formatHeader = (header: string): string => {
  if (!header) return "";
  return header
    .replace(/_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize first letter of each word
};

export function DataTable({ data }: DataTableProps) {
  // Parent component (PdfProcessorClient) handles the "No data" case.
  // This component assumes `data` is a non-empty array of objects.
  if (!data || data.length === 0) {
    return null; 
  }

  const headers = Object.keys(data[0]);

  return (
    <ScrollArea className="w-full rounded-md border shadow-sm bg-card">
      <Table className="min-w-full text-sm">
        <TableHeader className="bg-muted/50 sticky top-0 z-10"> {/* Sticky header for better scroll experience */}
          <TableRow>
            {headers.map((header) => (
              <TableHead key={header} className="px-4 py-3 font-semibold whitespace-nowrap text-foreground">
                {formatHeader(header)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-muted/20 transition-colors duration-150 ease-in-out">
              {headers.map((header, cellIndex) => (
                <TableCell key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {String(row[header] === null || row[header] === undefined ? '' : row[header])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
