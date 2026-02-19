import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, CalendarDays, Clock } from 'lucide-react';

export default function TimingsPage() {
  const timings = [
    { name: 'Fajr', time: '5:12 AM', isNext: false },
    { name: 'Sunrise', time: '6:32 AM', isNext: false },
    { name: 'Dhuhr', time: '12:45 PM', isNext: false },
    { name: 'Asr', time: '4:12 PM', isNext: true },
    { name: 'Maghrib (Iftar)', time: '6:45 PM', isNext: false },
    { name: 'Isha', time: '8:02 PM', isNext: false },
  ];

  return (
    <div className="space-y-6 pb-10">
      <section className="flex flex-col gap-2">
        <h2 className="text-3xl font-headline font-bold text-primary">Prayer Timings</h2>
        <p className="text-muted-foreground">Accurate timings for your spiritual discipline</p>
      </section>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input placeholder="Search city..." className="pl-10 h-12 rounded-2xl" />
        <Button size="sm" variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 text-primary font-bold">
          <MapPin className="w-4 h-4 mr-1" /> Use GPS
        </Button>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" /> Today's Schedule
          </CardTitle>
          <span className="text-sm font-bold bg-primary/5 text-primary px-3 py-1 rounded-full italic">15 Ramadan 1445</span>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {timings.map((prayer) => (
              <div 
                key={prayer.name} 
                className={`flex items-center justify-between p-5 transition-colors ${prayer.isNext ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
              >
                <div>
                  <p className={`font-bold ${prayer.isNext ? 'text-primary' : ''}`}>{prayer.name}</p>
                  {prayer.isNext && <span className="text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse">Up Next</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className={`w-4 h-4 ${prayer.isNext ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xl font-headline font-black ${prayer.isNext ? 'text-primary' : ''}`}>{prayer.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-secondary/20 border-none">
        <CardContent className="p-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Islamic Date</p>
          <p className="text-xl font-headline font-bold">Wednesday, 15 Ramadan 1445 AH</p>
          <div className="pt-2">
             <Button variant="outline" className="rounded-full">Download Full Timetable</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}