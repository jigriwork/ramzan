import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Heart, BookOpen, BookOpenText, Sparkles } from 'lucide-react';
import { DUAS } from '@/lib/data/seed';

export default function HomeDashboard() {
  // Mock data for display
  const todayDua = DUAS[Math.floor(Math.random() * DUAS.length)];
  const ramadanDay = 15;
  const nextPrayer = "Asr";
  const countdown = "01:42:00";
  const iftarTime = "6:45 PM";
  const city = "Mumbai";

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2">
        <h2 className="text-3xl font-headline font-bold">As-salamu alaykum, Abdullah</h2>
        <p className="text-muted-foreground">Ramadan Day {ramadanDay} • 1445 AH</p>
      </section>

      <Card className="bg-primary text-white overflow-hidden border-none shadow-xl shadow-primary/20">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <MoonPattern className="w-32 h-32" />
        </div>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-primary-foreground/80 font-medium text-sm uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" /> {city}
            </CardTitle>
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Today's Timings</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center text-center py-4">
            <p className="text-lg text-primary-foreground/70 mb-1">Iftar Today at</p>
            <h3 className="text-6xl font-headline font-black mb-6">{iftarTime}</h3>
            <div className="w-full h-px bg-white/10 mb-6" />
            <div className="flex justify-between w-full text-sm">
              <div className="text-left">
                <p className="opacity-70">Next Prayer</p>
                <p className="font-bold text-lg">{nextPrayer}</p>
              </div>
              <div className="text-right">
                <p className="opacity-70">Countdown</p>
                <p className="font-bold text-lg">{countdown}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <QuickActionButton icon={<BookOpen />} label="Quran" href="/app/quran" color="bg-orange-500" />
        <QuickActionButton icon={<Clock />} label="Timings" href="/app/timings" color="bg-blue-500" />
        <QuickActionButton icon={<BookOpenText />} label="Learn" href="/app/learn-namaz" color="bg-emerald-500" />
        <QuickActionButton icon={<Heart />} label="Duas" href="/app/duas" color="bg-pink-500" />
      </div>

      <Card className="border-none shadow-md overflow-hidden group">
        <CardHeader className="flex flex-row items-center justify-between pb-2 bg-secondary/30">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Today's Dua
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-7 text-xs">Share</Button>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-2xl font-bold leading-loose text-center arabic-font">{todayDua.arabic}</p>
          <div className="space-y-2">
             <p className="text-sm italic text-muted-foreground">{todayDua.transliteration}</p>
             <p className="text-sm">{todayDua.translation_en}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-md bg-gradient-to-br from-indigo-500/5 to-purple-500/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Continue Journey</h3>
            <span className="text-xs text-primary font-bold">65% Progress</span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-white rounded-2xl border">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter">Last Read</p>
                <p className="font-bold">Surah Al-Fatiha, Ayah 3</p>
              </div>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/app/quran">Open</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickActionButton({ icon, label, href, color }: { icon: React.ReactNode, label: string, href: string, color: string }) {
  return (
    <Button variant="outline" className="h-28 flex-col gap-3 rounded-3xl border-none bg-white shadow-sm hover:shadow-md hover:bg-white transition-all group" asChild>
      <Link href={href}>
        <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", color + " bg-opacity-10")}>
          <div className={cn("w-6 h-6", "text-" + color.split('-')[1] + "-600")}>
            {icon}
          </div>
        </div>
        <span className="font-bold text-sm">{label}</span>
      </Link>
    </Button>
  );
}

function MoonPattern({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="currentColor">
      <path d="M50,10 A40,40 0 1,0 90,50 A30,30 0 1,1 50,10 Z" />
    </svg>
  );
}