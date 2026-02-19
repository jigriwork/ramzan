"use client"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Clock, BookOpenText, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Home', icon: Home, href: '/app' },
  { label: 'Quran', icon: BookOpen, href: '/app/quran' },
  { label: 'Timings', icon: Clock, href: '/app/timings' },
  { label: 'Learn', icon: BookOpenText, href: '/app/learn-namaz' },
  { label: 'Duas', icon: Heart, href: '/app/duas' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-black/80 bottom-nav-blur border-t z-50 md:hidden">
      <div className="flex justify-around items-center h-20 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-full h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "fill-primary/10")} />
              <span className="text-[10px] font-medium uppercase tracking-tighter">{item.label}</span>
              {isActive && (
                <div className="absolute top-0 w-12 h-1 bg-primary rounded-full shadow-[0_-4px_10px_rgba(75,0,130,0.5)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}