
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, CalendarDays, Clock, Loader2 } from 'lucide-react';
import { useAppSettings } from '@/components/providers/app-settings-provider';
import { toast } from '@/hooks/use-toast';

export default function TimingsPage() {
  const { city, setCity } = useAppSettings();
  const [searchInput, setSearchInput] = useState('');
  const [timings, setTimings] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchTimings = async (cityName: string) => {
    if (!cityName) return;
    setLoading(true);
    try {
      // Method 1 with adjustment=-1 for accurate Indian Hijri dating
      const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${cityName}&country=India&method=1&adjustment=-1`);
      const data = await response.json();
      if (data.code === 200) {
        setTimings(data.data.timings);
      } else {
        toast({ variant: "destructive", title: "City Not Found", description: "Please check the spelling." });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch timings." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (city) {
      fetchTimings(city);
    } else {
      fetchTimings('Berhampur');
    }
  }, [city]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCity(searchInput.trim());
      fetchTimings(searchInput.trim());
    }
  };

  const format12h = (time24: string) => {
    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${minutesStr} ${period}`;
  };

  const formattedTimings = timings ? [
    { name: 'Fajr', time: format12h(timings.Fajr) },
    { name: 'Sunrise', time: format12h(timings.Sunrise) },
    { name: 'Dhuhr', time: format12h(timings.Dhuhr) },
    { name: 'Asr', time: format12h(timings.Asr) },
    { name: 'Maghrib (Iftar)', time: format12h(timings.Maghrib) },
    { name: 'Isha', time: format12h(timings.Isha) },
  ] : [];

  return (
    <div className="space-y-6 pb-10">
      <section className="flex flex-col gap-2">
        <h2 className="text-3xl font-headline font-bold text-primary">Prayer Timings</h2>
        <p className="text-muted-foreground">Accurate timings for {city || 'Berhampur'}, India</p>
      </section>

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
          <Card className="border-none shadow-md overflow-hidden rounded-[2rem]">
            <CardHeader className="flex flex-row items-center justify-between bg-primary/5 px-8">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary" /> Today's Schedule
              </CardTitle>
              <span className="text-sm font-bold text-primary px-3 py-1 rounded-full italic">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {formattedTimings.map((prayer) => (
                  <div 
                    key={prayer.name} 
                    className={`flex items-center justify-between p-6 transition-colors`}
                  >
                    <div>
                      <p className={`font-bold`}>{prayer.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className={`w-4 h-4 text-muted-foreground`} />
                      <span className={`text-xl font-headline font-black`}>{prayer.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/20 border-none rounded-[2rem]">
            <CardContent className="p-8 text-center space-y-2">
              <p className="text-sm text-muted-foreground">Current Selection</p>
              <p className="text-xl font-headline font-bold">{city || 'Berhampur'}, India</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
