
"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Target, Heart, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function RamadanDashboard() {
  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-primary">Ramadan Mubarak</h2>
        <p className="text-muted-foreground font-medium">Your spiritual journey dashboard</p>
      </header>

      <Card className="bg-gradient-to-br from-indigo-600 to-primary text-white border-none shadow-xl rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-8 space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Today's Highlight</p>
              <h3 className="text-2xl font-black">Day 1 of Ramadan</h3>
            </div>
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
              <p className="text-[10px] opacity-60 font-bold uppercase">Sehri Ends</p>
              <p className="text-xl font-black">4:52 AM</p>
            </div>
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
              <p className="text-[10px] opacity-60 font-bold uppercase">Iftar Today</p>
              <p className="text-xl font-black">6:21 PM</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/app/ramadan/calendar" className="block">
          <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] h-full">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <span className="font-bold text-sm">Calendar</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/app/ramadan/targets" className="block">
          <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] h-full">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-emerald-500" />
              </div>
              <span className="font-bold text-sm">Daily Goals</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Today's Targets</h3>
          <Link href="/app/ramadan/targets" className="text-xs font-bold text-primary flex items-center">
            View All <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <Card className="border-none shadow-sm rounded-[2rem] divide-y">
          <TargetItem label="Pray 5 Times" completed={true} />
          <TargetItem label="Read 10 Pages of Quran" completed={false} />
          <TargetItem label="Give Sadaqah" completed={false} />
        </Card>
      </section>

      <Card className="bg-amber-50 border-none rounded-[2rem] p-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
            <Heart className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900">Charity Reminder</h4>
            <p className="text-sm text-amber-800/70 font-medium">Small deeds lead to big rewards.</p>
          </div>
        </div>
        <Button className="w-full rounded-2xl bg-amber-600 hover:bg-amber-700 font-bold">Donate Now</Button>
      </Card>
    </div>
  );
}

function TargetItem({ label, completed }: { label: string, completed: boolean }) {
  return (
    <div className="p-6 flex items-center justify-between">
      <span className={cn("font-medium", completed && "line-through text-muted-foreground")}>{label}</span>
      <CheckCircle2 className={cn("w-6 h-6 transition-colors", completed ? "text-emerald-500" : "text-muted-foreground/20")} />
    </div>
  );
}

import { cn } from '@/lib/utils';
