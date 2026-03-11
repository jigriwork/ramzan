
"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Target, Heart, Sparkles, ChevronRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { ramadanService } from '@/services/ramadanService';
import { useFirestore, useUser } from '@/firebase';
import { useAppSettings } from '@/components/providers/app-settings-provider';
import { locationService } from '@/services/locationService';
import { timingsService } from '@/services/timingsService';
import { settingsService } from '@/services/settingsService';

export default function RamadanDashboard() {
  const db = useFirestore();
  const { user } = useUser();
  const { city } = useAppSettings();
  const [loading, setLoading] = useState(true);
  const [ramadanInfo, setRamadanInfo] = useState(ramadanService.getCurrentRamadanInfo());
  const [sehriTime, setSehriTime] = useState('--:--');
  const [iftarTime, setIftarTime] = useState('--:--');

  const format12h = (time24: string | undefined) => {
    if (!time24) return '--:--';
    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${minutesStr} ${period}`;
  };

  const loadTimings = async () => {
    try {
      const detected = await locationService.detectLocation({
        db,
        uid: user?.uid,
        preferredCity: city || undefined,
      });
      const method = settingsService.getCalculationMethod();
      const response = await timingsService.getPrayerTimes({
        lat: detected.latitude,
        lon: detected.longitude,
        method,
      });
      setSehriTime(format12h(response.fajr));
      setIftarTime(format12h(response.maghrib));
    } catch {
      setSehriTime('--:--');
      setIftarTime('--:--');
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      await loadTimings();
      if (!cancelled) {
        setRamadanInfo(ramadanService.getCurrentRamadanInfo());
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [city, user?.uid]);

  if (loading) return (
    <div className="space-y-8 pb-24">
      <Skeleton className="h-64 w-full rounded-[2.5rem]" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full rounded-[2rem]" />
        <Skeleton className="h-24 w-full rounded-[2rem]" />
      </div>
      <Skeleton className="h-48 w-full rounded-[2rem]" />
    </div>
  );

  return (
    <div className="space-y-8 pb-24">
      <header className="flex flex-col gap-1">
        <h2 className="text-3xl font-black text-primary">Ramadan Mubarak</h2>
        <p className="text-muted-foreground font-medium">Your spiritual journey dashboard</p>
      </header>

      <Card className="bg-gradient-to-br from-indigo-600 to-primary text-white border-none shadow-xl rounded-[2.5rem] overflow-hidden relative">
        <div className="absolute inset-0 islamic-pattern opacity-10" />
        <CardContent className="p-8 space-y-6 relative">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Ramadan 1446 AH</p>
              <h3 className="text-2xl font-black">Day {ramadanInfo.day}: {ramadanInfo.ashra}</h3>
            </div>
            <Sparkles className="w-6 h-6 text-yellow-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
              <p className="text-[10px] opacity-60 font-bold uppercase">Sehri Ends</p>
              <p className="text-xl font-black">{sehriTime}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md">
              <p className="text-[10px] opacity-60 font-bold uppercase">Iftar Today</p>
              <p className="text-xl font-black">{iftarTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Link href="/app/ramadan/calendar" className="block">
          <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] h-full bg-blue-50">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-500 shadow-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="font-bold text-sm">Calendar</span>
            </CardContent>
          </Card>
        </Link>
        <Link href="/app/ramadan/targets" className="block">
          <Card className="border-none shadow-sm hover:shadow-md transition-all rounded-[2rem] h-full bg-emerald-50">
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                <Target className="w-6 h-6" />
              </div>
              <span className="font-bold text-sm">Daily Goals</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Today's Focus</h3>
          <Link href="/app/ramadan/targets" className="text-xs font-bold text-primary flex items-center">
            View Targets <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <Card className="border-none shadow-sm rounded-[2rem] divide-y overflow-hidden bg-white">
          <div className="p-6 flex items-center justify-between">
            <span className="font-bold text-lg">Pray 5 Times</span>
            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="p-6 flex items-center justify-between">
            <span className="font-bold text-lg">Read Quran (10p)</span>
            <CheckCircle2 className="w-6 h-6 text-slate-200" />
          </div>
        </Card>
      </section>

      <Card className="bg-amber-50 border-none rounded-[2.5rem] p-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center">
            <Heart className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 text-lg">Charity Reminder</h4>
            <p className="text-sm text-amber-800/70 font-medium">Prophet (SAW) was most generous in Ramadan.</p>
          </div>
        </div>
        <Button className="w-full rounded-2xl h-14 bg-amber-600 hover:bg-amber-700 font-black shadow-lg shadow-amber-200">Give Sadaqah</Button>
      </Card>
    </div>
  );
}
