"use client"

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { User, LogOut, Settings, Bell, Globe, ShieldCheck, MapPin, ChevronRight, Sparkles, Mail, Lock, Database, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { useAppSettings } from '@/components/providers/app-settings-provider';
import { useRouter } from 'next/navigation';
import { upgradeAnonymousToEmail } from '@/firebase';
import { useIsAdmin } from '@/firebase/useIsAdmin';

type ImportStepState = {
  key: string;
  label: string;
  endpoint: string;
  status: 'idle' | 'running' | 'done' | 'error';
  detail?: string;
};

const IMPORT_PLAN: Omit<ImportStepState, 'status' | 'detail'>[] = [
  { key: 'quran-ar', label: 'Quran Arabic', endpoint: '/api/admin/import/quran-arabic' },
  { key: 'quran-translit', label: 'Quran Transliteration', endpoint: '/api/admin/import/transliteration' },
  { key: 'quran-en', label: 'Quran Translation (EN)', endpoint: '/api/admin/import/translation?lang=en' },
  { key: 'quran-ur', label: 'Quran Translation (UR)', endpoint: '/api/admin/import/translation?lang=ur' },
  { key: 'quran-hi', label: 'Quran Translation (HI)', endpoint: '/api/admin/import/translation?lang=hi' },
  { key: 'duas', label: 'Duas + Collections', endpoint: '/api/admin/import/duas' },
  { key: 'namaz', label: 'Namaz Steps', endpoint: '/api/admin/import/namaz' },
];

const IMPORT_JOBS_BY_STEP: Record<string, string[]> = {
  'quran-ar': ['quran-arabic'],
  'quran-translit': ['quran-transliteration'],
  'quran-en': ['quran-translation-en'],
  'quran-ur': ['quran-translation-ur'],
  'quran-hi': ['quran-translation-hi'],
  'duas': ['duas', 'dua-collections'],
  'namaz': ['namaz-steps'],
};

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const { mode, setMode, theme, setTheme, city } = useAppSettings();
  const { isAdmin, refresh: refreshAdminClaim } = useIsAdmin();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isBootstrappingAdmin, setIsBootstrappingAdmin] = useState(false);
  const [importSteps, setImportSteps] = useState<ImportStepState[]>(
    IMPORT_PLAN.map((step) => ({ ...step, status: 'idle' }))
  );
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const canSeed = isAdmin;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged out", description: "You have been successfully signed out." });
      router.push('/');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to sign out." });
    }
  };

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      // DEV-ONLY: this header-based seed key approach must be replaced with
      // proper server auth/authorization before production use.
      const seedKey = process.env.NEXT_PUBLIC_ADMIN_SEED_KEY;
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: {
          'x-admin-seed-key': seedKey ?? '',
        },
      });

      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || 'Seeding failed');
      }

      toast({ title: "Success", description: "App data seeded successfully!" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpgrading(true);
    try {
      await upgradeAnonymousToEmail(email, password);
      toast({ title: "Account Upgraded!", description: "Your guest data is now synced with your email." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Upgrade Failed", description: error.message });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleBootstrapAdmin = async () => {
    setIsBootstrappingAdmin(true);
    try {
      // DEV ONLY: exposing this secret in NEXT_PUBLIC_* is only for temporary local tooling.
      const adminSecret = process.env.NEXT_PUBLIC_ADMIN_PROMOTE_SECRET;
      const response = await fetch('/api/admin/bootstrap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret ?? '',
        },
        body: JSON.stringify({ email: 'adibsattar@gmail.com' }),
      });

      const payload = await response.json();
      if (response.status === 409) {
        toast({ title: 'Already Initialized', description: 'An admin already exists. Bootstrap skipped.' });
      } else if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || 'Bootstrap failed');
      } else {
        toast({ title: 'Bootstrap Complete', description: 'Admin claim assigned. Please re-login or refresh token.' });
      }

      await refreshAdminClaim();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Bootstrap Failed', description: e.message });
    } finally {
      setIsBootstrappingAdmin(false);
    }
  };

  const markImportStep = (key: string, patch: Partial<ImportStepState>) => {
    setImportSteps((prev) => prev.map((step) => (step.key === key ? { ...step, ...patch } : step)));
  };

  const getImportStatus = async (adminSecret: string) => {
    const response = await fetch('/api/admin/import/status', {
      method: 'GET',
      headers: {
        'x-admin-secret': adminSecret,
      },
    });
    const payload = await response.json();
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error || 'Unable to fetch import status');
    }
    return payload;
  };

  const areStepJobsDone = (stepKey: string, importStatusByJob: Record<string, any>) => {
    const jobs = IMPORT_JOBS_BY_STEP[stepKey] || [];
    if (jobs.length === 0) return false;
    return jobs.every((jobName) => Boolean(importStatusByJob?.[jobName]?.done || importStatusByJob?.[jobName]?.completed));
  };

  const runSingleImportUntilComplete = async (endpoint: string, adminSecret: string, key: string) => {
    let guard = 0;
    while (guard < 200) {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-admin-secret': adminSecret,
        },
      });

      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || 'Import endpoint failed');
      }

      if (typeof payload.cursor === 'number' && typeof payload.total === 'number') {
        markImportStep(key, { detail: `${payload.cursor}/${payload.total}` });
      } else if (payload?.duas?.cursor !== undefined || payload?.collections?.cursor !== undefined) {
        const d = payload?.duas;
        const c = payload?.collections;
        markImportStep(
          key,
          { detail: `duas ${d?.cursor ?? 0}/${d?.total ?? 0}, collections ${c?.cursor ?? 0}/${c?.total ?? 0}` }
        );
      }

      if (!payload?.hasMore && !payload?.duas?.hasMore && !payload?.collections?.hasMore) {
        const statusPayload = await getImportStatus(adminSecret);
        if (areStepJobsDone(key, statusPayload?.importStatusByJob || {})) {
          return;
        }
      }
      guard += 1;
    }

    throw new Error('Import loop safety limit reached');
  };

  const handleRunFullImport = async () => {
    setIsImporting(true);
    setImportSteps(IMPORT_PLAN.map((step) => ({ ...step, status: 'idle', detail: undefined })));

    try {
      const adminSecret = process.env.NEXT_PUBLIC_ADMIN_IMPORT_SECRET || process.env.NEXT_PUBLIC_ADMIN_PROMOTE_SECRET;
      if (!adminSecret) {
        throw new Error('Missing NEXT_PUBLIC_ADMIN_IMPORT_SECRET (or NEXT_PUBLIC_ADMIN_PROMOTE_SECRET fallback)');
      }

      for (const step of IMPORT_PLAN) {
        markImportStep(step.key, { status: 'running', detail: 'starting...' });
        await runSingleImportUntilComplete(step.endpoint, adminSecret, step.key);
        markImportStep(step.key, { status: 'done', detail: 'completed' });
      }

      toast({ title: 'Import Complete', description: 'Full content import finished successfully.' });
    } catch (e: any) {
      const msg = e?.message || 'Full import failed';
      setImportSteps((prev) => {
        const active = prev.find((s) => s.status === 'running');
        if (!active) return prev;
        return prev.map((s) => (s.key === active.key ? { ...s, status: 'error', detail: msg } : s));
      });
      toast({ variant: 'destructive', title: 'Import Failed', description: msg });
    } finally {
      setIsImporting(false);
    }
  };

  const isGuest = user?.isAnonymous;

  return (
    <div className="space-y-8 pb-24 max-w-2xl mx-auto">
      <header className="flex flex-col items-center text-center space-y-6 pt-8">
        <div className="relative">
          <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
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
            {isGuest ? "Guest Traveler" : user?.displayName || user?.email?.split('@')[0] || "Salaam!"}
          </h2>
          <p className="text-muted-foreground font-medium">
            {isGuest ? "Temporary Guest Account" : user?.email}
          </p>
        </div>
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
          <div onClick={() => router.push('/app/timings')}>
            <SettingItem
              icon={<MapPin className="text-blue-500" />}
              label="Location Settings"
              value={city || "Set City"}
              isAction
            />
          </div>
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
            <Switch
              checked={mode === 'kids'}
              onCheckedChange={(checked) => setMode(checked ? 'kids' : 'adult')}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg">Dark Theme</p>
                <p className="text-sm text-muted-foreground font-medium">Protect your eyes</p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>

          {isAdmin ? (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between group cursor-pointer hover:bg-secondary/20 transition-all rounded-2xl p-2 -m-2" onClick={isImporting ? undefined : handleRunFullImport}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                    <Database className="w-6 h-6 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">Run Full Import</p>
                    <p className="text-sm text-muted-foreground font-medium">Quran + translations + duas + namaz</p>
                  </div>
                </div>
                {isImporting ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground/30" />}
              </div>
              <div className="space-y-2 pl-2">
                {importSteps.map((step) => (
                  <div key={step.key} className="text-xs font-medium flex items-center justify-between gap-2">
                    <span className="truncate">{step.label}</span>
                    <span className={cn(
                      'shrink-0',
                      step.status === 'done' && 'text-emerald-600',
                      step.status === 'running' && 'text-blue-600',
                      step.status === 'error' && 'text-red-600',
                      step.status === 'idle' && 'text-muted-foreground'
                    )}>
                      {step.detail || step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {process.env.NEXT_PUBLIC_ADMIN_PROMOTE_SECRET ? (
            <div className="p-6 flex items-center justify-between group cursor-pointer hover:bg-secondary/20 transition-all" onClick={handleBootstrapAdmin}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-indigo-500" />
                </div>
                <div>
                  <p className="font-bold text-lg">Bootstrap Admin (Dev)</p>
                  <p className="text-sm text-muted-foreground font-medium">One-time claim for adibsattar@gmail.com</p>
                </div>
              </div>
              {isBootstrappingAdmin ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /> : <ChevronRight className="w-5 h-5 text-muted-foreground/30" />}
            </div>
          ) : null}
        </Card>
      </section>

      {!isGuest && !isUserLoading && (
        <Button
          variant="destructive"
          className="w-full h-16 rounded-3xl font-black text-lg shadow-xl shadow-destructive/10 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all border-none"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" /> Log Out From App
        </Button>
      )}
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