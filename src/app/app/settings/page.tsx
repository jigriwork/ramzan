
"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe, Bell, Type, Eye, ChevronRight, Moon, User, Shield } from 'lucide-react';
import { useAppSettings } from '@/components/providers/app-settings-provider';

export default function SettingsPage() {
  const { 
    language, setLanguage, 
    showTransliteration, setShowTransliteration,
    arabicFontSize, setArabicFontSize,
    theme, setTheme
  } = useAppSettings();

  return (
    <div className="space-y-8 pb-24">
      <header>
        <h2 className="text-3xl font-black text-primary">Settings</h2>
        <p className="text-muted-foreground font-medium">Personalize your app experience</p>
      </header>

      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Preferences</h3>
        <Card className="border-none shadow-sm divide-y rounded-[2rem] bg-white overflow-hidden">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Globe className="w-5 h-5 text-blue-500" />
              <Label className="font-bold text-lg">App Language</Label>
            </div>
            <Select value={language} onValueChange={(v: any) => setLanguage(v)}>
              <SelectTrigger className="w-[120px] rounded-xl border-none bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ur">Urdu</SelectItem>
                <SelectItem value="hi">Hindi</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Type className="w-5 h-5 text-emerald-500" />
              <Label className="font-bold text-lg">Transliteration</Label>
            </div>
            <Switch checked={showTransliteration} onCheckedChange={setShowTransliteration} />
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Eye className="w-5 h-5 text-amber-500" />
              <Label className="font-bold text-lg">Arabic Font Size</Label>
            </div>
            <div className="px-2">
              <Slider 
                defaultValue={[arabicFontSize === 'small' ? 25 : arabicFontSize === 'medium' ? 50 : 75]} 
                max={100} 
                step={25} 
                onValueChange={(v) => {
                  const size = v[0] <= 33 ? 'small' : v[0] <= 66 ? 'medium' : 'large';
                  setArabicFontSize(size);
                }}
              />
              <div className="flex justify-between mt-2 text-[10px] font-black uppercase text-muted-foreground px-1">
                <span>Small</span>
                <span>Medium</span>
                <span>Large</span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-4">Account & Security</h3>
        <Card className="border-none shadow-sm divide-y rounded-[2rem] bg-white overflow-hidden">
          <SettingLink icon={<Bell className="text-purple-500" />} label="Notifications" />
          <SettingLink icon={<Shield className="text-red-500" />} label="Privacy Policy" />
          <SettingLink icon={<User className="text-slate-500" />} label="About NoorRamadan" />
        </Card>
      </section>
    </div>
  );
}

function SettingLink({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="p-6 flex items-center justify-between cursor-pointer hover:bg-secondary/20 transition-all">
      <div className="flex items-center gap-4">
        {icon}
        <span className="font-bold text-lg">{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground/30" />
    </div>
  );
}
