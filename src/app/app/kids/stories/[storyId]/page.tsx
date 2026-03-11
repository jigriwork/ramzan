
"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Star, Heart } from 'lucide-react';
import { kidsService } from '@/services/kidsService';
import { Skeleton } from '@/components/ui/skeleton';

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [story, setStory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    kidsService.getStoryById(params.storyId as string).then(data => {
      setStory(data || null);
      setLoading(false);
    });
  }, [params.storyId]);

  if (loading) return <div className="p-8 space-y-6"><Skeleton className="h-48 w-full rounded-[2.5rem]" /><Skeleton className="h-64 w-full" /></div>;
  if (!story) return <div className="p-10 text-center">Story not found.</div>;

  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <Button variant="ghost" size="icon" className="rounded-full text-pink-500">
          <Heart className="w-6 h-6" />
        </Button>
      </header>

      <Card className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white">
        <div className="bg-blue-500 p-12 text-center text-white space-y-2">
          <h2 className="text-3xl font-black">{story.title}</h2>
          <p className="opacity-80 font-bold">A Story of Faith</p>
        </div>
        <CardContent className="p-10 space-y-8">
          <p className="text-xl leading-relaxed text-slate-700 font-medium">
            {story.content}
          </p>

          {story.moral && (
            <div className="p-8 bg-amber-50 rounded-[2rem] border-2 border-amber-100 space-y-3 relative overflow-hidden">
              <Star className="absolute -top-4 -right-4 w-24 h-24 text-amber-200 opacity-30" />
              <h4 className="text-amber-800 font-black text-lg flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" /> The Moral
              </h4>
              <p className="text-amber-900 font-bold italic leading-relaxed">
                {story.moral}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button className="flex-1 h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-black shadow-lg shadow-emerald-200">
          Finish & Earn 10 Stars!
        </Button>
      </div>
    </div>
  );
}
