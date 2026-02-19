
"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Trophy, CheckCircle2, Star, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ramadanService } from '@/services/ramadanService';
import { useAppSettings } from '@/components/providers/app-settings-provider';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function RamadanTargetsPage() {
  const router = useRouter();
  const { mode } = useAppSettings();
  const [tasks, setTasks] = useState<any[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ramadanService.getChecklist().then(data => {
      setTasks(data);
      setCompleted(ramadanService.getCompletion(1)); // Mock day 1
      setLoading(false);
    });
  }, []);

  const toggleTask = (id: string) => {
    const newCompleted = completed.includes(id) 
      ? completed.filter(i => i !== id) 
      : [...completed, id];
    setCompleted(newCompleted);
    ramadanService.saveCompletion(1, newCompleted);
  };

  const progress = tasks.length > 0 ? (completed.length / tasks.length) * 100 : 0;

  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-3xl font-black text-primary">{mode === 'kids' ? 'Super Deeds' : 'Daily Targets'}</h2>
          <p className="text-muted-foreground font-medium">Strive for excellence today</p>
        </div>
      </header>

      <Card className="bg-primary text-white border-none rounded-[2.5rem] p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Trophy className="w-32 h-32" />
        </div>
        <CardContent className="space-y-6 relative">
          <div className="flex justify-between items-end">
             <div>
               <p className="text-[10px] font-black uppercase opacity-60 mb-1">Today's Progress</p>
               <h3 className="text-4xl font-black">{Math.round(progress)}%</h3>
             </div>
             <div className="text-right">
               <p className="text-[10px] font-black uppercase opacity-60 mb-1">Current Streak</p>
               <p className="text-xl font-bold flex items-center justify-end gap-1"><Star className="w-5 h-5 fill-amber-400 text-amber-400" /> 5 Days</p>
             </div>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-4">Task Checklist</h3>
        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-3xl" />)
          ) : (
            tasks.map(task => (
              <button 
                key={task.id} 
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "p-6 rounded-[2rem] border-none shadow-sm flex items-center justify-between transition-all",
                  completed.includes(task.id) ? "bg-emerald-50 text-emerald-800" : "bg-white hover:bg-secondary/50"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-2xl flex items-center justify-center",
                    completed.includes(task.id) ? "bg-emerald-500 text-white" : "bg-secondary text-primary/30"
                  )}>
                    {completed.includes(task.id) ? <CheckCircle2 className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                  </div>
                  <span className="font-bold text-lg">{task.label}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
