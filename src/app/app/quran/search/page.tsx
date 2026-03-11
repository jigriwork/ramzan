
"use client"

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, History, ChevronRight, X } from 'lucide-react';
import { quranService, Surah } from '@/services/quranService';
import Link from 'next/link';

export default function QuranSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Surah[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('quran_search_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    } else {
      setHistory(['Al-Baqarah', 'Al-Fatiha']);
    }
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      quranService.searchQuran(query).then(setResults);
    } else {
      setResults([]);
    }
  }, [query]);

  const addToHistory = (q: string) => {
    if (!q || history.includes(q)) return;
    const newHistory = [q, ...history].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('quran_search_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('quran_search_history');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold">Search Surah</h2>
        <p className="text-muted-foreground text-sm">Search Surah by name or number</p>
      </header>

      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            autoFocus
            placeholder="Type to search..."
            className="pl-10 h-12 rounded-2xl shadow-sm border-none bg-white"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {query.length === 0 && history.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <History className="w-3 h-3" /> Recent Searches
            </h3>
            <button onClick={clearHistory} className="text-[10px] font-black uppercase text-red-500 hover:opacity-70 flex items-center gap-1">
              <X className="w-3 h-3" /> Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {history.map(h => (
              <button
                key={h}
                onClick={() => setQuery(h)}
                className="px-4 py-2 bg-white rounded-full text-sm font-medium shadow-sm hover:bg-secondary transition-colors"
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {results.map(surah => (
          <Link key={surah.id} href={`/app/quran/${surah.index}`} onClick={() => addToHistory(surah.nameEnglish)}>
            <Card className="hover:bg-secondary/20 transition-colors border-none shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center font-bold text-primary">
                    {surah.index}
                  </div>
                  <div>
                    <h4 className="font-bold">{surah.nameEnglish}</h4>
                    <p className="text-xs text-muted-foreground">{surah.ayahCount} Ayahs</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xl arabic-font">{surah.nameArabic}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
