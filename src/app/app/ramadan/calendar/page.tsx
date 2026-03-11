
"use client"

import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ramadanService, type RamadanDayCompletion } from '@/services/ramadanService';
import { useUser } from '@/firebase';
import { toast } from '@/hooks/use-toast';

export default function RamadanCalendarPage() {
  const router = useRouter();
  const { user } = useUser();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [completionByDay, setCompletionByDay] = useState<Record<number, RamadanDayCompletion>>({});

  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const ramadanYear = new Date().getFullYear();

  const selectedAshra = useMemo(() => {
    const day = selectedDay || 1;
    if (day <= 10) return 'Mercy';
    if (day <= 20) return 'Forgiveness';
    return 'Protection';
  }, [selectedDay]);

  useEffect(() => {
    if (!user?.uid) return;
    void ramadanService.syncLocalCalendarToCloud({ uid: user.uid, year: ramadanYear });
  }, [user?.uid, ramadanYear]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        days.map(async (day) => {
          const value = await ramadanService.getCalendarDayCompletion({
            day,
            year: ramadanYear,
            uid: user?.uid,
          });
          return [day, value] as const;
        })
      );

      if (cancelled) return;
      const next: Record<number, RamadanDayCompletion> = {};
      entries.forEach(([day, value]) => {
        next[day] = value;
      });
      setCompletionByDay(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [ramadanYear, user?.uid]);

  const markSelectedDayCompleted = async () => {
    if (!selectedDay) return;
    const nextCompleted = !(completionByDay[selectedDay]?.completed);
    await ramadanService.saveCalendarDayCompletion({
      day: selectedDay,
      completed: nextCompleted,
      year: ramadanYear,
      uid: user?.uid,
    });

    setCompletionByDay((prev) => ({
      ...prev,
      [selectedDay]: {
        completed: nextCompleted,
        completedAt: nextCompleted ? new Date().toISOString() : null,
      },
    }));

    toast({
      title: nextCompleted ? 'Completed' : 'Undone',
      description: `Day ${selectedDay} progress has been saved.`,
    });
  };

  const completedCount = useMemo(() => {
    return Object.values(completionByDay).filter(d => d.completed).length;
  }, [completionByDay]);
  const remainingCount = 30 - completedCount;

  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-3xl font-black text-primary">Calendar</h2>
          <p className="text-muted-foreground font-medium">Your Ramadan 1446 AH progress</p>
          <p className="text-sm font-bold text-emerald-600 mt-1">{completedCount}/30 Days Completed &bull; {remainingCount} Remaining</p>
        </div>
      </header>

      <div className="grid grid-cols-5 gap-3">
        {days.map(day => (
          (() => {
            const isCompleted = Boolean(completionByDay[day]?.completed);
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "h-24 rounded-3xl flex flex-col items-center justify-center gap-1 transition-all",
                  isCompleted ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-muted-foreground hover:bg-secondary"
                )}
              >
                <div className="flex items-center gap-1">
                  <span className="text-xs font-black opacity-60 uppercase">Day</span>
                  <span className="text-xl font-black">{day}</span>
                </div>
                <div className="flex items-center gap-1 opacity-90">
                  {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                  <span className="text-[10px] font-bold uppercase tracking-wider">{isCompleted ? "Completed" : "Not Completed"}</span>
                </div>
              </button>
            );
          })()
        ))}
      </div>

      <Card className="bg-secondary/20 border-none rounded-[2.5rem] p-8 text-center space-y-4">
        <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
        <h3 className="font-bold">Next Ashra: Maghfirah</h3>
        <p className="text-sm text-muted-foreground">You are in the first 10 days of Mercy (Rahmah).</p>
      </Card>

      <Sheet open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
        <SheetContent side="bottom" className="rounded-t-[3rem] p-10 h-[60vh]">
          <SheetHeader className="text-center space-y-2">
            <SheetTitle className="text-3xl font-black">Day {selectedDay}</SheetTitle>
            <SheetDescription className="text-lg font-bold text-primary">Ashra of {selectedAshra}</SheetDescription>
          </SheetHeader>
          <div className="mt-10 space-y-8 text-center">
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dua of the Day</p>
              <p className="text-2xl arabic-font">رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ خَيْرُ الرَّاحِمِينَ</p>
              <p className="text-sm font-medium italic">"My Lord, forgive and have mercy, for You are the best of those who show mercy."</p>
            </div>
            <div className="flex justify-center">
              <Button className={cn("rounded-full px-10 h-14 text-lg font-bold shadow-xl", selectedDay && completionByDay[selectedDay]?.completed ? "bg-secondary text-foreground hover:bg-secondary/80 shadow-none" : "shadow-primary/20")} onClick={markSelectedDayCompleted}>
                {selectedDay && completionByDay[selectedDay]?.completed ? 'Undo' : 'Mark Completed'}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
