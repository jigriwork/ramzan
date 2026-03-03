"use client"

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { namazService, NamazStep } from '@/services/namazService';
import { ChevronRight, ChevronLeft, CheckCircle2, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ensureAuthForSaving, useFirestore, useUser } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export default function LearnNamazPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [steps, setSteps] = useState<NamazStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isKidsMode, setIsKidsMode] = useState(false);

  useEffect(() => {
    namazService.getSteps().then(data => {
      setSteps(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (!steps || steps.length === 0) {
    return <div className="text-center py-20 text-muted-foreground">Namaz steps are not available yet.</div>;
  }
  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  useEffect(() => {
    const cached = localStorage.getItem('learn_namaz_progress');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as { stepIndex?: number };
        if (typeof parsed.stepIndex === 'number') {
          setCurrentStepIndex(Math.max(0, Math.min(parsed.stepIndex, steps.length - 1)));
        }
      } catch {
        // ignore corrupt cache
      }
    }
  }, [steps.length]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'learn_progress', user.uid));
        if (cancelled || !snap.exists()) return;
        const data = snap.data() as { stepIndex?: number; completed?: boolean; completedAt?: string };
        if (typeof data.stepIndex === 'number') {
          setCurrentStepIndex(Math.max(0, Math.min(data.stepIndex, steps.length - 1)));
        }
        localStorage.setItem('learn_namaz_progress', JSON.stringify({
          completed: Boolean(data.completed),
          completedAt: data.completedAt ?? null,
          stepIndex: typeof data.stepIndex === 'number' ? data.stepIndex : 0,
        }));
      } catch {
        toast({
          variant: 'destructive',
          title: 'Sync Warning',
          description: 'Could not load learn progress from cloud. Using cached state.',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [db, user, steps.length]);

  useEffect(() => {
    setCurrentStepIndex((prev) => Math.max(0, Math.min(prev, steps.length - 1)));
  }, [steps.length]);

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleFinishGuide = async () => {
    try {
      const activeUser = await ensureAuthForSaving();
      const payload = {
        completed: true,
        completedAt: new Date().toISOString(),
        stepIndex: currentStepIndex,
      };
      await setDoc(doc(db, 'learn_progress', activeUser.uid), payload, { merge: true });
      localStorage.setItem('learn_namaz_progress', JSON.stringify(payload));
      toast({ title: 'Progress Saved', description: 'Learn Namaz progress synced.' });
    } catch {
      localStorage.setItem('learn_namaz_progress', JSON.stringify({
        completed: true,
        completedAt: new Date().toISOString(),
        stepIndex: currentStepIndex,
      }));
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not sync learn progress to cloud. Saved locally.',
      });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-headline font-bold text-primary">Learn Namaz</h2>
          <p className="text-muted-foreground">Master your prayers step by step</p>
        </div>
        <div className="flex items-center space-x-2 bg-secondary/30 p-2 rounded-2xl border">
          <Label htmlFor="kids-mode" className="text-xs font-bold uppercase tracking-tighter flex items-center gap-1">
            <Star className={cn("w-3 h-3 transition-colors", isKidsMode ? "text-yellow-500 fill-current" : "text-muted-foreground")} />
            Kids Mode
          </Label>
          <Switch id="kids-mode" checked={isKidsMode} onCheckedChange={setIsKidsMode} />
        </div>
      </header>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
          <span>Step {currentStepIndex + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-3 rounded-full" />
      </div>

      <Card className={cn(
        "border-none shadow-xl transition-all duration-500 overflow-hidden rounded-[2rem]",
        isKidsMode ? "bg-yellow-50/50" : "bg-white"
      )}>
        <CardContent className="p-0">
          <div className={cn(
            "p-8 text-center",
            isKidsMode ? "bg-yellow-100/50 border-b border-yellow-200" : "bg-primary text-white"
          )}>
            <h3 className={cn("font-headline font-black", isKidsMode ? "text-2xl text-yellow-800" : "text-3xl")}>
              {currentStep.title}
            </h3>
            <p className={cn("mt-4 text-lg", isKidsMode ? "text-yellow-700" : "text-primary-foreground/80")}>
              {currentStep.instruction}
            </p>
          </div>

          <div className="p-10 space-y-8">
            <div className="space-y-4">
              <p className={cn(
                "arabic-font font-bold leading-loose text-center tracking-wide",
                isKidsMode ? "text-5xl text-yellow-900" : "text-4xl"
              )}>
                {currentStep.arabic}
              </p>
              <div className="w-12 h-1 bg-primary/10 mx-auto rounded-full" />
            </div>

            <div className="space-y-6 text-center max-w-lg mx-auto">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/40">Transliteration</p>
                <p className={cn("italic font-medium text-muted-foreground", isKidsMode ? "text-xl" : "text-lg")}>
                  {currentStep.transliteration}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-primary/40">Translation (English)</p>
                <p className={cn("font-bold text-primary", isKidsMode ? "text-2xl" : "text-xl")}>
                  {currentStep.translation_en}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-4 border-t border-dashed">
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/40">Urdu</p>
                  <p className="font-bold">{currentStep.translation_ur}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/40">Hindi</p>
                  <p className="font-bold">{currentStep.translation_hi}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 h-14 rounded-2xl font-bold"
          onClick={prevStep}
          disabled={currentStepIndex === 0}
        >
          <ChevronLeft className="w-5 h-5 mr-2" /> Previous
        </Button>
        {currentStepIndex === steps.length - 1 ? (
          <Button size="lg" className="flex-1 h-14 rounded-2xl font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200" onClick={handleFinishGuide}>
            <CheckCircle2 className="w-5 h-5 mr-2" /> Finish Guide
          </Button>
        ) : (
          <Button size="lg" className="flex-1 h-14 rounded-2xl font-bold" onClick={nextStep}>
            Next Step <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        )}
      </div>

      <div className="p-6 bg-primary/5 rounded-3xl text-center space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">Did you know?</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Prayer is the cooling of the eyes and the spiritual connection between a servant and their Creator. Take your time with each step.
        </p>
      </div>
    </div>
  );
}