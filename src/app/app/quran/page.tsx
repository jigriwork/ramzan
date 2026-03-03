"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BookOpen, Bookmark, Loader2 } from 'lucide-react';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { quranService, type Surah } from '@/services/quranService';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function QuranPage() {
  const db = useFirestore();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [isLoadingSurahs, setIsLoadingSurahs] = useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoadingSurahs(true);
      try {
        const data = await quranService.getSurahs();
        if (!cancelled) {
          setSurahs(data);
          if (process.env.NODE_ENV === 'development') {
            console.log('[QuranPage] surahs loaded:', data.length);
          }
        }
      } catch {
        if (!cancelled) {
          setSurahs([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingSurahs(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const bookmarksQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(db, 'bookmarks', user.uid, 'items'), orderBy('createdAt', 'desc'), limit(3));
  }, [db, user]);
  const { data: recentBookmarks } = useCollection(bookmarksQuery);

  const filteredSurahs = surahs?.filter(s =>
    s.nameEnglish.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.index.toString().includes(searchTerm)
  );

  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-headline font-bold text-primary">The Noble Quran</h2>
        <p className="text-muted-foreground">Read, study, and reflect on the divine word</p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search Surah by name or number..."
          className="pl-10 h-12 rounded-2xl shadow-sm border-none bg-card"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {isLoadingSurahs ? (
          Array(5).fill(0).map((_, i) => (
            <Skeleton key={`skeleton-${i}`} className="h-20 w-full rounded-[1.5rem]" />
          ))
        ) : filteredSurahs && filteredSurahs.length > 0 ? (
          filteredSurahs.map((surah, i) => (
            <motion.div
              key={surah.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 1) }}
            >
              <Link href={`/app/quran/${surah.index}`}>
                <Card className="group hover:border-primary transition-all border-none shadow-sm hover:shadow-md overflow-hidden bg-card rounded-2xl">
                  <CardContent className="p-0 flex items-center h-20">
                    <div className="w-16 h-full flex items-center justify-center bg-primary/5 group-hover:bg-primary/10 transition-colors">
                      <span className="text-xl font-headline font-bold text-primary opacity-50 group-hover:opacity-100">{surah.index}</span>
                    </div>
                    <div className="flex-1 px-4">
                      <h3 className="font-bold text-lg">{surah.nameEnglish}</h3>
                      <p className="text-xs text-muted-foreground">{surah.ayahCount} Ayahs</p>
                    </div>
                    <div className="px-6 text-right">
                      <span className="text-2xl font-bold arabic-font">{surah.nameArabic}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-10 text-muted-foreground">No Surahs found matching your search.</div>
        )}
      </div>

      {recentBookmarks && recentBookmarks.length > 0 && (
        <div className="pt-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Saved Bookmarks</h4>
          <div className="grid grid-cols-1 gap-3">
            {recentBookmarks.map((bookmark: any) => (
              <Link key={bookmark.id} href={`/app/quran/${bookmark.surahId}`}>
                <Card className="border-dashed bg-secondary/10 hover:bg-secondary/20 transition-colors cursor-pointer rounded-2xl">
                  <CardContent className="flex items-center gap-4 py-4 px-6">
                    <Bookmark className="w-5 h-5 text-primary opacity-50" />
                    <div>
                      <p className="font-bold">Surah {bookmark.surahId}</p>
                      <p className="text-xs text-muted-foreground">Ayah {bookmark.ayahNo} • {new Date(bookmark.createdAt).toLocaleDateString()}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
