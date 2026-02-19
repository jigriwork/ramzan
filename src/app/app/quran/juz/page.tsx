
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { quranService, Juz } from '@/services/quranService';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function JuzListPage() {
  const [juzs, setJuzs] = useState<Juz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    quranService.getJuzs().then(data => {
      setJuzs(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Juz (Parts)</h2>
        <p className="text-muted-foreground text-sm">The Quran divided into 30 parts</p>
      </header>

      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)
        ) : (
          juzs.map(juz => (
            <Link key={juz.id} href={`/app/quran/juz/${juz.id}`}>
              <Card className="hover:bg-secondary/20 transition-colors border-none shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center text-lg font-bold">
                      {juz.index}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Juz {juz.index}</h4>
                      <p className="text-xs text-muted-foreground">Starts at {juz.startSurah}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
