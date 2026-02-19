
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, doc, deleteDoc, setDoc, getDoc } from 'firebase/firestore';
import { Search, Heart, Copy, Sparkles, LayoutGrid } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { useAppSettings } from '@/components/providers/app-settings-provider';
import Link from 'next/link';

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
    <div className="space-y-6 pb-24">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-primary">Supplications</h2>
        <p className="text-muted-foreground">Beautiful duas for every moment</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        <Link href="/app/duas/collections">
          <Card className="bg-primary text-white border-none rounded-[2rem] p-6 shadow-xl shadow-primary/10 flex items-center justify-between overflow-hidden relative">
            <Sparkles className="absolute -right-4 -top-4 w-24 h-24 opacity-10" />
            <div className="flex items-center gap-4 relative">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-lg leading-tight">Explore Collections</p>
                <p className="text-xs opacity-70 font-medium">Curated packs for specific needs</p>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="Search duas..." 
          className="pl-10 h-12 rounded-2xl shadow-sm border-none bg-white" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
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
            <Link key={dua.id} href={`/app/duas/${dua.id}`}>
              <DuaCompactCard dua={dua} />
            </Link>
          ))
        ) : (
          <div className="text-center py-20 text-muted-foreground">No duas found.</div>
        )}
      </div>
    </div>
  );
}

function DuaCompactCard({ dua }: any) {
  return (
    <Card className="border-none shadow-sm overflow-hidden rounded-[2rem] bg-white group hover:shadow-md transition-all">
      <CardHeader className="bg-secondary/30 flex flex-row items-center justify-between py-4 px-6">
        <CardTitle className="text-sm font-bold">{dua.title}</CardTitle>
        <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">{dua.category}</span>
      </CardHeader>
      <CardContent className="p-8 space-y-4">
        <p className="text-2xl arabic-font text-right line-clamp-1">{dua.arabic}</p>
        <p className="text-sm text-muted-foreground font-medium line-clamp-2">{dua.translation_en}</p>
      </CardContent>
    </Card>
  );
}
