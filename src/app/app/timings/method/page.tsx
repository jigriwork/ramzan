
"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Info, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { settingsService } from '@/services/settingsService';
import { toast } from '@/hooks/use-toast';

const methods = [
  { id: 1, name: "University of Islamic Sciences, Karachi", desc: "Standard for India, Pakistan, Bangladesh." },
  { id: 3, name: "Muslim World League", desc: "Standard for Europe and parts of USA." },
  { id: 4, name: "Umm Al-Qura University, Makkah", desc: "Standard for Saudi Arabia." },
  { id: 5, name: "Egyptian General Authority of Survey", desc: "Standard for Egypt, parts of Arab world." },
];

export default function TimingsMethodPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(settingsService.getSettings().calculationMethod);

  const handleSave = () => {
    settingsService.saveSettings({ calculationMethod: current });
    toast({ title: "Settings Saved", description: "Your timings will update shortly." });
    router.back();
  };

  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-3xl font-black text-primary">Calc Method</h2>
          <p className="text-muted-foreground font-medium">Configure calculation rules</p>
        </div>
      </header>

      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-4">Recommended Method</h3>
        <RadioGroup value={String(current)} onValueChange={(v) => setCurrent(Number(v))} className="grid gap-4">
          {methods.map(m => (
            <Label key={m.id} htmlFor={`m-${m.id}`} className="cursor-pointer">
              <Card className={cn(
                "border-none shadow-sm rounded-[2rem] transition-all",
                current === m.id ? "bg-primary/5 ring-2 ring-primary" : "bg-white"
              )}>
                <CardContent className="p-6 flex items-start gap-4">
                  <RadioGroupItem value={String(m.id)} id={`m-${m.id}`} className="mt-1" />
                  <div className="flex-1">
                    <p className="font-bold text-lg">{m.name}</p>
                    <p className="text-sm text-muted-foreground font-medium">{m.desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Label>
          ))}
        </RadioGroup>
      </section>

      <Card className="bg-blue-50 border-none rounded-[2rem] p-6 flex gap-4">
        <Info className="w-6 h-6 text-blue-500 shrink-0" />
        <p className="text-sm text-blue-800 font-medium">Choosing the right method ensures accuracy for your specific geographic location and local moon sighting norms.</p>
      </Card>

      <Button className="w-full h-16 rounded-3xl text-xl font-black shadow-xl shadow-primary/20" onClick={handleSave}>
        Save Configuration
      </Button>
    </div>
  );
}
