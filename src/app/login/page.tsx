
"use client"

import type { FormEvent } from 'react';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { login } from "./actions"; // Server Action
import { Loader2, LockKeyhole } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(password);
      if (result?.error) {
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Redirecting...",
        });
        router.push("/"); // Redirect to main page
      }
    } catch (error) {
      toast({
        title: "An Unexpected Error Occurred",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <LockKeyhole className="mx-auto h-12 w-12 text-primary mb-4" />
          <CardTitle className="text-2xl">PDF Scraper Pro</CardTitle>
          <CardDescription>Please enter the password to access the application.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
       <p className="mt-8 text-sm text-muted-foreground">
        Hint: The password is set in the <code className="bg-muted px-1.5 py-0.5 rounded">.env</code> file (APP_PASSWORD).
      </p>
    </main>
  );
}
