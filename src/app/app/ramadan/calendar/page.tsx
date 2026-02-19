
"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, CheckCircle2, Moon, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export default function RamadanCalendarPage() {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  
  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-3xl font-black text-primary">Calendar</h2>
          <p className="text-muted-foreground font-medium">Your Ramadan 1446 AH progress</p>
        </div>
      </header>

      <div className="grid grid-cols-5 gap-3">
        {days.map(day => (
          <button 
            key={day}
            onClick={() => setSelectedDay(day)}
            className={cn(
              "h-20 rounded-3xl flex flex-col items-center justify-center gap-1 transition-all",
              day <= 5 ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-white text-muted-foreground hover:bg-secondary"
            )}
          >
            <span className="text-xs font-black opacity-50 uppercase">Day</span>
            <span className="text-xl font-black">{day}</span>
            {day <= 5 && <CheckCircle2 className="w-3 h-3 text-white/60" />}
          </button>
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
            <SheetDescription className="text-lg font-bold text-primary">Ashra of Mercy</SheetDescription>
          </SheetHeader>
          <div className="mt-10 space-y-8 text-center">
             <div className="space-y-4">
               <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dua of the Day</p>
               <p className="text-2xl arabic-font">رَبِّ اغْفِرْ وَارْحَمْ وَأَنْتَ خَيْرُ الرَّاحِمِينَ</p>
               <p className="text-sm font-medium italic">"My Lord, forgive and have mercy, for You are the best of those who show mercy."</p>
             </div>
             <div className="flex justify-center">
               <Button className="rounded-full px-10 h-14 text-lg font-bold shadow-xl shadow-primary/20">Mark Completed</Button>
             </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
