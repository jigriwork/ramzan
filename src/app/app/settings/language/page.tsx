
"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Check, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppSettings } from '@/components/providers/app-settings-provider';
import { cn } from '@/lib/utils';

export default function LanguageSettingsPage() {
  const router = useRouter();
  const { language, setLanguage, showTransliteration, setShowTransliteration } = useAppSettings();

  const langs = [
    { id: 'en', label: 'English', sub: 'Default app language' },
    { id: 'ur', label: 'Urdu', sub: 'اردو زبان' },
    { id: 'hi', label: 'Hindi', sub: 'हिन्दी भाषा' },
  ];

  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-3xl font-black text-primary">Language</h2>
          <p className="text-muted-foreground font-medium">Choose your primary tongue</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {langs.map(l => (
          <button 
            key={l.id} 
            onClick={() => setLanguage(l.id as any)}
            className={cn(
              "p-8 rounded-[2.5rem] flex items-center justify-between border-none shadow-sm transition-all",
              language === l.id ? "bg-primary text-white" : "bg-white text-slate-800"
            )}
          >
            <div className="text-left">
              <p className="text-xl font-black">{l.label}</p>
              <p className={cn("text-sm font-medium", language === l.id ? "text-white/70" : "text-muted-foreground")}>{l.sub}</p>
            </div>
            {language === l.id && <Check className="w-6 h-6" />}
          </button>
        ))}
      </div>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white p-8 space-y-4">
         <div className="flex items-center justify-between">
           <div>
             <p className="font-black text-lg">Transliteration</p>
             <p className="text-sm text-muted-foreground font-medium">Show pronunciation for Arabic</p>
           </div>
           <Button variant={showTransliteration ? 'default' : 'secondary'} className="rounded-full" onClick={() => setShowTransliteration(!showTransliteration)}>
             {showTransliteration ? 'Enabled' : 'Disabled'}
           </Button>
         </div>
      </Card>
    </div>
  );
}
