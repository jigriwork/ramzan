
"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, Bell, Clock, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { settingsService } from '@/services/settingsService';

export default function NotificationsSettingsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState({
    prayers: true,
    iftar: true,
    dua: false,
    kids: true
  });

  return (
    <div className="space-y-8 pb-24">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-3xl font-black text-primary">Notifications</h2>
          <p className="text-muted-foreground font-medium">Manage your reminders</p>
        </div>
      </header>

      <Card className="border-none shadow-sm rounded-[2.5rem] bg-white divide-y overflow-hidden">
        <NotificationItem 
          icon={<Clock className="text-blue-500" />} 
          label="Prayer Times" 
          desc="Alerts for Fajr, Dhuhr, Asr, Maghrib, Isha"
          checked={notifs.prayers}
          onChange={(v) => setNotifs({...notifs, prayers: v})}
        />
        <NotificationItem 
          icon={<Bell className="text-amber-500" />} 
          label="Iftar & Sehri" 
          desc="Countdowns and end-of-fast alerts"
          checked={notifs.iftar}
          onChange={(v) => setNotifs({...notifs, iftar: v})}
        />
        <NotificationItem 
          icon={<Sparkles className="text-purple-500" />} 
          label="Daily Insights" 
          desc="Spiritual reminders and daily Duas"
          checked={notifs.dua}
          onChange={(v) => setNotifs({...notifs, dua: v})}
        />
      </Card>

      <p className="text-center text-xs text-muted-foreground italic px-8">
        Real-time push notifications require browser permission. Toggles are for UI demonstration.
      </p>
    </div>
  );
}

function NotificationItem({ icon, label, desc, checked, onChange }: any) {
  return (
    <div className="p-8 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-current bg-opacity-5 flex items-center justify-center">
          <div className="w-6 h-6">{icon}</div>
        </div>
        <div>
          <p className="font-black text-lg">{label}</p>
          <p className="text-sm text-muted-foreground font-medium">{desc}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
