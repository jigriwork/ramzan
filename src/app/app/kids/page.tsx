
"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Book, Trophy, CheckSquare, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export default function KidsHome() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) return (
    <div className="space-y-8 pb-24">
      <Skeleton className="h-10 w-1/2 mx-auto" />
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-[2.5rem]" />)}
      </div>
      <Skeleton className="h-48 w-full rounded-[2.5rem]" />
    </div>
  );

  return (
    <div className="space-y-8 pb-24">
      <header className="text-center space-y-2 pt-4">
        <h2 className="text-4xl font-black text-amber-500">Kids Zone</h2>
        <p className="text-muted-foreground font-bold">Fun ways to learn your Deen!</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <KidsCategoryCard 
          title="Prophet Stories" 
          description="Amazing tales with big lessons" 
          icon={<Book className="w-10 h-10 text-blue-500" />} 
          href="/app/kids/stories"
          bgColor="bg-blue-50"
        />
        <KidsCategoryCard 
          title="Fun Quizzes" 
          description="Test your knowledge & win badges" 
          icon={<Trophy className="w-10 h-10 text-yellow-500" />} 
          href="/app/kids/quiz"
          bgColor="bg-yellow-50"
        />
        <KidsCategoryCard 
          title="Super Deeds" 
          description="Keep track of your good actions" 
          icon={<CheckSquare className="w-10 h-10 text-emerald-500" />} 
          href="/app/kids/deeds"
          bgColor="bg-emerald-50"
        />
      </div>

      <Card className="bg-primary text-white rounded-[2.5rem] p-10 text-center space-y-6 shadow-2xl shadow-primary/20 relative overflow-hidden">
        <div className="absolute inset-0 islamic-pattern opacity-10" />
        <div className="relative">
          <div className="flex justify-center mb-4">
            <Star className="w-16 h-16 text-yellow-400 fill-current animate-pulse" />
          </div>
          <h3 className="text-3xl font-black">Star Student</h3>
          <p className="opacity-80 font-bold mt-2">Finish 2 more stories this week to earn your badge!</p>
          <div className="flex justify-center gap-2 mt-6">
            {[1, 2, 3, 4, 5].map(i => (
               <div key={i} className={`w-4 h-4 rounded-full ${i <= 3 ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function KidsCategoryCard({ title, description, icon, href, bgColor }: { title: string, description: string, icon: React.ReactNode, href: string, bgColor: string }) {
  return (
    <Link href={href}>
      <Card className={`border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2.5rem] overflow-hidden ${bgColor} group`}>
        <CardContent className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-white p-5 rounded-[2.2rem] shadow-sm group-hover:scale-110 transition-transform">
              {icon}
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-800">{title}</h3>
              <p className="text-sm font-bold text-slate-500 opacity-80">{description}</p>
            </div>
          </div>
          <div className="bg-white/50 p-2 rounded-full">
            <ChevronRight className="w-6 h-6 text-slate-400" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
