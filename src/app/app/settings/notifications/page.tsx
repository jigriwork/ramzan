
"use client"

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, Bell, Clock, Sparkles, Baby } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppSettings } from '@/components/providers/app-settings-provider';

export default function NotificationsSettingsPage() {
  const router = useRouter();
  const {
    notifPrayer,
    notifIftar,
    notifDua,
    notifKids,
    setNotifPrayer,
    setNotifIftar,
    setNotifDua,
    setNotifKids,
  } = useAppSettings();

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
          checked={notifPrayer}
          onChange={setNotifPrayer}
        />
        <NotificationItem
          icon={<Bell className="text-amber-500" />}
          label="Iftar & Sehri"
          desc="Countdowns and end-of-fast alerts"
          checked={notifIftar}
          onChange={setNotifIftar}
        />
        <NotificationItem
          icon={<Sparkles className="text-purple-500" />}
          label="Daily Insights"
          desc="Spiritual reminders and daily Duas"
          checked={notifDua}
          onChange={setNotifDua}
        />
        <NotificationItem
          icon={<Baby className="text-pink-500" />}
          label="Kids Learning"
          desc="Stories, quiz, and deeds reminders"
          checked={notifKids}
          onChange={setNotifKids}
        />
      </Card>

      <p className="text-center text-xs text-muted-foreground italic px-8">
        Real-time push notifications require browser permission.
      </p>
    </div>
  );
}

function NotificationItem({
  icon,
  label,
  desc,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  desc: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
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
