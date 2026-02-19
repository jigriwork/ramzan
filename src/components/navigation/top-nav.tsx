
"use client"

import Link from 'next/link';
import { User, Moon, MoreHorizontal, LayoutGrid, Heart, Sparkles, Settings, Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export function TopNav() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6 max-w-4xl mx-auto">
        <Link href="/app" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Moon className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-headline font-bold text-primary">NoorRamadan</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-6 mr-6 text-sm font-black uppercase tracking-widest text-primary/60">
            <Link href="/app/quran" className="hover:text-primary transition-colors">Quran</Link>
            <Link href="/app/timings" className="hover:text-primary transition-colors">Timings</Link>
            <Link href="/app/learn-namaz" className="hover:text-primary transition-colors">Learn</Link>
            <Link href="/app/duas" className="hover:text-primary transition-colors">Duas</Link>
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 hover:bg-secondary/50 transition-all">
                <MoreHorizontal className="w-6 h-6 text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-3 shadow-2xl border-none">
              <DropdownMenuItem asChild>
                <Link href="/app/ramadan" className="rounded-2xl p-4 font-black uppercase text-xs tracking-widest flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Ramadan Hub
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/app/kids" className="rounded-2xl p-4 font-black uppercase text-xs tracking-widest flex items-center gap-3">
                  <Baby className="w-4 h-4 text-blue-500" /> Kids Zone
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/app/settings" className="rounded-2xl p-4 font-black uppercase text-xs tracking-widest flex items-center gap-3">
                  <Settings className="w-4 h-4 text-slate-500" /> Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="rounded-full h-11 w-11" asChild>
            <Link href="/app/profile">
              <Avatar className="h-9 w-9 border-2 border-white shadow-sm">
                <AvatarFallback className="bg-primary/5 text-primary font-bold">
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
