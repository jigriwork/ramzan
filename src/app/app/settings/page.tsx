
"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ChevronRight, Globe, Bell, Type, Eye, Moon, User, Shield, Accessibility, Languages } from 'lucide-react';
import { useAppSettings } from '@/components/providers/app-settings-provider';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { language, theme, arabicFontSize } = useAppSettings();

  return (
    <div className="space-y-8 pb-24">
      <header>
        <h2 className="text-3xl font-black text-primary">Settings</h2>
        <p className="text-muted-foreground font-medium">Personalize your NoorRamadan</p>
      </header>

      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Preferences</h3>
        <Card className="border-none shadow-sm divide-y rounded-[2.5rem] bg-white overflow-hidden">
          <SettingLink 
            href="/app/settings/language"
            icon={<Languages className="text-blue-500" />} 
            label="Language & Transliteration" 
            value={language.toUpperCase()}
          />
          <SettingLink 
            href="/app/settings/accessibility"
            icon={<Accessibility className="text-emerald-500" />} 
            label="Arabic Font & Accessibility" 
            value={arabicFontSize.charAt(0).toUpperCase() + arabicFontSize.slice(1)}
          />
          <SettingLink 
            href="/app/settings/notifications"
            icon={<Bell className="text-purple-500" />} 
            label="Notification Reminders" 
            value="Active"
          />
        </Card>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">App Info</h3>
        <Card className="border-none shadow-sm divide-y rounded-[2.5rem] bg-white overflow-hidden">
          <SettingLink icon={<Shield className="text-slate-500" />} label="Privacy Policy" />
          <SettingLink icon={<User className="text-slate-500" />} label="About NoorRamadan" value="v1.2.0" />
        </Card>
      </section>

      <div className="px-6 text-center">
        <p className="text-xs text-muted-foreground font-medium italic">"May your Ramadan be filled with light and blessings."</p>
      </div>
    </div>
  );
}

function SettingLink({ icon, label, value, href }: { icon: React.ReactNode, label: string, value?: string, href?: string }) {
  const Content = (
    <div className="p-8 flex items-center justify-between cursor-pointer hover:bg-secondary/20 transition-all group">
      <div className="flex items-center gap-5">
        <div className="w-12 h-12 rounded-2xl bg-current bg-opacity-5 flex items-center justify-center">
          <div className="w-6 h-6">{icon}</div>
        </div>
        <span className="font-black text-lg">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {value && <span className="text-sm font-bold text-muted-foreground/50">{value}</span>}
        <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
      </div>
    </div>
  );

  return href ? <Link href={href}>{Content}</Link> : Content;
}
