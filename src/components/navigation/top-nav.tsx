
"use client"

import Link from 'next/link';
import { User, Moon, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/firebase';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function TopNav() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-6 max-w-4xl mx-auto">
        <Link href="/app" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Moon className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-headline font-bold text-primary">NoorRamadan</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <nav className="hidden md:flex items-center gap-6 mr-6 text-sm font-medium">
            <Link href="/app/quran" className="hover:text-primary transition-colors">Quran</Link>
            <Link href="/app/timings" className="hover:text-primary transition-colors">Timings</Link>
            <Link href="/app/learn-namaz" className="hover:text-primary transition-colors">Learn</Link>
            <Link href="/app/duas" className="hover:text-primary transition-colors">Duas</Link>
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2">
              <DropdownMenuItem asChild><Link href="/app/ramadan" className="rounded-xl p-3 font-bold">Ramadan Dashboard</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/app/kids" className="rounded-xl p-3 font-bold">Kids Zone</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/app/settings" className="rounded-xl p-3 font-bold">Settings</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="rounded-full" asChild>
            <Link href="/app/profile">
              <Avatar className="h-8 w-8 border">
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
