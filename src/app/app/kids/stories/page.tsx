
"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, BookOpen, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { kidsService } from '@/services/kidsService';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';

export default function KidsStoriesPage() {
  const router = useRouter();
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    kidsService.getStories().then(data => {
      setStories(data);
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
          <h2 className="text-3xl font-black text-amber-500">Prophet Stories</h2>
          <p className="text-muted-foreground font-medium">Amazing tales with big lessons</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-[2.5rem]" />)
        ) : (
          stories.map(story => (
            <Card key={story.id} className="border-none shadow-sm hover:shadow-md transition-all rounded-[2.5rem] overflow-hidden bg-white cursor-pointer group" onClick={() => router.push(`/app/kids/stories/${story.id}`)}>
              <CardContent className="p-0 flex h-40">
                 <div className="w-1/3 bg-blue-100 relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <BookOpen className="w-16 h-16" />
                    </div>
                 </div>
                 <div className="flex-1 p-6 flex flex-col justify-center gap-1">
                    <h3 className="text-xl font-black text-slate-800">{story.title}</h3>
                    <p className="text-sm font-medium text-slate-500 line-clamp-2">{story.short}</p>
                    <div className="mt-2 flex items-center text-xs font-bold text-amber-500">
                      Read Story <ChevronRight className="w-3 h-3 ml-1" />
                    </div>
                 </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
