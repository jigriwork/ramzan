import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Settings, Bell, Globe, ShieldCheck, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  return (
    <div className="space-y-6 pb-20">
      <header className="flex flex-col items-center text-center space-y-4 pt-4">
        <Avatar className="h-24 w-24 border-4 border-primary/10">
          <AvatarImage src="" />
          <AvatarFallback className="text-3xl bg-primary/5 text-primary">AK</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-3xl font-headline font-bold">Abdullah Khan</h2>
          <p className="text-muted-foreground">abdullah.k@example.com</p>
        </div>
        <Button variant="outline" className="rounded-full px-8">Edit Profile</Button>
      </header>

      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-2">App Settings</h3>
        <Card className="border-none shadow-md divide-y overflow-hidden rounded-3xl">
          <SettingItem 
            icon={<MapPin className="text-blue-500" />} 
            label="Location" 
            value="Mumbai, India"
            isAction
          />
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold">Kids Mode</p>
                <p className="text-xs text-muted-foreground">Simplified UI for children</p>
              </div>
            </div>
            <Switch />
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/5 flex items-center justify-center">
                <Bell className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="font-bold">Notifications</p>
                <p className="text-xs text-muted-foreground">Prayer & Iftar alerts</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <SettingItem 
            icon={<Globe className="text-emerald-500" />} 
            label="Default Translation" 
            value="English"
            isAction
          />
        </Card>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-2">Support & Legal</h3>
        <Card className="border-none shadow-md divide-y overflow-hidden rounded-3xl">
          <SettingItem 
            icon={<ShieldCheck className="text-purple-500" />} 
            label="Privacy Policy" 
            isAction
          />
          <SettingItem 
            icon={<Settings className="text-gray-500" />} 
            label="About NoorRamadan" 
            isAction
          />
        </Card>
      </section>

      <Button variant="destructive" className="w-full h-14 rounded-2xl font-bold shadow-lg shadow-destructive/10" asChild>
        <Link href="/">
          <LogOut className="w-5 h-5 mr-2" /> Log Out
        </Link>
      </Button>

      <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
        NoorRamadan Version 1.0.0 (Alpha)
      </p>
    </div>
  );
}

function SettingItem({ icon, label, value, isAction = false }: { icon: React.ReactNode, label: string, value?: string, isAction?: boolean }) {
  return (
    <div className={cn("p-4 flex items-center justify-between", isAction && "cursor-pointer hover:bg-secondary/20 transition-colors")}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-current bg-opacity-5 flex items-center justify-center">
          <div className="w-5 h-5">
            {icon}
          </div>
        </div>
        <p className="font-bold">{label}</p>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-muted-foreground">{value}</span>}
        {isAction && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </div>
    </div>
  );
}