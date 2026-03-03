
"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Play, BookOpen } from 'lucide-react';
import { quranService, Juz } from '@/services/quranService';
import { Skeleton } from '@/components/ui/skeleton';

export default function JuzDetailPage() {
  const params = useParams();
  const router = useRouter();
  const juzId = Array.isArray(params.juzId) ? params.juzId[0] : params.juzId as string;
  const [juz, setJuz] = useState<Juz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quranService.getJuzs().then(all => {
      const found = all.find(j => j.id === juzId);
      setJuz(found || null);
      setLoading(false);
    });
  }, [juzId]);

  if (loading) return (
    <div className="space-y-6 p-4">
      <Skeleton className="h-48 w-full rounded-[2.5rem]" />
      <div className="space-y-3">
        {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
      </div>
    </div>
  );

  if (!juz) return <div className="p-10 text-center">Juz not found.</div>;

  return (
    <div className="space-y-6 pb-24">
      <Button variant="ghost" onClick={() => router.back()} className="rounded-full">
        <ChevronLeft className="w-4 h-4 mr-2" /> Back
      </Button>

      <Card className="bg-primary text-white border-none rounded-[2.5rem] p-10 text-center relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-10 islamic-pattern" />
        <CardContent className="space-y-4 relative">
          <h2 className="text-4xl font-black">Juz {juz.index}</h2>
          <p className="opacity-80 font-medium">{juz.description}</p>
          <div className="flex justify-center gap-2 pt-4">
            <Button className="bg-white text-primary font-bold rounded-full px-8" onClick={() => router.push(`/app/quran/juz/${juzId}/read`)}>Continue Reading</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-4">Content</h3>
        <Card
          className="border-none shadow-sm rounded-3xl divide-y cursor-pointer hover:bg-secondary/20 transition-colors bg-white shadow-sm"
          onClick={() => router.push(`/app/quran/juz/${juzId}/read`)}
        >
          <div className="p-6 flex items-center justify-between">
            <div>
              <p className="font-bold tracking-tight">Read Full Juz</p>
              <p className="text-xs text-muted-foreground">Starts at {juz.startSurah}, Ayah {juz.startAyah}</p>
            </div>
            <BookOpen className="w-5 h-5 text-primary opacity-40" />
          </div>
        </Card>
      </div>

      <div className="pt-8 flex items-center justify-between w-full">
        <Button variant="outline" className="rounded-2xl" disabled={juz.index <= 1} onClick={() => router.push(`/app/quran/juz/${Number(juzId) - 1}`)}>
          Previous Juz
        </Button>
        <Button variant="outline" className="rounded-2xl" disabled={juz.index >= 30} onClick={() => router.push(`/app/quran/juz/${Number(juzId) + 1}`)}>
          Next Juz
        </Button>
      </div>
    </div>
  );
}
