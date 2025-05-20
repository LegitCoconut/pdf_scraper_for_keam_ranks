
import { PdfProcessorClient } from '@/components/pdf-processor-client';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 flex flex-col items-center">
      <div className="container mx-auto max-w-4xl w-full">
        <header className="mb-8 text-center py-6">
          <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
            PDF Scraper Pro
          </h1>
          <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
            Unlock data from your PDF files. Intelligently extract tables and export to CSV with a single click.
          </p>
        </header>
        <PdfProcessorClient />
      </div>
    </main>
  );
}
