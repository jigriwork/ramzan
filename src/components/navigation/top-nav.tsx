import Link from 'next/link';
import { User, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6 max-w-4xl mx-auto">
        <Link href="/app" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Moon className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-headline font-bold text-primary">NoorRamadan</span>
        </Link>
        
        <div className="flex items-center gap-4">
           {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 mr-6 text-sm font-medium">
            <Link href="/app/quran" className="hover:text-primary transition-colors">Quran</Link>
            <Link href="/app/timings" className="hover:text-primary transition-colors">Timings</Link>
            <Link href="/app/learn-namaz" className="hover:text-primary transition-colors">Learn</Link>
            <Link href="/app/duas" className="hover:text-primary transition-colors">Duas</Link>
          </nav>

          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/app/profile">
              <Avatar className="h-8 w-8 border">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/5 text-primary">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}