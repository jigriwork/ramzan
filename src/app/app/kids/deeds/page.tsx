
"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Star, CheckCircle2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const DEEDS = [
  { id: '1', label: 'Smile at someone', stars: 2 },
  { id: '2', label: 'Help mom or dad', stars: 5 },
  { id: '3', label: 'Read a small Surah', stars: 3 },
  { id: '4', label: 'Share a toy', stars: 4 },
  { id: '5', label: 'Feed a bird or cat', stars: 5 },
];

export default function KidsDeedsPage() {
  const router = useRouter();
  const [completed, setCompleted] = useState<string[]>([]);

  const toggle = (id: string) => {
    setCompleted(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const totalStars = DEEDS.filter(d => completed.includes(d.id)).reduce((acc, curr) => acc + curr.stars, 0);

  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="bg-amber-100 px-6 py-2 rounded-full flex items-center gap-2">
           <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
           <span className="text-xl font-black text-amber-900">{totalStars}</span>
        </div>
      </header>

      <Card className="bg-gradient-to-br from-indigo-500 to-primary text-white border-none rounded-[3rem] p-10 relative overflow-hidden">
        <Sparkles className="absolute -top-6 -right-6 w-32 h-32 opacity-10" />
        <CardContent className="space-y-4 text-center relative">
          <h2 className="text-3xl font-black">Good Deeds Tracker</h2>
          <p className="opacity-80 font-bold">Collect stars by doing super things!</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {DEEDS.map(deed => (
          <button 
            key={deed.id}
            onClick={() => toggle(deed.id)}
            className={cn(
              "p-6 rounded-[2.5rem] flex items-center justify-between transition-all border-2",
              completed.includes(deed.id) ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-50"
            )}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                completed.includes(deed.id) ? "bg-emerald-500 text-white" : "bg-slate-50 text-slate-300"
              )}>
                {completed.includes(deed.id) ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-2 h-2 rounded-full bg-current" />}
              </div>
              <span className={cn("text-lg font-black", completed.includes(deed.id) ? "text-emerald-800" : "text-slate-800")}>
                {deed.label}
              </span>
            </div>
            <div className="flex items-center gap-1 font-black text-amber-600">
               +{deed.stars} <Star className="w-4 h-4 fill-current" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
