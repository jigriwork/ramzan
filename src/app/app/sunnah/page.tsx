"use client"

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronLeft, Sparkles, Sunrise, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { sunnahService, SunnahHabit } from '@/services/sunnahService';
import { useUser } from '@/firebase';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function SunnahPage() {
    const router = useRouter();
    const { user } = useUser();
    const [sunnahs, setSunnahs] = useState<SunnahHabit[]>([]);
    const [completedIds, setCompletedIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const todayKey = new Date().toISOString().split('T')[0];

    useEffect(() => {
        async function loadData() {
            const items = await sunnahService.getSunnahs();
            setSunnahs(items);

            if (user) {
                const comps = await sunnahService.getCompletions(user.uid, todayKey);
                setCompletedIds(comps);
            }
            setLoading(false);
        }
        loadData();
    }, [user, todayKey]);

    const toggleSunnah = async (id: string, checked: boolean) => {
        if (!user) {
            toast({
                title: "Sign in required",
                description: "Please sign in to save your daily progress.",
                variant: "destructive"
            });
            return;
        }

        let newCompleted = [...completedIds];
        if (checked && !newCompleted.includes(id)) {
            newCompleted.push(id);
        } else if (!checked && newCompleted.includes(id)) {
            newCompleted = newCompleted.filter(c => c !== id);
        }

        setCompletedIds(newCompleted);
        await sunnahService.saveCompletions(user.uid, todayKey, newCompleted);

        if (checked && newCompleted.length === sunnahs.length && sunnahs.length > 0) {
            toast({
                title: "MashaAllah! 🎉",
                description: "You have completed all your Sunnah goals for today.",
            });
        }
    };

    const progress = sunnahs.length > 0 ? Math.round((completedIds.length / sunnahs.length) * 100) : 0;

    return (
        <div className="space-y-8 pb-20 max-w-2xl mx-auto">
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h2 className="text-3xl font-black text-primary font-headline tracking-tight">Sunnah Today</h2>
                    <p className="text-muted-foreground font-medium flex items-center gap-2">
                        <Sunrise className="w-4 h-4 text-emerald-500" /> Daily prophetic habits
                    </p>
                </div>
            </header>

            {loading ? (
                <div className="py-20 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
                </div>
            ) : sunnahs.length === 0 ? (
                <Card className="border-none shadow-sm rounded-3xl bg-secondary/10">
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No Sunnah habits found in the database.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <p className="text-sm font-bold uppercase tracking-widest text-primary/60">Your Progress</p>
                        <p className="text-sm font-black text-primary">{progress}%</p>
                    </div>
                    <div className="w-full bg-secondary/30 h-3 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <Card className="border-none shadow-xl overflow-hidden rounded-[2rem] bg-white divide-y">
                        {sunnahs.map((sunnah) => {
                            const isChecked = completedIds.includes(sunnah.id);

                            return (
                                <div key={sunnah.id} className={cn("p-6 flex items-start gap-4 transition-colors", isChecked ? "bg-emerald-50/50" : "")}>
                                    <Checkbox
                                        id={`sunnah-${sunnah.id}`}
                                        checked={isChecked}
                                        onCheckedChange={(c) => toggleSunnah(sunnah.id, c === true)}
                                        className="mt-1 w-6 h-6 rounded-md data-[state=checked]:bg-emerald-500 data-[state=checked]:border-none"
                                    />
                                    <div className="flex-1 space-y-2">
                                        <label
                                            htmlFor={`sunnah-${sunnah.id}`}
                                            className={cn("font-bold text-lg cursor-pointer transition-colors", isChecked ? "text-emerald-900" : "text-foreground")}
                                        >
                                            {sunnah.title}
                                        </label>
                                        <p className={cn("text-sm", isChecked ? "text-emerald-700/80" : "text-muted-foreground")}>
                                            {sunnah.description}
                                        </p>
                                        {sunnah.reference && (
                                            <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500 opacity-60">
                                                {sunnah.reference}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </Card>

                    {progress === 100 && (
                        <div className="bg-emerald-500 text-white p-6 rounded-3xl text-center shadow-xl shadow-emerald-500/20 transform animate-in slide-in-from-bottom-4">
                            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-80" />
                            <h3 className="font-black text-xl mb-1">Excellent!</h3>
                            <p className="text-sm opacity-90 font-medium">You have followed all suggested sunnahs for today.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
