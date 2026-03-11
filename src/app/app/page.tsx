
"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Heart, BookOpen, BookOpenText, Sparkles, Loader2, Share2, Compass } from 'lucide-react';
import { useAppSettings } from '@/components/providers/app-settings-provider';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, limit, doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { locationService, type DetectedLocation } from '@/services/locationService';
import { timingsService, type PrayerTimesResult } from '@/services/timingsService';
import { settingsService } from '@/services/settingsService';

export default function HomeDashboard() {
  const { city } = useAppSettings();
  const { user } = useUser();
  const db = useFirestore();
  const [timings, setTimings] = useState<PrayerTimesResult | null>(null);
  const [loadingTimings, setLoadingTimings] = useState(false);
  const [offlineTimingsShown, setOfflineTimingsShown] = useState(false);
  const [locationInfo, setLocationInfo] = useState<DetectedLocation | null>(null);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Real-time update for time and day transitions
  useEffect(() => {
    const initialDate = new Date();
    setCurrentTime(initialDate);
    const initialDay = initialDate.getDate();

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      // Check if the day has changed to reload regional data
      if (now.getDate() !== initialDay) {
        window.location.reload();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch User Profile for lastRead
  const userRef = useMemoFirebase(() => (user ? doc(db, 'users', user.uid) : null), [db, user]);
  const { data: userProfile } = useDoc(userRef);

  // Fetch Duas and handle daily rotation
  const duasQuery = useMemoFirebase(() => query(collection(db, 'duas')), [db]);
  const { data: allDuas, isLoading: loadingDuas } = useCollection(duasQuery);

  const [todayDua, setTodayDua] = useState<any>(null);

  useEffect(() => {
    if (allDuas && allDuas.length > 0) {
      // Calculate day of year to rotate dua daily
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);

      const index = dayOfYear % allDuas.length;
      setTodayDua(allDuas[index]);
    }
  }, [allDuas]);

  const loadPrayerData = async (forceRefreshLocation = false) => {
    setLoadingTimings(true);
    try {
      const detected = await locationService.detectLocation({
        db,
        uid: user?.uid,
        forceRefresh: forceRefreshLocation,
      });
      const method = settingsService.getCalculationMethod();
      const prayerTimes = await timingsService.getPrayerTimes({
        lat: detected.latitude,
        lon: detected.longitude,
        method,
      });
      setLocationInfo(detected);
      setTimings(prayerTimes);
      setOfflineTimingsShown(Boolean(prayerTimes.isOfflineFallback));
    } catch {
      toast({
        variant: 'destructive',
        title: 'Timings unavailable',
        description: 'Could not load prayer timings right now.',
      });
    } finally {
      setLoadingTimings(false);
    }
  };

  useEffect(() => {
    void loadPrayerData();
  }, [city, user?.uid]);

  useEffect(() => {
    const onSettingsUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ calculationMethod?: number }>).detail;
      if (typeof detail?.calculationMethod === 'number') {
        void loadPrayerData();
      }
    };
    window.addEventListener('app-settings-updated', onSettingsUpdated as EventListener);
    return () => {
      window.removeEventListener('app-settings-updated', onSettingsUpdated as EventListener);
    };
  }, [city, user?.uid]);

  useEffect(() => {
    let lastDay = new Date().toDateString();
    let lastMethod = settingsService.getCalculationMethod();
    const timer = setInterval(() => {
      const now = new Date();
      const currentDay = now.toDateString();
      const currentMethod = settingsService.getCalculationMethod();
      if (currentDay !== lastDay || currentMethod !== lastMethod) {
        lastDay = currentDay;
        lastMethod = currentMethod;
        void loadPrayerData();
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [city, user?.uid]);

  useEffect(() => {
    const locationTimer = setInterval(() => {
      void loadPrayerData(true);
    }, 10 * 60 * 1000);
    return () => clearInterval(locationTimer);
  }, [city, user?.uid]);

  const format12h = (time24: string | undefined) => {
    if (!time24) return "--:--";
    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${minutesStr} ${period}`;
  };

  const iftarTime = format12h(timings?.maghrib);
  const displayCity = locationInfo?.city || city || "Makkah";
  const displayCountry = locationInfo?.country || 'Saudi Arabia';
  const dateDisplay = timings?.date || "Loading date...";
  const lastReadSurahId = userProfile?.lastRead?.surahId;
  const displayName = userProfile?.name || user?.displayName || user?.email?.split('@')[0] || (user?.isAnonymous ? 'Guest' : 'Traveler');

  const handleShareDua = () => {
    if (!todayDua) return;
    const shareData = {
      title: `Today's Dua: ${todayDua.title}`,
      text: `${todayDua.arabic}\n\n${todayDua.translation_en}\n\nShared via Noor`,
      url: window.location.origin + `/app/duas/${todayDua.id}`,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        navigator.clipboard.writeText(shareData.text);
        toast({ title: "Copied!", description: "Dua copied to clipboard." });
      });
    } else {
      navigator.clipboard.writeText(shareData.text);
      toast({ title: "Copied!", description: "Dua copied to clipboard." });
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <section className="flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <h2 className="text-3xl font-black tracking-tight">
            Salaam, {displayName}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground font-bold text-primary">{dateDisplay}</p>
          <div className="w-1.5 h-1.5 bg-primary/20 rounded-full" />
          <p className="text-muted-foreground font-medium">
            {currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : "--:--"}
          </p>
        </div>
      </section>

      <Card className="bg-gradient-to-br from-primary to-primary/80 dark:from-primary/90 dark:to-primary/60 text-white overflow-hidden border-none shadow-premium-xl shadow-primary/20 rounded-[2.5rem] relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <MoonPattern className="w-48 h-48" />
        </div>
        <CardHeader className="pb-2 px-8 pt-8">
          <div className="flex justify-between items-center">
            <CardTitle className="text-primary-foreground/60 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5" /> {displayCity}, {displayCountry}
            </CardTitle>
            <Link href="/app/timings">
              <span className="text-[10px] font-black bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md uppercase tracking-wider hover:bg-white/20 transition-all cursor-pointer">
                Full Schedule
              </span>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {offlineTimingsShown && (
            <p className="text-[11px] font-bold tracking-wide text-primary-foreground/70 mb-2">Offline timings shown</p>
          )}
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
                <p className="font-bold text-xl">{format12h(timings?.fajr)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mb-1">Sunrise</p>
                <p className="font-bold text-xl">{format12h(timings?.sunrise)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <QuickActionButton icon={<Compass />} label="Qibla" href="/app/qibla" color="indigo" />
        <QuickActionButton icon={<BookOpen />} label="Quran" href="/app/quran" color="orange" />
        <QuickActionButton icon={<Clock />} label="Timings" href="/app/timings" color="blue" />
        <QuickActionButton icon={<BookOpenText />} label="Learn" href="/app/learn-namaz" color="emerald" />
        <QuickActionButton icon={<Heart />} label="Duas" href="/app/duas" color="pink" />
        <QuickActionButton icon={<Sparkles />} label="Sunnah" href="/app/sunnah" color="purple" />
      </div>

      <Card className="border-none shadow-premium-md overflow-hidden group rounded-3xl bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-secondary/30 px-6 py-4">
          <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-primary/60">
            <Sparkles className="w-3.5 h-3.5" /> Today's Dua
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase rounded-full px-4" onClick={handleShareDua}>
            <Share2 className="w-3 h-3 mr-2" /> Share
          </Button>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          {loadingDuas ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4 rounded-lg" />
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

      <Card className="border-none shadow-premium-md bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-3xl">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-sm uppercase tracking-widest text-primary/60">Your Journey</h3>
            <span className="text-[10px] font-black text-primary bg-primary/5 px-3 py-1 rounded-full italic">Continue reading</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-5 p-4 bg-card rounded-2xl shadow-premium-sm border border-transparent hover:border-primary/10 transition-all">
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center">
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

function QuickActionButton({ icon, label, href, color }: { icon: React.ReactNode, label: string, href: string, color: 'orange' | 'blue' | 'emerald' | 'pink' | 'purple' | 'indigo' }) {
  const colorStyles = {
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-500/10',
      icon: 'text-orange-500 dark:text-orange-400',
    },
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-500/10',
      icon: 'text-blue-500 dark:text-blue-400',
    },
    emerald: {
      bg: 'bg-emerald-100 dark:bg-emerald-500/10',
      icon: 'text-emerald-500 dark:text-emerald-400',
    },
    pink: {
      bg: 'bg-pink-100 dark:bg-pink-500/10',
      icon: 'text-pink-500 dark:text-pink-400',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-500/10',
      icon: 'text-purple-500 dark:text-purple-400',
    },
    indigo: {
      bg: 'bg-indigo-100 dark:bg-indigo-500/10',
      icon: 'text-indigo-500 dark:text-indigo-400',
    },
  };

  const styles = colorStyles[color];

  return (
    <Button variant="outline" className="h-32 flex-col gap-4 rounded-3xl border-none bg-card shadow-premium-md hover:shadow-premium-lg hover:bg-accent/5 hover:text-foreground transition-all group active:scale-95" asChild>
      <Link href={href}>
        <div className={cn("p-4 rounded-2xl transition-all duration-300 ease-in-out group-hover:scale-110", styles.bg)}>
          <div className={cn("w-6 h-6", styles.icon)}>
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
