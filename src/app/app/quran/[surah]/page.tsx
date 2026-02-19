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
        <Button variant="ghost" size="sm" asChild className="-ml-2 rounded-full font-semibold">
          <Link href="/app/quran">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Quran
          </Link>
        </Button>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground rounded-full">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground rounded-full">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="bg-primary text-white border-none shadow-xl shadow-primary/10 overflow-hidden text-center p-10 rounded-[2.5rem] relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none islamic-pattern" />
        <CardContent className="space-y-3 relative">
          <h2 className="text-4xl font-black tracking-tight">{surah.nameEnglish}</h2>
          <p className="text-3xl font-arabic opacity-80">{surah.nameArabic}</p>
          <div className="flex items-center justify-center gap-3 pt-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white/15 px-4 py-1.5 rounded-full backdrop-blur-md">{surah.ayahCount} Ayahs</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white/15 px-4 py-1.5 rounded-full backdrop-blur-md">Surah {surah.index}</span>
          </div>
        </CardContent>
      </Card>

      <div className="sticky top-[64px] z-30 py-4 bg-background/80 backdrop-blur-xl">
        <Tabs defaultValue="en" onValueChange={setActiveTranslation} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-xs mx-auto h-11 rounded-full bg-secondary p-1">
            <TabsTrigger value="en" className="rounded-full font-bold text-xs uppercase tracking-wider">English</TabsTrigger>
            <TabsTrigger value="ur" className="rounded-full font-bold text-xs uppercase tracking-wider">Urdu</TabsTrigger>
            <TabsTrigger value="hi" className="rounded-full font-bold text-xs uppercase tracking-wider">Hindi</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4 mt-6">
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
    <div className="flex flex-col gap-6 p-6 md:p-8 rounded-[2rem] hover:bg-white transition-all border border-transparent hover:border-primary/5 group shadow-sm hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-full bg-primary/5 flex items-center justify-center text-[10px] font-black text-primary">
          {ayah.ayahNo}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-primary/40 hover:text-primary rounded-full">
            <Play className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-9 w-9 rounded-full ${isBookmarked ? 'text-primary' : 'text-primary/40'}`}
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
          <Button 
             variant="ghost" 
             size="icon" 
             className={`h-9 w-9 rounded-full ${isFavorite ? 'text-pink-500' : 'text-primary/40'}`}
             onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <p className="text-4xl arabic-font tracking-normal">
          {ayah.arabic}
        </p>
        
        <div className="space-y-3">
          <p className="text-sm font-medium italic text-muted-foreground/60 leading-relaxed">
            {ayah.transliteration}
          </p>
          <p className={`text-lg leading-relaxed font-medium ${activeTranslation === 'ur' || activeTranslation === 'hi' ? 'ur-hi-text font-bold' : ''}`}>
            {getTranslation()}
          </p>
        </div>
      </div>
    </div>
  );
}
