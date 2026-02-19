
"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Type, Eye, Contrast } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useAppSettings } from '@/components/providers/app-settings-provider';

export default function AccessibilitySettingsPage() {
  const router = useRouter();
  const { arabicFontSize, setArabicFontSize, theme, setTheme } = useAppSettings();

  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-3xl font-black text-primary">Accessibility</h2>
          <p className="text-muted-foreground font-medium">Make NoorRamadan yours</p>
        </div>
      </header>

      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-4">Arabic Font Size</h3>
        <Card className="border-none shadow-sm rounded-[2.5rem] p-10 space-y-10">
          <div className="bg-secondary/20 p-8 rounded-3xl text-center">
             <p className={cn(
               "arabic-font font-bold",
               arabicFontSize === 'small' ? 'text-2xl' : arabicFontSize === 'medium' ? 'text-4xl' : 'text-6xl'
             )}>بِسْمِ اللَّهِ</p>
          </div>
          <div className="px-4">
             <Slider 
                defaultValue={[arabicFontSize === 'small' ? 0 : arabicFontSize === 'medium' ? 50 : 100]} 
                max={100} 
                step={50}
                onValueChange={(v) => {
                  const s = v[0] === 0 ? 'small' : v[0] === 50 ? 'medium' : 'large';
                  setArabicFontSize(s);
                }}
             />
             <div className="flex justify-between mt-4 text-[10px] font-black uppercase text-muted-foreground">
               <span>Small</span>
               <span>Medium</span>
               <span>Large</span>
             </div>
          </div>
        </Card>
      </section>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white divide-y overflow-hidden">
        <div className="p-8 flex items-center justify-between">
           <div className="flex items-center gap-4">
             <Contrast className="w-6 h-6 text-purple-500" />
             <span className="font-black text-lg">Dark Theme</span>
           </div>
           <Switch checked={theme === 'dark'} onCheckedChange={(v) => setTheme(v ? 'dark' : 'light')} />
        </div>
      </Card>
    </div>
  );
}
