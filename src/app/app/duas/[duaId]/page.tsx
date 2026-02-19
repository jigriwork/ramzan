
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

export default function DuaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { language } = useAppSettings();
  const [dua, setDua] = useState<Dua | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    duaService.getDuaById(params.duaId as string).then(data => {
      setDua(data || null);
      setLoading(false);
      const favs = duaService.getFavoriteDuas();
      setIsFavorite(favs.includes(params.duaId as string));
    });
  }, [params.duaId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Text copied to clipboard." });
  };

  const toggleFav = () => {
    const newFavs = duaService.toggleFavorite(dua!.id);
    setIsFavorite(newFavs.includes(dua!.id));
    toast({ title: isFavorite ? "Removed" : "Saved", description: "Updated your favorites." });
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
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => handleCopy(dua.arabic)}>
            <Copy className="w-5 h-5" />
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
        </CardContent>
      </Card>

      <section className="space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-4">Related</h3>
        <div className="grid grid-cols-1 gap-4">
           {/* Placeholder for related */}
           <p className="text-center text-sm text-muted-foreground">More daily supplications coming soon.</p>
        </div>
      </section>
    </div>
  );
}
