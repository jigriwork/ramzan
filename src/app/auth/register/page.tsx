"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { useFirestore, registerEmail } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const db = useFirestore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorText('Name is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      const credential = await registerEmail(email, password, trimmedName);
      await setDoc(
        doc(db, 'users', credential.user.uid),
        {
          name: trimmedName,
          city: '',
          mode: 'adult',
          theme: 'system',
          language: 'en',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          email: credential.user.email || email,
        },
        { merge: true }
      );
      router.push('/app');
    } catch (error: any) {
      setErrorText(error?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background islamic-pattern relative">
      <div className="absolute top-8 left-8">
        <Button variant="ghost" asChild className="rounded-full">
          <Link href="/">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
          </Link>
        </Button>
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20 mb-6">
            <Moon className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-headline font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-2">Start your premium Ramadan experience</p>
        </div>

        <Card className="shadow-2xl border-none">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Join the NoorRamadan community</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
             <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  className="pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-primary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {errorText ? <p className="text-sm text-destructive">{errorText}</p> : null}
            <Button className="w-full h-12 text-lg rounded-xl" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Now'}
            </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t py-4">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary font-semibold hover:underline">Login</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
