
"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Trophy, Star, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { kidsService } from '@/services/kidsService';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { ensureAuthForSaving, useFirestore, useUser } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';

export default function KidsQuizPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [quiz, setQuiz] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    kidsService.getQuizzes().then(all => setQuiz(all[0]));
  }, []);

  useEffect(() => {
    if (!quiz) return;

    const cached = localStorage.getItem(`quiz_score_${quiz.id}`);
    if (cached) {
      const parsed = Number(cached);
      if (!Number.isNaN(parsed)) {
        setScore(parsed);
      }
    }
  }, [quiz]);

  useEffect(() => {
    if (!user || !quiz) return;

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'kids_progress', user.uid));
        if (cancelled || !snap.exists()) return;
        const data = snap.data() as { quizScores?: Record<string, number> };
        const remoteScore = data.quizScores?.[quiz.id];
        if (typeof remoteScore === 'number') {
          setScore(remoteScore);
          localStorage.setItem(`quiz_score_${quiz.id}`, String(remoteScore));
        }
      } catch {
        toast({
          variant: 'destructive',
          title: 'Sync Warning',
          description: 'Could not load kids progress from cloud. Using cached state.',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [db, quiz, user]);

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentIndex];
  const progress = ((currentIndex) / quiz.questions.length) * 100;

  const handleAnswer = (idx: number) => {
    setSelected(idx);
    if (idx === currentQuestion.answer) {
      setScore(s => s + 1);
    }
    setTimeout(() => {
      if (currentIndex < quiz.questions.length - 1) {
        setCurrentIndex(i => i + 1);
        setSelected(null);
      } else {
        const finalScore = score + (idx === currentQuestion.answer ? 1 : 0);
        setFinished(true);
        kidsService.saveScore(quiz.id, finalScore);
        (async () => {
          try {
            const activeUser = await ensureAuthForSaving();
            await setDoc(doc(db, 'kids_progress', activeUser.uid), {
              quizScores: {
                [quiz.id]: finalScore,
              },
              updatedAt: new Date().toISOString(),
            }, { merge: true });
          } catch {
            toast({
              variant: 'destructive',
              title: 'Save Failed',
              description: 'Could not sync kids progress to cloud. Saved locally.',
            });
          }
        })();
      }
    }, 1000);
  };

  if (finished) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-8">
      <div className="relative">
        <Trophy className="w-32 h-32 text-yellow-500 animate-bounce" />
        <Star className="absolute -top-4 -right-4 w-12 h-12 text-amber-400 fill-current animate-pulse" />
      </div>
      <div className="space-y-2">
        <h2 className="text-4xl font-black">Super Job!</h2>
        <p className="text-xl font-bold text-muted-foreground">You scored {score}/{quiz.questions.length}</p>
      </div>
      <Button className="h-16 rounded-3xl px-12 text-xl font-black shadow-xl" onClick={() => router.push('/app/kids')}>
        Back to Kids Zone
      </Button>
    </div>
  );

  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="text-right">
           <p className="text-xs font-black text-muted-foreground uppercase">Score</p>
           <p className="text-xl font-black text-primary">{score}</p>
        </div>
      </header>

      <div className="space-y-2">
        <Progress value={progress} className="h-3 rounded-full" />
        <p className="text-center text-xs font-black uppercase tracking-widest text-muted-foreground">Question {currentIndex + 1} of {quiz.questions.length}</p>
      </div>

      <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white">
        <div className="bg-amber-100 p-12 text-center">
           <h3 className="text-2xl font-black text-amber-900">{currentQuestion.question}</h3>
        </div>
        <CardContent className="p-8 grid grid-cols-1 gap-4">
           {currentQuestion.options.map((opt: string, i: number) => (
             <button 
                key={opt}
                disabled={selected !== null}
                onClick={() => handleAnswer(i)}
                className={cn(
                  "p-6 rounded-[2rem] text-lg font-bold border-2 transition-all flex items-center justify-between",
                  selected === i 
                    ? (i === currentQuestion.answer ? "bg-emerald-50 border-emerald-500 text-emerald-800" : "bg-red-50 border-red-500 text-red-800")
                    : "bg-white border-slate-100 hover:border-primary/20"
                )}
             >
               {opt}
               {selected === i && (i === currentQuestion.answer ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-red-500" />)}
             </button>
           ))}
        </CardContent>
      </Card>
    </div>
  );
}
