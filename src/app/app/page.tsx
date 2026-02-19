"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Heart, BookOpen, BookOpenText, Sparkles, Loader2 } from 'lucide-react';
import { useAppSettings } from '@/components/providers/app-settings-provider';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, limit, doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomeDashboard() {
  const { city } = useAppSettings();
  const { user } = useUser();
  const db = useFirestore();
  const [timings, setTimings] = useState<any>(null);
  const [hijri, setHijri] = useState<any>(null);
  const [loadingTimings, setLoadingTimings] = useState(false);

  // Fetch User Profile for lastRead
  const userRef = useMemoFirebase(() => (user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: userProfile } = useDoc(userRef);

  // Fetch a random Dua for the day
  const duasQuery = useMemoFirebase(() => query(collection(db, 'duas'), limit(1)), [db]);
  const { data: duas, isLoading: loadingDuas } = useCollection(duasQuery);
  const todayDua = duas?.[0];

  useEffect(() => {
    async function fetchTimings() {
      const targetCity = city || 'Berhampur';
      setLoadingTimings(true);
      try {
        const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${targetCity}&country=India&method=2`);
        const data = await response.json();
        if (data.code === 200) {
          setTimings(data.data.timings);
          setHijri(data.data.date.hijri);
        }
      } catch (error) {
        console.error("Failed to fetch timings", error);
      } finally {
        setLoadingTimings(false);
      }
    }
    fetchTimings();
  }, [city]);

  const iftarTime = timings?.Maghrib || "--:--";
  const displayCity = city || "Berhampur";
  
  const isRamadan = hijri?.month?.en === "Ramaḍān" || hijri?.month?.en === "Ramadan";
  const hijriDisplay = hijri ? `${hijri.day} ${hijri.month.en} ${hijri.year} AH` : "Loading date...";
  const ramadanDayDisplay = isRamadan ? `Ramadan Day ${hijri.day}` : hijriDisplay;

  const lastReadSurahId = userProfile?.lastRead?.surahId;

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-1">
        <h2 className="text-3xl font-black tracking-tight">
          Salaam, {user?.displayName || (user?.isAnonymous ? "Guest" : "Traveler")}
        </h2>
        <p className="text-muted-foreground font-medium">{ramadanDayDisplay}</p>
      </section>

      <Card className="bg-primary text-white overflow-hidden border-none shadow-2xl shadow-primary/20 rounded-[2.5rem] relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <MoonPattern className="w-48 h-48" />
        </div>
        <CardHeader className="pb-2 px-8 pt-8">
          <div className="flex justify-between items-center">
            <CardTitle className="text-primary-foreground/60 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> {displayCity}
            </CardTitle>
            <Link href="/app/timings">
              <span className="text-[10px] font-black bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md uppercase tracking-wider hover:bg-white/20 transition-all cursor-pointer">
                Full Schedule
              </span>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <div className="flex flex-col items-center text-center py-6">
            <p className="text-base font-medium text-primary-foreground/60 mb-2">Iftar Today at</p>
            {loadingTimings ? (
              <Loader2 className="w-12 h-12 animate-spin my-4 opacity-50" />
            ) : (
              <h3 className="text-7xl font-black mb-8 tracking-tighter">{iftarTime}</h3>
            )}
            <div className="w-full h-px bg-white/10 mb-8" />
            <div className="flex justify-between w-full">
              <div className="text-left">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Fajr (Sehri Ends)</p>
                <p className="font-bold text-xl">{timings?.Fajr || "--:--"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Sunrise</p>
                <p className="font-bold text-xl">{timings?.Sunrise || "--:--"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <QuickActionButton icon={<BookOpen />} label="Quran" href="/app/quran" color="bg-orange-500" />
        <QuickActionButton icon={<Clock />} label="Timings" href="/app/timings" color="bg-blue-500" />
        <QuickActionButton icon={<BookOpenText />} label="Learn" href="/app/learn-namaz" color="bg-emerald-500" />
        <QuickActionButton icon={<Heart />} label="Duas" href="/app/duas" color="bg-pink-500" />
      </div>

      <Card className="border-none shadow-sm overflow-hidden group rounded-[2rem] bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-secondary/30 px-6 py-4">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary/60">
            <Sparkles className="w-3.5 h-3.5" /> Today's Dua
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase rounded-full px-4">Share</Button>
        </CardHeader>
        <CardContent className="pt-8 px-8 space-y-6">
          {loadingDuas ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : todayDua ? (
            <>
              <p className="text-3xl arabic-font">{todayDua.arabic}</p>
              <div className="space-y-2 pb-2">
                 <p className="text-sm font-medium italic text-muted-foreground/60 leading-relaxed">{todayDua.transliteration}</p>
                 <p className="text-base font-medium leading-relaxed">{todayDua.translation_en}</p>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-center py-4">Seek knowledge and keep praying.</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-[2rem]">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-sm uppercase tracking-widest text-primary/60">Your Journey</h3>
            <span className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-full italic">Continue reading</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-5 p-4 bg-white rounded-3xl shadow-sm border border-transparent hover:border-primary/10 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-0.5">Last Read</p>
                <p className="font-bold text-base">{lastReadSurahId ? `Surah ${lastReadSurahId}` : 'No recent reading'}</p>
              </div>
              <Button size="sm" variant="ghost" className="rounded-full font-black text-[10px] uppercase tracking-wider" asChild>
                <Link href={lastReadSurahId ? `/app/quran/${lastReadSurahId}` : "/app/quran"}>Open</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickActionButton({ icon, label, href, color }: { icon: React.ReactNode, label: string, href: string, color: string }) {
  const iconColorClass = `text-${color.split('-')[1]}-600`;
  const bgColorClass = `${color} bg-opacity-10`;

  return (
    <Button variant="outline" className="h-32 flex-col gap-4 rounded-[2rem] border-none bg-white shadow-sm hover:shadow-md hover:bg-white transition-all group" asChild>
      <Link href={href}>
        <div className={cn("p-4 rounded-2xl transition-all group-hover:scale-110", bgColorClass)}>
          <div className={cn("w-6 h-6", iconColorClass)}>
            {icon}
          </div>
        </div>
        <span className="font-black text-xs uppercase tracking-widest">{label}</span>
      </Link>
    </Button>
  );
}

function MoonPattern({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <path d="M50,10 A40,40 0 1,0 90,50 A30,30 0 1,1 50,10 Z" />
    </svg>
  );
}
