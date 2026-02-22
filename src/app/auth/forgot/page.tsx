
"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, ChevronLeft, Mail, CheckCircle2 } from 'lucide-react';
import { sendReset } from '@/firebase';
import { toast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await sendReset(email);
      setIsSent(true);
      toast({ title: "Reset Link Sent", description: "Please check your email inbox." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background islamic-pattern relative">
      <div className="absolute top-8 left-8">
        <Button variant="ghost" asChild className="rounded-full">
          <Link href="/auth/login">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Login
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 mb-6">
            <Moon className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-headline font-bold">Reset Password</h1>
          <p className="text-muted-foreground mt-2">We'll send you a link to get back into your account</p>
        </div>

        <Card className="shadow-2xl border-none">
          <CardHeader>
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>Enter the email associated with your account</CardDescription>
          </CardHeader>
          <CardContent>
            {isSent ? (
              <div className="flex flex-col items-center text-center py-6 space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="font-medium">Success! Check your email for instructions.</p>
                <Button variant="outline" className="w-full rounded-xl" onClick={() => setIsSent(false)}>
                  Try another email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-10 h-12 rounded-xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button className="w-full h-12 text-lg rounded-xl" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center border-t py-4">
            <p className="text-sm text-muted-foreground">
              Remembered your password?{' '}
              <Link href="/auth/login" className="text-primary font-semibold hover:underline">Log In</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
