
"use client"; 

import { PdfProcessorClient } from '@/components/pdf-processor-client';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import { Button } from '@/components/ui/button';
import { logout } from '@/app/login/actions'; 
import { LogOut, FileCode2, FileText } from 'lucide-react'; 
import Link from 'next/link';
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* New App Header Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-6">
          <div className="mr-4 flex items-center">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="font-bold sm:inline-block text-primary text-xl">
                PDF Scraper Pro
              </span>
            </Link>
          </div>
          
          <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
            <Link href="/scripts" passHref>
              <Button variant="outline" size="lg" className="px-4">
                <FileCode2 className="mr-2 h-4 w-4" />
                Helper Scripts
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
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full py-8 px-4 flex flex-col items-center">
        <div className="text-center mb-10"> {/* Increased mb for spacing */}
          <p className="text-lg text-muted-foreground mt-2 max-w-2xl mx-auto">
            Unlock data from your PDF files. Intelligently extract tables and export to CSV with a single click.
          </p>
        </div>
        <PdfProcessorClient />
      </main>
    </div>
  );
}

