"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useUser, ensureAuthForSaving } from '@/firebase';
import { doc, setDoc, deleteDoc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ChevronLeft, Share2, Bookmark, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { quranService } from '@/services/quranService';

export default function JuzReaderPage() {
    const params = useParams();
    const router = useRouter();
    const juzIndex = Number(Array.isArray(params.juzId) ? params.juzId[0] : params.juzId);

    const { user } = useUser();
    const db = useFirestore();
    const [activeTranslation, setActiveTranslation] = useState('en');
    const [isAudioSheetOpen, setIsAudioSheetOpen] = useState(false);
    const [ayahs, setAyahs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Since getting Ayahs exactly by Juz natively isn't neatly baked into quranService without Surah IDs,
    // we can use Firestore directly to query `juz == juzId` across the `quran_ayahs` collection or fetch via API fallback.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setIsLoading(true);
            try {
                let fetchedAyahs: any[] = [];

                try {
                    // Query Firestore first
                    const snap = await getDocs(
                        query(collection(db, 'quran_ayahs'), where('juz', '==', juzIndex), orderBy('surahId', 'asc'), orderBy('ayahNumber', 'asc'))
                    );

                    if (snap.docs.length > 0) {
                        fetchedAyahs = snap.docs.map(d => {
                            const row = d.data() as any;
                            return {
                                id: d.id,
                                surahId: String(row.surahId),
                                ayahNo: Number(row.ayahNumber),
                                arabic: row.text_ar || '',
                                transliteration: row.translit_en || '',
                                translation_en: row.translations?.en || '',
                                translation_ur: row.translations?.ur || '',
                                translation_hi: row.translations?.hi || '',
                                juz: row.juz,
                            };
                        });
                    }
                } catch (dbErr) {
                    // Firestore index missing or network issue; fallback to API will run since fetchedAyahs is empty.
                    console.log("Firestore query failed, falling back to API", dbErr);
                }

                // Fallback to API if DB is empty or failed
                if (fetchedAyahs.length === 0) {
                    const [arRes, enRes, urRes, hiRes, transRes] = await Promise.all([
                        fetch(`https://api.alquran.cloud/v1/juz/${juzIndex}/quran-uthmani`),
                        fetch(`https://api.alquran.cloud/v1/juz/${juzIndex}/en.asad`),
                        fetch(`https://api.alquran.cloud/v1/juz/${juzIndex}/ur.jalandhry`),
                        fetch(`https://api.alquran.cloud/v1/juz/${juzIndex}/hi.farooq`),
                        fetch(`https://api.alquran.cloud/v1/juz/${juzIndex}/en.transliteration`)
                    ]);

                    const arPayload = await arRes.json();
                    const enPayload = await enRes.json();
                    const urPayload = await urRes.json();
                    const hiPayload = await hiRes.json();
                    const transPayload = await transRes.json();

                    if (arPayload.code === 200 && arPayload.data) {
                        const arAyahs = arPayload.data.ayahs;
                        const enAyahs = enPayload.data?.ayahs;
                        const urAyahs = urPayload.data?.ayahs;
                        const hiAyahs = hiPayload.data?.ayahs;
                        const transAyahs = transPayload.data?.ayahs;

                        fetchedAyahs = arAyahs.map((ar: any, i: number) => ({
                            id: String(ar.number),
                            surahId: String(ar.surah.number),
                            ayahNo: ar.numberInSurah,
                            arabic: ar.text,
                            transliteration: transAyahs?.[i]?.text || '',
                            translation_en: enAyahs?.[i]?.text || '',
                            translation_ur: urAyahs?.[i]?.text || '',
                            translation_hi: hiAyahs?.[i]?.text || '',
                            juz: juzIndex
                        }));
                    }
                }
                if (!cancelled) setAyahs(fetchedAyahs);
            } catch (err) {
                if (!cancelled) setAyahs([]);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [juzIndex, db]);

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2 rounded-full font-semibold">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                </Button>
            </div>

            <Card className="bg-primary text-white border-none shadow-xl shadow-primary/10 overflow-hidden text-center p-10 rounded-[2.5rem] relative">
                <div className="absolute inset-0 opacity-5 pointer-events-none islamic-pattern" />
                <CardContent className="space-y-3 relative">
                    <h2 className="text-4xl font-black tracking-tight">Juz {juzIndex}</h2>
                    <div className="flex items-center justify-center gap-3 pt-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-white/15 px-4 py-1.5 rounded-full backdrop-blur-md">Full Part Reading</span>
                    </div>
                </CardContent>
            </Card>

            <div className="sticky top-[64px] z-30 py-4 bg-background/80 backdrop-blur-xl border-b border-transparent">
                <Tabs defaultValue="en" onValueChange={setActiveTranslation} className="w-full">
                    <TabsList className="grid grid-cols-3 w-full max-w-xs mx-auto h-11 rounded-full bg-secondary p-1">
                        <TabsTrigger value="en" className="rounded-full font-bold text-xs uppercase tracking-wider">English</TabsTrigger>
                        <TabsTrigger value="ur" className="rounded-full font-bold text-xs uppercase tracking-wider">Urdu</TabsTrigger>
                        <TabsTrigger value="hi" className="rounded-full font-bold text-xs uppercase tracking-wider">Hindi</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="space-y-4 mt-6">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={`juz-loading-${i}`} className="p-8 rounded-[2rem] bg-white space-y-6 shadow-sm">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))
                ) : ayahs?.length ? (
                    ayahs.map((ayah, index) => {
                        const isNewSurah = index === 0 || ayahs[index - 1].surahId !== ayah.surahId;
                        return (
                            <React.Fragment key={`ayah-view-${ayah.id}`}>
                                {isNewSurah && (
                                    <div className="my-8 text-center">
                                        <span className="bg-secondary/50 text-primary px-6 py-2 rounded-full font-black text-sm tracking-widest uppercase shadow-sm">
                                            Surah {ayah.surahId}
                                        </span>
                                    </div>
                                )}
                                <AyahRow ayah={ayah} activeTranslation={activeTranslation} onAudioClick={() => setIsAudioSheetOpen(true)} />
                            </React.Fragment>
                        );
                    })
                ) : (
                    <div className="text-center py-12 text-muted-foreground font-medium">
                        Could not load Juz content. Please ensure your connection is stable or run the Database Import in the Profile settings.
                    </div>
                )}
            </div>

            <div className="pt-8 flex items-center justify-between w-full border-t border-dashed mt-10">
                <Button variant="outline" className="rounded-2xl h-14" disabled={juzIndex <= 1} onClick={() => router.push(`/app/quran/juz/${juzIndex - 1}/read`)}>
                    Previous Juz
                </Button>
                <Button className="rounded-2xl h-14 bg-primary text-white" disabled={juzIndex >= 30} onClick={() => router.push(`/app/quran/juz/${juzIndex + 1}/read`)}>
                    Next Juz
                </Button>
            </div>

            <Sheet open={isAudioSheetOpen} onOpenChange={setIsAudioSheetOpen}>
                <SheetContent side="bottom" className="rounded-t-[3rem] p-10 h-[40vh]">
                    <SheetHeader className="text-center space-y-4">
                        <div className="w-16 h-16 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-2">
                            <Volume2 className="w-8 h-8 text-primary" />
                        </div>
                        <SheetTitle className="text-3xl font-black">Audio Coming Soon</SheetTitle>
                        <SheetDescription className="text-lg font-bold text-muted-foreground">
                            We are carefully selecting premium recitations for a soulful experience. Stay tuned!
                        </SheetDescription>
                    </SheetHeader>
                    <div className="mt-8 flex justify-center">
                        <Button className="rounded-full px-12 h-14 font-black shadow-xl" onClick={() => setIsAudioSheetOpen(false)}>
                            Alhamdulillah
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

function AyahRow({ ayah, activeTranslation, onAudioClick }: { ayah: any, activeTranslation: string, onAudioClick: () => void }) {
    const db = useFirestore();
    const { user } = useUser();
    const [isBookmarked, setIsBookmarked] = useState(false);
    const cacheKey = `bookmark_${ayah.surahId}_${ayah.ayahNo}`;

    const setBookmarkCache = (bookmarked: boolean) => {
        if (typeof window === 'undefined') return;
        if (bookmarked) {
            localStorage.setItem(cacheKey, '1');
        } else {
            localStorage.removeItem(cacheKey);
        }
    };

    useEffect(() => {
        if (!user) {
            setIsBookmarked(typeof window !== 'undefined' && localStorage.getItem(cacheKey) === '1');
            return;
        }

        const bookmarkRef = doc(db, 'bookmarks', user.uid, 'items', `${ayah.surahId}_${ayah.ayahNo}`);
        getDoc(bookmarkRef)
            .then((snap) => {
                const exists = snap.exists();
                setIsBookmarked(exists);
                setBookmarkCache(exists);
            })
            .catch(() => {
                setIsBookmarked(typeof window !== 'undefined' && localStorage.getItem(cacheKey) === '1');
            });
    }, [user, ayah, db]);

    const handleBookmark = async () => {
        try {
            const activeUser = await ensureAuthForSaving();
            const ref = doc(db, 'bookmarks', activeUser.uid, 'items', `${ayah.surahId}_${ayah.ayahNo}`);
            if (isBookmarked) {
                await deleteDoc(ref);
                setIsBookmarked(false);
                setBookmarkCache(false);
            } else {
                await setDoc(ref, {
                    surahId: ayah.surahId,
                    ayahNo: ayah.ayahNo,
                    createdAt: new Date().toISOString()
                });
                setIsBookmarked(true);
                setBookmarkCache(true);
                toast({ title: "Ayah Saved", description: "Bookmark added successfully." });
            }
        } catch {
            toast({
                variant: 'destructive',
                title: 'Save Failed',
                description: 'Could not update bookmark in cloud right now.',
            });
        }
    };

    const getTranslation = () => {
        switch (activeTranslation) {
            case 'ur': return ayah.translation_ur;
            case 'hi': return ayah.translation_hi;
            default: return ayah.translation_en;
        }
    };

    return (
        <div className="flex flex-col gap-6 p-8 rounded-[2rem] bg-white transition-all border border-transparent hover:border-primary/5 group shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-[10px] font-black text-primary">
                    {ayah.ayahNo}
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-primary/40 hover:text-primary" onClick={onAudioClick}>
                        <Volume2 className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-10 w-10 rounded-full ${isBookmarked ? 'text-primary bg-primary/10' : 'text-primary/40'}`}
                        onClick={handleBookmark}
                    >
                        <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className="space-y-8">
                <p className="text-4xl arabic-font tracking-normal leading-[1.8]">
                    {ayah.arabic}
                </p>

                <div className="space-y-4 pt-4 border-t border-dashed">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40">Transliteration</p>
                    <p className="text-sm font-medium italic text-muted-foreground/60 leading-relaxed">
                        {ayah.transliteration || "Transliteration missing."}
                    </p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40">Translation</p>
                    <p className={`text-xl leading-relaxed font-medium ${activeTranslation === 'ur' || activeTranslation === 'hi' ? 'ur-hi-text font-bold' : ''}`}>
                        {getTranslation()}
                    </p>
                </div>
            </div>
        </div>
    );
}
