
"use client"

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { settingsService } from '@/services/settingsService';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ensureAuthForSaving, useFirestore, useUser } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const methods = [
  { id: 1, name: "Standard India Method", desc: "Most accurate and widely used method for all cities in India." },
  { id: 3, name: "International Standard", desc: "Commonly used by Indian communities abroad." },
  { id: 4, name: "Umm Al-Qura Method", desc: "Used by those following Saudi Arabian sighting norms." },
];

export default function TimingsMethodPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const [current, setCurrent] = useState(settingsService.getSettings().calculationMethod);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (cancelled || !snap.exists()) return;
        const data = snap.data() as { calculationMethod?: number };
        if (typeof data.calculationMethod === 'number') {
          setCurrent(data.calculationMethod);
          settingsService.saveSettings({ calculationMethod: data.calculationMethod });
        }
      } catch {
        toast({
          variant: 'destructive',
          title: 'Sync Warning',
          description: 'Could not load timing method from cloud. Using cached settings.',
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [db, user]);

  const handleSave = async () => {
    settingsService.saveSettings({ calculationMethod: current });
    try {
      const activeUser = await ensureAuthForSaving();
      await setDoc(doc(db, 'users', activeUser.uid), {
        calculationMethod: current,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      toast({ title: "Settings Saved", description: "Your timings will update shortly." });
      router.back();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not sync timing method to cloud. Saved locally.',
      });
    }
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
        <p className="text-sm text-blue-800 font-medium">The "Standard India Method" is specifically calibrated for local twilight angles across the Indian subcontinent.</p>
      </Card>

      <Button className="w-full h-16 rounded-3xl text-xl font-black shadow-xl shadow-primary/20" onClick={handleSave}>
        Save Configuration
      </Button>
    </div>
  );
}
