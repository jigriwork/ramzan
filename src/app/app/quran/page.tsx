import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { QURAN_SURAHS } from '@/lib/data/seed';
import { Search, BookOpen, Bookmark } from 'lucide-react';

export default function QuranPage() {
  return (
    <div className="space-y-6 pb-10">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-headline font-bold text-primary">The Noble Quran</h2>
        <p className="text-muted-foreground">Read, study, and reflect on the divine word</p>
      </header>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input placeholder="Search Surah by name or number..." className="pl-10 h-12 rounded-2xl shadow-sm" />
      </div>

      <div className="grid grid-cols-1 gap-3">
        {QURAN_SURAHS.map((surah) => (
          <Link key={surah.id} href={`/app/quran/${surah.index}`}>
            <Card className="group hover:border-primary transition-all border-none shadow-sm hover:shadow-md overflow-hidden bg-white">
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
        ))}
      </div>

      <div className="pt-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Saved Bookmarks</h4>
        <div className="grid grid-cols-1 gap-3">
          <Card className="border-dashed bg-secondary/10 hover:bg-secondary/20 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 py-4 px-6">
              <Bookmark className="w-5 h-5 text-primary opacity-50" />
              <div>
                <p className="font-bold">Surah Al-Fatiha</p>
                <p className="text-xs text-muted-foreground">Ayah 5 • 2 days ago</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}