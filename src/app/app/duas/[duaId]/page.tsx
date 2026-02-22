
"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronLeft, Heart, Copy, Share2, Volume2 } from 'lucide-react';
import { duaService, Dua } from '@/services/duaService';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useAppSettings } from '@/components/providers/app-settings-provider';
import { ensureAuthForSaving, useUser } from '@/firebase';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';

export default function DuaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useAppSettings();
  const { user } = useUser();
  const db = useFirestore();
  const [dua, setDua] = useState<Dua | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const favId = params.duaId as string;
  const favCacheKey = `fav_dua_${favId}`;

  const setFavoriteCache = (favorite: boolean) => {
    if (typeof window === 'undefined') return;
    if (favorite) {
      localStorage.setItem(favCacheKey, '1');
    } else {
      localStorage.removeItem(favCacheKey);
    }
  };

  useEffect(() => {
    duaService.getDuaById(params.duaId as string).then(data => {
      setDua(data || null);
      setLoading(false);
    });
  }, [params.duaId]);

  useEffect(() => {
    if (!user || !favId) {
      setIsFavorite(typeof window !== 'undefined' && localStorage.getItem(favCacheKey) === '1');
      return;
    }

    const favRef = doc(db, 'favorites', user.uid, 'duas', favId);
    getDoc(favRef)
      .then((snap) => {
        const exists = snap.exists();
        setIsFavorite(exists);
        setFavoriteCache(exists);
      })
      .catch(() => {
        setIsFavorite(typeof window !== 'undefined' && localStorage.getItem(favCacheKey) === '1');
        toast({
          variant: 'destructive',
          title: 'Sync Warning',
          description: 'Could not load favorite state from cloud. Using cached state.',
        });
      });
  }, [db, favCacheKey, favId, user]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Text copied to clipboard." });
  };

  const handleShare = () => {
    if (!dua) return;
    const shareData = {
      title: dua.title,
      text: `${dua.arabic}\n\n${dua.translation_en}\n\nShared via NoorRamadan`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        navigator.clipboard.writeText(shareData.url);
        toast({ title: "Link Copied", description: "Dua link copied to clipboard." });
      });
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast({ title: "Link Copied", description: "Dua link copied to clipboard." });
    }
  };

  const toggleFav = async () => {
    if (!dua) return;

    try {
      const activeUser = await ensureAuthForSaving();
      const favRef = doc(db, 'favorites', activeUser.uid, 'duas', dua.id);

      if (isFavorite) {
        await deleteDoc(favRef);
        setIsFavorite(false);
        setFavoriteCache(false);
        toast({ title: "Removed", description: "Updated your favorites." });
        return;
      }

      await setDoc(favRef, {
        duaId: dua.id,
        createdAt: new Date().toISOString(),
      }, { merge: true });
      setIsFavorite(true);
      setFavoriteCache(true);
      toast({ title: "Saved", description: "Updated your favorites." });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not update favorite in cloud right now.',
      });
    }
  };

  if (loading) return <div className="p-8 space-y-6"><Skeleton className="h-64 w-full rounded-[2.5rem]" /><Skeleton className="h-40 w-full" /></div>;
  if (!dua) return <div className="p-10 text-center">Dua not found.</div>;

  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleShare}>
            <Share2 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className={`rounded-full ${isFavorite ? 'text-pink-500 bg-pink-50' : ''}`} onClick={toggleFav}>
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </header>

      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
        <div className="bg-primary p-10 text-center space-y-4">
          <h2 className="text-2xl font-black text-white">{dua.title}</h2>
          <span className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase text-white tracking-widest">{dua.category}</span>
        </div>
        <CardContent className="p-10 space-y-10 text-center">
          <p className="text-5xl leading-loose arabic-font">{dua.arabic}</p>
          
          <div className="space-y-8 pt-8 border-t border-dashed">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2">Transliteration</p>
              <p className="text-lg italic font-medium text-muted-foreground">{dua.transliteration}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-2">Translation</p>
              <p className="text-xl font-bold leading-relaxed">
                {language === 'ur' ? dua.translation_ur : language === 'hi' ? dua.translation_hi : dua.translation_en}
              </p>
            </div>
          </div>
          <div className="flex justify-center pt-6">
             <Button variant="secondary" className="rounded-full px-8" onClick={() => handleCopy(dua.arabic)}>
               <Copy className="w-4 h-4 mr-2" /> Copy Arabic
             </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-4">Audio</h3>
        <Card className="border-none shadow-sm rounded-3xl p-6 bg-white flex items-center justify-between">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center">
               <Volume2 className="w-5 h-5 text-primary" />
             </div>
             <div>
               <p className="font-bold">Play Recitation</p>
               <p className="text-xs text-muted-foreground">Premium audio coming soon</p>
             </div>
           </div>
           <Button variant="ghost" size="icon" className="rounded-full" onClick={() => toast({ title: "Coming Soon", description: "Audio recitations are being prepared." })}>
             <ChevronLeft className="w-5 h-5 rotate-180 opacity-30" />
           </Button>
        </Card>
      </section>
    </div>
  );
}
