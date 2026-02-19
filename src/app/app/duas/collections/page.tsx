
"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Heart, Search, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { duaService, DuaCollection } from '@/services/duaService';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function DuaCollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<DuaCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    duaService.getCollections().then(data => {
      setCollections(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-3xl font-black text-primary">Collections</h2>
          <p className="text-muted-foreground font-medium">Curated packs for every moment</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-[2rem]" />)
        ) : (
          collections.map(col => (
            <Card key={col.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden group cursor-pointer hover:shadow-lg transition-all" onClick={() => router.push(`/app/duas?category=${col.title}`)}>
              <div className="h-32 bg-secondary/30 relative">
                 <Image src={col.image} fill className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-500" alt={col.title} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                 <div className="absolute bottom-4 left-6">
                   <h3 className="text-xl font-bold text-white">{col.title}</h3>
                   <p className="text-xs text-white/80 font-medium">{col.duaIds.length} Duas</p>
                 </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
