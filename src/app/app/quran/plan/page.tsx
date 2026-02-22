
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, Trophy, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { ensureAuthForSaving, useFirestore, useUser } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function KhatamPlanPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [completedDays, setCompletedDays] = useState(0);
  const totalDays = 30;

  useEffect(() => {
    const saved = localStorage.getItem('khatam_completed_days');
    if (saved) setCompletedDays(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'khatam_progress', user.uid));
        if (cancelled || !snap.exists()) return;
        const data = snap.data() as { completedDays?: number };
        if (typeof data.completedDays === 'number') {
          setCompletedDays(data.completedDays);
          localStorage.setItem('khatam_completed_days', String(data.completedDays));
        }
      } catch {
        toast({
          variant: 'destructive',
          title: 'Sync Warning',
          description: 'Could not load Khatam progress from cloud. Using cached state.',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [db, user]);

  const markToday = async () => {
    if (completedDays >= totalDays) return;
    const newVal = completedDays + 1;

    try {
      const activeUser = await ensureAuthForSaving();
      await setDoc(doc(db, 'khatam_progress', activeUser.uid), {
        completedDays: newVal,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setCompletedDays(newVal);
      localStorage.setItem('khatam_completed_days', newVal.toString());
      toast({
        title: "Target Achieved!",
        description: `Day ${newVal} of your Khatam plan marked as completed.`,
      });
    } catch {
      setCompletedDays(newVal);
      localStorage.setItem('khatam_completed_days', newVal.toString());
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not sync Khatam progress to cloud. Saved locally.',
      });
    }
  };

  const progress = (completedDays / totalDays) * 100;

  return (
    <div className="space-y-8 pb-24">
      <header>
        <h2 className="text-2xl font-bold">Khatam Planner</h2>
        <p className="text-muted-foreground text-sm">Track your progress to finish the Quran</p>
      </header>

      <Card className="bg-primary text-white border-none rounded-[2.5rem] overflow-hidden shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-black uppercase tracking-widest opacity-60">My Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <div className="flex justify-between items-end">
             <h3 className="text-4xl font-black">{Math.round(progress)}%</h3>
             <span className="text-sm font-bold opacity-80">{completedDays} / {totalDays} Days</span>
          </div>
          <Progress value={progress} className="h-3 bg-white/20" />
          <div className="pt-4 flex items-center gap-4">
            <div className="flex-1 bg-white/10 p-4 rounded-3xl backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase opacity-60">Days Left</p>
              <p className="text-lg font-bold">{totalDays - completedDays} Days</p>
            </div>
            <div className="flex-1 bg-white/10 p-4 rounded-3xl backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase opacity-60">Daily Target</p>
              <p className="text-lg font-bold">1 Juz</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-4">Today's Target</h3>
        <Card className="border-none shadow-sm rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h4 className="text-xl font-bold">Finish Juz {completedDays + 1}</h4>
              <p className="text-sm text-muted-foreground">Approx. 20 pages</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full h-14 rounded-2xl text-lg font-bold shadow-lg shadow-primary/10">Start Reading</Button>
            <Button variant="outline" size="lg" className="w-full h-14 rounded-2xl text-lg font-bold border-emerald-500 text-emerald-600 hover:bg-emerald-50" onClick={markToday}>
              <CheckCircle2 className="w-5 h-5 mr-2" /> Mark Today Completed
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={<Sparkles className="text-yellow-500" />} label="Streak" value={`${completedDays} Days`} />
        <StatCard icon={<Trophy className="text-amber-500" />} label="Badges" value={`${Math.floor(completedDays / 5)} Earned`} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <Card className="border-none shadow-sm rounded-3xl p-6 text-center space-y-2">
      <div className="flex justify-center">{icon}</div>
      <p className="text-[10px] font-black uppercase text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </Card>
  );
}
