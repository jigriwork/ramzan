import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Moon, BookOpen, Clock, Heart, BookOpenText } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background islamic-pattern">
      <header className="px-6 py-8 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Moon className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-headline font-bold text-primary">NoorRamadan</h1>
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Log In</Link>
          </Button>
          <Button asChild className="rounded-full px-6">
            <Link href="/auth/register">Get Started</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="px-6 py-20 text-center max-w-4xl mx-auto">
          <span className="text-sm font-semibold tracking-widest text-primary uppercase bg-primary/5 px-4 py-1.5 rounded-full mb-6 inline-block">
            Bismillah-ir-Rahman-ir-Rahim
          </span>
          <h2 className="text-5xl md:text-7xl font-headline font-black mb-8 leading-tight">
            Illuminate Your Journey <br /> 
            <span className="text-primary italic">This Ramadan</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            A calm, modern, and non-judgmental companion for your spiritual growth. 
            Learn Namaz, read Quran with multiple translations, and stay on track with precise prayer timings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full px-10 h-14 text-lg" asChild>
              <Link href="/auth/register">Create Free Account</Link>
            </Button>
          </div>
        </section>

        <section className="px-6 py-20 bg-card/50">
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
        <p>&copy; {new Date().getFullYear()} NoorRamadan. May Allah accept your efforts.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-border shadow-sm hover:shadow-xl transition-all group">
      <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
