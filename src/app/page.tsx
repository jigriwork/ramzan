
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Moon, BookOpen, Clock, Heart, BookOpenText, ChevronRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background islamic-pattern">
      <header className="px-6 py-8 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Moon className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Noor</h1>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" asChild className="font-semibold">
            <Link href="/auth/login">Log In</Link>
          </Button>
          <Button asChild className="rounded-full px-6 shadow-lg shadow-primary/20">
            <Link href="/app">Open App</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="px-6 py-20 text-center max-w-4xl mx-auto">
          <span className="text-xs font-bold tracking-[0.2em] text-primary/60 uppercase bg-primary/5 px-5 py-2 rounded-full mb-8 inline-block">
            Bismillah-ir-Rahman-ir-Rahim
          </span>
          <h2 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tighter">
            Your Premium <br />
            <span className="text-primary">Ramadan Companion</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
            A calm, modern, and non-judgmental space for your spiritual growth.
            Access Quran, timings, and guides instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full px-12 h-16 text-lg font-bold shadow-xl shadow-primary/20" asChild>
              <Link href="/app">
                Start Journey <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<BookOpen className="text-primary" />}
              title="Quran Reader"
              description="Read with transliteration and translations in English, Urdu, and Hindi."
            />
            <FeatureCard
              icon={<Clock className="text-primary" />}
              title="Prayer Timings"
              description="Accurate Iftar and Salah timings tailored to your city."
            />
            <FeatureCard
              icon={<BookOpenText className="text-primary" />}
              title="Learn Namaz"
              description="Step-by-step visual guide for kids and adults with progress tracking."
            />
            <FeatureCard
              icon={<Heart className="text-primary" />}
              title="Daily Duas"
              description="A curated collection of essential duas for every occasion."
            />
          </div>
        </section>
      </main>

      <footer className="px-6 py-12 border-t text-center text-muted-foreground">
        <p className="text-sm font-medium">&copy; {new Date().getFullYear()} Noor. May Allah accept your efforts.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-10 rounded-[2.5rem] bg-white border border-border/50 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all group">
      <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
        <div className="w-8 h-8">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-4 tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed font-medium">{description}</p>
    </div>
  );
}
