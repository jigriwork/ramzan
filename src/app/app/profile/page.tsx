
"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth } from '@/firebase';
import { signOut, linkWithCredential, EmailAuthProvider } from 'firebase/auth';
import { User, LogOut, Settings, Bell, Globe, ShieldCheck, MapPin, ChevronRight, Sparkles, Mail, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged out", description: "You have been successfully signed out." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to sign out." });
    }
  };

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUpgrading(true);
    try {
      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(user, credential);
      toast({ title: "Account Upgraded!", description: "Your guest data is now synced with your email." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upgrade Failed", description: error.message });
    } finally {
      setIsUpgrading(false);
    }
  };

  const isGuest = user?.isAnonymous;

  return (
    <div className="space-y-8 pb-24 max-w-2xl mx-auto">
      <header className="flex flex-col items-center text-center space-y-6 pt-8">
        <div className="relative">
          <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
            <AvatarImage src="" />
            <AvatarFallback className="text-4xl bg-primary/5 text-primary font-bold">
              {user?.displayName?.[0] || user?.email?.[0] || <User className="w-12 h-12" />}
            </AvatarFallback>
          </Avatar>
          {isGuest && (
            <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-full shadow-lg">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight">
            {isGuest ? "Guest Traveler" : user?.displayName || "Salaam!"}
          </h2>
          <p className="text-muted-foreground font-medium">
            {isGuest ? "Temporary Guest Account" : user?.email}
          </p>
        </div>
        {!isGuest && (
          <Button variant="outline" className="rounded-full px-10 h-12 font-bold border-2 hover:bg-primary hover:text-white transition-all">
            Edit Profile
          </Button>
        )}
      </header>

      {isGuest && (
        <Card className="border-none bg-gradient-to-br from-primary to-indigo-900 text-white shadow-2xl rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-10 space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-400" /> Upgrade Your Deen Journey
              </h3>
              <p className="text-primary-foreground/80 font-medium">
                Link an email to save your Quran bookmarks, Dua favorites, and prayer progress permanently across all your devices.
              </p>
            </div>
            
            <form onSubmit={handleUpgrade} className="space-y-4 pt-4">
              <div className="grid gap-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input 
                    placeholder="Email Address" 
                    type="email" 
                    className="bg-white/10 border-white/20 placeholder:text-white/40 pl-11 h-14 rounded-2xl text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input 
                    placeholder="Create Password" 
                    type="password" 
                    className="bg-white/10 border-white/20 placeholder:text-white/40 pl-11 h-14 rounded-2xl text-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-white text-primary font-black hover:bg-amber-400 hover:text-white transition-all text-lg shadow-xl shadow-black/10"
                disabled={isUpgrading}
              >
                {isUpgrading ? "Upgrading..." : "Save My Progress Now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-4">Preferences</h3>
        <Card className="border-none shadow-sm divide-y overflow-hidden rounded-[2rem] bg-white">
          <SettingItem 
            icon={<MapPin className="text-blue-500" />} 
            label="Location Settings" 
            value="Mumbai, India"
            isAction
          />
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="font-bold text-lg">Kids Mode</p>
                <p className="text-sm text-muted-foreground font-medium">Simplified UI for children</p>
              </div>
            </div>
            <Switch className="data-[state=checked]:bg-amber-500" />
          </div>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg">Notifications</p>
                <p className="text-sm text-muted-foreground font-medium">Prayer & Iftar alerts</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <SettingItem 
            icon={<Globe className="text-emerald-500" />} 
            label="Quran Translation" 
            value="English (Sahih)"
            isAction
          />
        </Card>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-4">App Info</h3>
        <Card className="border-none shadow-sm divide-y overflow-hidden rounded-[2rem] bg-white">
          <SettingItem 
            icon={<ShieldCheck className="text-purple-500" />} 
            label="Privacy & Security" 
            isAction
          />
          <SettingItem 
            icon={<Settings className="text-gray-500" />} 
            label="About NoorRamadan" 
            isAction
          />
        </Card>
      </section>

      {!isGuest && (
        <Button 
          variant="destructive" 
          className="w-full h-16 rounded-3xl font-black text-lg shadow-xl shadow-destructive/10 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all border-none" 
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" /> Log Out From App
        </Button>
      )}

      <div className="text-center space-y-2">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 font-black">
          NoorRamadan Version 1.0.0
        </p>
      </div>
    </div>
  );
}

function SettingItem({ icon, label, value, isAction = false }: { icon: React.ReactNode, label: string, value?: string, isAction?: boolean }) {
  return (
    <div className={cn("p-6 flex items-center justify-between group", isAction && "cursor-pointer hover:bg-secondary/20 transition-all")}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-current bg-opacity-5 flex items-center justify-center">
          <div className="w-6 h-6">
            {icon}
          </div>
        </div>
        <p className="font-bold text-lg tracking-tight">{label}</p>
      </div>
      <div className="flex items-center gap-3">
        {value && <span className="text-sm font-bold text-muted-foreground/60">{value}</span>}
        {isAction && <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />}
      </div>
    </div>
  );
}
