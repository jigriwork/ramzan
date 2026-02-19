"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { QURAN_SURAHS, QURAN_AYAH_MOCK } from '@/lib/data/seed';
import { ChevronLeft, Share2, Bookmark, Heart, Play } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function SurahDetailsPage() {
  const params = useParams();
  const surahIndex = params.surah as string;
  const surah = QURAN_SURAHS.find(s => s.index.toString() === surahIndex) || QURAN_SURAHS[0];
  const [activeTranslation, setActiveTranslation] = useState('en');

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href="/app/quran">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Quran
          </Link>
        </Button>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="bg-primary text-white border-none shadow-xl shadow-primary/20 overflow-hidden text-center p-10">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <CardContent className="space-y-2 relative">
          <h2 className="text-4xl font-headline font-black">{surah.nameEnglish}</h2>
          <p className="text-2xl font-bold arabic-font opacity-80">{surah.nameArabic}</p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">{surah.ayahCount} Ayahs</span>
            <span className="text-xs font-bold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Surah {surah.index}</span>
          </div>
        </CardContent>
      </Card>

      <div className="sticky top-[64px] z-30 py-4 bg-background/95 backdrop-blur">
        <Tabs defaultValue="en" onValueChange={setActiveTranslation} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-sm mx-auto h-12 rounded-2xl bg-secondary/50 p-1">
            <TabsTrigger value="en" className="rounded-xl font-bold">English</TabsTrigger>
            <TabsTrigger value="ur" className="rounded-xl font-bold">Urdu</TabsTrigger>
            <TabsTrigger value="hi" className="rounded-xl font-bold">Hindi</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-8 mt-6">
        {QURAN_AYAH_MOCK.filter(a => a.surahId === surah.id).map((ayah) => (
          <AyahRow key={ayah.ayahNo} ayah={ayah} activeTranslation={activeTranslation} />
        ))}
      </div>
    </div>
  );
}

function AyahRow({ ayah, activeTranslation }: { ayah: any, activeTranslation: string }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const getTranslation = () => {
    switch(activeTranslation) {
      case 'ur': return ayah.translation_ur;
      case 'hi': return ayah.translation_hi;
      default: return ayah.translation_en;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 rounded-3xl hover:bg-primary/5 transition-colors border border-transparent hover:border-primary/10 group">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 flex items-center justify-center text-xs font-bold text-primary/60">
          {ayah.ayahNo}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary/60 hover:text-primary rounded-full">
            <Play className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 rounded-full ${isBookmarked ? 'text-primary' : 'text-primary/60'}`}
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
          <Button 
             variant="ghost" 
             size="icon" 
             className={`h-8 w-8 rounded-full ${isFavorite ? 'text-pink-500' : 'text-primary/60'}`}
             onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <p className="text-3xl leading-loose text-right font-bold arabic-font tracking-wide">
          {ayah.arabic}
        </p>
        
        <div className="space-y-3">
          <p className="text-sm font-medium italic text-primary/60 leading-relaxed">
            {ayah.transliteration}
          </p>
          <p className={`text-lg leading-relaxed ${activeTranslation === 'ur' || activeTranslation === 'hi' ? 'font-bold' : ''}`}>
            {getTranslation()}
          </p>
        </div>
      </div>
    </div>
  );
}