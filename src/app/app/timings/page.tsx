
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, CalendarDays, Clock, Loader2, Settings2 } from 'lucide-react';
import { useAppSettings } from '@/components/providers/app-settings-provider';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';
import { locationService, type DetectedLocation } from '@/services/locationService';
import { timingsService, type PrayerTimesResult } from '@/services/timingsService';
import { settingsService } from '@/services/settingsService';
import { useFirestore, useUser } from '@/firebase';

export default function TimingsPage() {
  const { city, setCity } = useAppSettings();
  const db = useFirestore();
  const { user } = useUser();
  const [searchInput, setSearchInput] = useState('');
  const [timings, setTimings] = useState<PrayerTimesResult | null>(null);
  const [locationInfo, setLocationInfo] = useState<DetectedLocation | null>(null);
  const [offlineTimingsShown, setOfflineTimingsShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentDateDisplay, setCurrentDateDisplay] = useState<string>('');

  useEffect(() => {
    // Prevent hydration mismatch by setting the date display after mount
    setCurrentDateDisplay(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }));
  }, []);

  const fetchTimings = async (forceRefreshLocation = false) => {
    setLoading(true);
    try {
      const detected = await locationService.detectLocation({
        db,
        uid: user?.uid,
        preferredCity: city || undefined,
        forceRefresh: forceRefreshLocation,
      });
      const method = settingsService.getCalculationMethod();
      const response = await timingsService.getPrayerTimes({
        lat: detected.latitude,
        lon: detected.longitude,
        method,
      });
      setLocationInfo(detected);
      setTimings(response);
      setOfflineTimingsShown(Boolean(response.isOfflineFallback));
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch timings." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTimings();
  }, [city, user?.uid]);

  useEffect(() => {
    const onSettingsUpdated = (e: Event) => {
      const detail = (e as CustomEvent<{ calculationMethod?: number }>).detail;
      if (typeof detail?.calculationMethod === 'number') {
        void fetchTimings();
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
        void fetchTimings();
      }
    }, 60000);
    return () => clearInterval(timer);
  }, [city, user?.uid]);

  useEffect(() => {
    const locationTimer = setInterval(() => {
      void fetchTimings(true);
    }, 10 * 60 * 1000);
    return () => clearInterval(locationTimer);
  }, [city, user?.uid]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCity(searchInput.trim());
    }
  };

  const format12h = (time24: string | undefined) => {
    if (!time24) return '--:--';
    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${minutesStr} ${period}`;
  };

  const formattedTimings = timings ? [
    { name: 'Fajr', time: format12h(timings.fajr) },
    { name: 'Sunrise', time: format12h(timings.sunrise) },
    { name: 'Dhuhr', time: format12h(timings.dhuhr) },
    { name: 'Asr', time: format12h(timings.asr) },
    { name: 'Maghrib (Iftar)', time: format12h(timings.maghrib) },
    { name: 'Isha', time: format12h(timings.isha) },
  ] : [];

  return (
    <div className="space-y-6 pb-24">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-headline font-bold text-primary">Prayer Timings</h2>
        <p className="text-muted-foreground">Accurate timings for {locationInfo?.city || city || 'Makkah'}, {locationInfo?.country || 'Saudi Arabia'}</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <Link href="/app/timings/method">
          <Card className="bg-secondary/30 border-none rounded-[2rem] p-6 hover:bg-secondary/50 transition-all flex items-center justify-between group">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary">
                 <Settings2 className="w-5 h-5" />
               </div>
               <div>
                 <p className="font-bold">Calculation Method</p>
                 <p className="text-xs text-muted-foreground font-medium">Adjust settings for your region</p>
               </div>
             </div>
             <Settings2 className="w-5 h-5 opacity-20 group-hover:opacity-100 transition-opacity" />
          </Card>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="Enter city (e.g. Berhampur)..." 
          className="pl-10 h-12 rounded-2xl" 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button type="submit" size="sm" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 text-primary font-bold">
          Search
        </Button>
      </form>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium">Fetching accurate timings...</p>
        </div>
      ) : (
        <>
          <Card className="border-none shadow-md overflow-hidden rounded-[2.5rem]">
            <CardHeader className="flex flex-row items-center justify-between bg-primary/5 px-8">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" /> Today's Schedule
              </CardTitle>
              <span className="text-sm font-bold text-primary px-3 py-1 rounded-full italic">{currentDateDisplay || "Loading..."}</span>
            </CardHeader>
            <CardContent className="p-0">
              {offlineTimingsShown && (
                <p className="px-6 py-3 text-[11px] font-medium text-muted-foreground border-b bg-secondary/20">Offline timings shown</p>
              )}
              <div className="divide-y">
                {formattedTimings.map((prayer) => (
                  <div key={prayer.name} className="flex items-center justify-between p-6 hover:bg-secondary/10 transition-colors">
                    <p className="font-bold">{prayer.name}</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xl font-headline font-black">{prayer.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
