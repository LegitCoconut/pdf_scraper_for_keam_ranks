
"use client"; // Keep as client component if it uses client-side hooks for logout confirmation etc.
              // Or convert parts to server components if possible. For now, keep as client.

import { PdfProcessorClient } from '@/components/pdf-processor-client';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/login/actions'; // Assuming logout is in login/actions.ts
import { LogOut } from 'lucide-react';
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


export default function HomePage() {

  const handleLogout = async () => {
    await logout();
    // Server action will handle redirect
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-4 md:p-8 flex flex-col items-center">
      <div className="container mx-auto max-w-4xl w-full">
        <div className="absolute top-4 right-4 flex items-center space-x-2">
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
        
        <header className="mb-8 text-center py-6 pt-16 md:pt-6"> {/* Added padding top for space from buttons */}
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
