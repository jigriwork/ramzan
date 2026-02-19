import { BottomNav } from '@/components/navigation/bottom-nav';
import { TopNav } from '@/components/navigation/top-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen pb-20 md:pb-0 bg-background islamic-pattern">
      <TopNav />
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}