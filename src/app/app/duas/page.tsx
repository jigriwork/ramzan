"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { Search, Heart, Copy, Share2, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useAppSettings } from '@/components/providers/app-settings-provider';

export default function DuasPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', 'Sehri', 'Iftar', 'After Salah', 'Daily Life'];

  const duasQuery = useMemoFirebase(() => query(collection(db, 'duas'), orderBy('title', 'asc')), [db]);
  const { data: duas, isLoading } = useCollection(duasQuery);

  const filteredDuas = (duas || []).filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || d.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-primary">Supplications</h2>
        <p className="text-muted-foreground">Beautiful duas for every moment</p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="Search duas..." 
          className="pl-10 h-12 rounded-2xl shadow-sm border-none bg-white" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
        {categories.map(cat => (
          <Button 
            key={cat} 
            variant={selectedCategory === cat ? 'default' : 'secondary'}
            onClick={() => setSelectedCategory(cat)}
            className="rounded-full px-6 flex-shrink-0 font-semibold"
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-[2rem]" />
          ))
        ) : filteredDuas.length > 0 ? (
          filteredDuas.map((dua) => (
            <DuaCard key={dua.id} dua={dua} />
          ))
        ) : (
          <div className="text-center py-20 text-muted-foreground">No duas found.</div>
        )}
      </div>
    </div>
  );
}

function DuaCard({ dua }: { dua: any }) {
  const { user } = useUser();
  const db = useFirestore();
  const { ensureGuestAuth } = useAppSettings();
  const [isFavorite, setIsFavorite] = useState(false);

  React.useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid, 'favorite_duas', dua.id)).then(snap => setIsFavorite(snap.exists()));
    }
  }, [user, dua.id, db]);

  const handleFavorite = async () => {
    const uid = await ensureGuestAuth();
    const ref = doc(db, 'users', uid, 'favorite_duas', dua.id);
    if (isFavorite) {
      await deleteDoc(ref);
      setIsFavorite(false);
    } else {
      await setDoc(ref, { id: dua.id, createdAt: new Date().toISOString() });
      setIsFavorite(true);
      toast({ title: "Saved to favorites", description: "You can find this in your profile soon." });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${dua.arabic}\n\n${dua.translation_en}`);
    toast({ title: "Copied", description: "Dua copied to clipboard." });
  };

  return (
    <Card className="border-none shadow-sm overflow-hidden rounded-[2rem] bg-white">
      <CardHeader className="bg-secondary/30 flex flex-row items-center justify-between py-5 px-6">
        <CardTitle className="text-lg font-bold">{dua.title}</CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary rounded-full" onClick={copyToClipboard}>
            <Copy className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-9 w-9 rounded-full ${isFavorite ? 'text-pink-500 bg-pink-50' : 'text-muted-foreground'}`}
            onClick={handleFavorite}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-8 px-8 space-y-8">
        <p className="text-4xl leading-loose arabic-font">{dua.arabic}</p>
        <div className="space-y-5 pt-6 border-t border-dashed">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-1.5">Transliteration</p>
            <p className="text-sm font-medium italic text-muted-foreground/80 leading-relaxed">{dua.transliteration}</p>
          </div>
          <div>
             <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-1.5">Translation (EN)</p>
             <p className="text-base leading-relaxed font-medium">{dua.translation_en}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-1.5">Urdu</p>
              <p className="text-base font-semibold ur-hi-text">{dua.translation_ur}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 mb-1.5">Hindi</p>
              <p className="text-base font-semibold ur-hi-text">{dua.translation_hi}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}