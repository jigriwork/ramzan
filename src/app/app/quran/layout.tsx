
"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname, useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function QuranLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const getActiveTab = () => {
    if (pathname.includes('/juz')) return 'juz';
    if (pathname.includes('/plan')) return 'plan';
    return 'surah';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Tabs value={getActiveTab()} onValueChange={(v) => router.push(v === 'surah' ? '/app/quran' : `/app/quran/${v}`)}>
          <TabsList className="bg-secondary/50 rounded-full h-11 p-1">
            <TabsTrigger value="surah" className="rounded-full px-6 font-bold text-xs uppercase tracking-wider">Surah</TabsTrigger>
            <TabsTrigger value="juz" className="rounded-full px-6 font-bold text-xs uppercase tracking-wider">Juz</TabsTrigger>
            <TabsTrigger value="plan" className="rounded-full px-6 font-bold text-xs uppercase tracking-wider">Khatam</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="secondary" size="icon" className="rounded-full h-11 w-11 shadow-sm" onClick={() => router.push('/app/quran/search')}>
          <Search className="w-5 h-5" />
        </Button>
      </div>
      {children}
    </div>
  )
}
