
"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { ChevronLeft, Share2, Bookmark, Heart, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppSettings } from '@/components/providers/app-settings-provider';

export default function SurahDetailsPage() {
  const params = useParams();
  const surahIndex = Number(params.surah);
  const { user } = useUser();
  const db = useFirestore();
  const { ensureGuestAuth } = useAppSettings();
  const [activeTranslation, setActiveTranslation] = useState('en');
  const [surah, setSurah] = useState<any>(null);

  // Fetch Surah info
  useEffect(() => {
    const surahRef = query(collection(db, 'quran_surahs'), where('index', '==', surahIndex));
    getDoc(doc(db, 'quran_surahs', String(surahIndex))).then(snap => {
      // For simple indexing, assuming ID is index for seeded data
    });
    // Fallback: finding in seeded list if not loaded yet
  }, [surahIndex, db]);

  const ayahsQuery = useMemoFirebase(() => {
    return query(
      collection(db, 'quran_ayahs'),
      where('surahId', '==', String(surahIndex)),
      orderBy('ayahNo', 'asc')
    );
  }, [db, surahIndex]);

  const { data: ayahs, isLoading } = useCollection(ayahsQuery);

  // Update last read
  useEffect(() => {
    if (user) {
      setDoc(doc(db, 'users', user.uid), {
        lastRead: { surahId: String(surahIndex), updatedAt: new Date().toISOString() }
      }, { merge: true });
    }
  }, [user, surahIndex, db]);

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
        </div>
      </div>

      <Card className="bg-primary text-white border-none shadow-xl shadow-primary/10 overflow-hidden text-center p-10 rounded-[2.5rem] relative">
        <div className="absolute inset-0 opacity-5 pointer-events-none islamic-pattern" />
        <CardContent className="space-y-3 relative">
          <h2 className="text-4xl font-black tracking-tight">Surah {surahIndex}</h2>
          <div className="flex items-center justify-center gap-3 pt-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white/15 px-4 py-1.5 rounded-full backdrop-blur-md">Noble Quran</span>
          </div>
        </CardContent>
      </Card>

      <div className="sticky top-[64px] z-30 py-4 bg-background/80 backdrop-blur-xl border-b border-transparent">
        <Tabs defaultValue="en" onValueChange={setActiveTranslation} className="w-full">
          <TabsList className="grid grid-cols-3 w-full max-w-xs mx-auto h-11 rounded-full bg-secondary p-1">
            <TabsTrigger value="en" className="rounded-full font-bold text-xs uppercase tracking-wider">English</TabsTrigger>
            <TabsTrigger value="ur" className="rounded-full font-bold text-xs uppercase tracking-wider">Urdu</TabsTrigger>
            <TabsTrigger value="hi" className="rounded-full font-bold text-xs uppercase tracking-wider">Hindi</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4 mt-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-white space-y-6 shadow-sm">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))
        ) : ayahs?.map((ayah) => (
          <AyahRow key={ayah.id} ayah={ayah} activeTranslation={activeTranslation} ensureGuestAuth={ensureGuestAuth} />
        ))}
      </div>
    </div>
  );
}

function AyahRow({ ayah, activeTranslation, ensureGuestAuth }: { ayah: any, activeTranslation: string, ensureGuestAuth: any }) {
  const db = useFirestore();
  const { user } = useUser();
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (user) {
      const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', `${ayah.surahId}_${ayah.ayahNo}`);
      getDoc(bookmarkRef).then(snap => setIsBookmarked(snap.exists()));
    }
  }, [user, ayah, db]);

  const handleBookmark = async () => {
    const uid = await ensureGuestAuth();
    const ref = doc(db, 'users', uid, 'bookmarks', `${ayah.surahId}_${ayah.ayahNo}`);
    if (isBookmarked) {
      await deleteDoc(ref);
      setIsBookmarked(false);
    } else {
      await setDoc(ref, { 
        surahId: ayah.surahId, 
        ayahNo: ayah.ayahNo, 
        createdAt: new Date().toISOString() 
      });
      setIsBookmarked(true);
    }
  };

  const getTranslation = () => {
    switch(activeTranslation) {
      case 'ur': return ayah.translation_ur;
      case 'hi': return ayah.translation_hi;
      default: return ayah.translation_en;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-8 rounded-[2rem] bg-white transition-all border border-transparent hover:border-primary/5 group shadow-sm hover:shadow-md">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-[10px] font-black text-primary">
          {ayah.ayahNo}
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-10 w-10 rounded-full ${isBookmarked ? 'text-primary bg-primary/10' : 'text-primary/40'}`}
            onClick={handleBookmark}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <p className="text-4xl arabic-font tracking-normal leading-[1.8]">
          {ayah.arabic}
        </p>
        
        <div className="space-y-4 pt-4 border-t border-dashed">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40">Transliteration</p>
          <p className="text-sm font-medium italic text-muted-foreground/60 leading-relaxed">
            {ayah.transliteration}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40">Translation</p>
          <p className={`text-xl leading-relaxed font-medium ${activeTranslation === 'ur' || activeTranslation === 'hi' ? 'ur-hi-text font-bold' : ''}`}>
            {getTranslation()}
          </p>
        </div>
      </div>
    </div>
  );
}
