
"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Book, Trophy, CheckSquare, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function KidsHome() {
  return (
    <div className="space-y-8 pb-20">
      <header className="text-center space-y-2">
        <h2 className="text-4xl font-black text-amber-500">Kids Zone</h2>
        <p className="text-muted-foreground font-bold">Fun ways to learn your Deen!</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <KidsCategoryCard 
          title="Stories of Prophets" 
          description="Amazing tales with big lessons" 
          icon={<Book className="w-10 h-10 text-blue-500" />} 
          href="/app/kids/stories"
          bgColor="bg-blue-50"
        />
        <KidsCategoryCard 
          title="Ramadan Quiz" 
          description="Test your knowledge & win badges" 
          icon={<Trophy className="w-10 h-10 text-yellow-500" />} 
          href="/app/kids/quiz"
          bgColor="bg-yellow-50"
        />
        <KidsCategoryCard 
          title="Good Deeds" 
          description="Keep track of your super actions" 
          icon={<CheckSquare className="w-10 h-10 text-emerald-500" />} 
          href="/app/kids/deeds"
          bgColor="bg-emerald-50"
        />
      </div>

      <Card className="bg-primary text-white rounded-[2.5rem] p-10 text-center space-y-4">
        <div className="flex justify-center">
          <Star className="w-12 h-12 text-yellow-400 fill-current" />
        </div>
        <h3 className="text-2xl font-black">Star Student</h3>
        <p className="opacity-80 font-medium">Complete more activities to earn your weekly star!</p>
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map(i => (
             <div key={i} className={`w-3 h-3 rounded-full ${i <= 3 ? 'bg-yellow-400' : 'bg-white/20'}`} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function KidsCategoryCard({ title, description, icon, href, bgColor }: { title: string, description: string, icon: React.ReactNode, href: string, bgColor: string }) {
  return (
    <Link href={href}>
      <Card className={`border-none shadow-sm hover:shadow-lg transition-all rounded-[2.5rem] overflow-hidden ${bgColor}`}>
        <CardContent className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="bg-white p-4 rounded-[2rem] shadow-sm">
              {icon}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">{title}</h3>
              <p className="text-sm font-medium text-slate-600">{description}</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-slate-400" />
        </CardContent>
      </Card>
    </Link>
  );
}
