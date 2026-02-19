"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DUAS } from '@/lib/data/seed';
import { Search, Heart, Copy, Share2 } from 'lucide-react';

export default function DuasPage() {
  const categories = ['All', 'Sehri', 'Iftar', 'After Salah', 'Daily Life'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredDuas = selectedCategory === 'All' 
    ? DUAS 
    : DUAS.filter(d => d.category === selectedCategory);

  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-headline font-bold text-primary">Supplications</h2>
        <p className="text-muted-foreground">Beautiful duas for every moment</p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input placeholder="Search duas..." className="pl-10 h-12 rounded-2xl shadow-sm" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
        {categories.map(cat => (
          <Button 
            key={cat} 
            variant={selectedCategory === cat ? 'default' : 'secondary'}
            onClick={() => setSelectedCategory(cat)}
            className="rounded-full px-6 flex-shrink-0"
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredDuas.map((dua) => (
          <DuaCard key={dua.id} dua={dua} />
        ))}
      </div>
    </div>
  );
}

function DuaCard({ dua }: { dua: any }) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Card className="border-none shadow-md overflow-hidden rounded-3xl">
      <CardHeader className="bg-secondary/30 flex flex-row items-center justify-between py-4">
        <CardTitle className="text-lg font-bold">{dua.title}</CardTitle>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className={`h-8 w-8 rounded-full ${isFavorite ? 'text-pink-500' : 'text-muted-foreground'}`}
            onClick={() => setIsFavorite(!isFavorite)}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-8 space-y-6">
        <p className="text-3xl font-bold leading-relaxed text-center arabic-font">{dua.arabic}</p>
        <div className="space-y-4 pt-4 border-t border-dashed">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary/50 mb-1">Transliteration</p>
            <p className="text-sm italic text-muted-foreground leading-relaxed">{dua.transliteration}</p>
          </div>
          <div>
             <p className="text-xs font-bold uppercase tracking-widest text-primary/50 mb-1">Translation (EN)</p>
             <p className="text-sm leading-relaxed">{dua.translation_en}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary/50 mb-1">Urdu</p>
              <p className="text-sm font-bold leading-relaxed">{dua.translation_ur}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary/50 mb-1">Hindi</p>
              <p className="text-sm font-bold leading-relaxed">{dua.translation_hi}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}