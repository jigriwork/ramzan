
import type { Metadata } from 'next';
import { FirebaseClientProvider } from '@/firebase';
import { AppSettingsProvider } from '@/components/providers/app-settings-provider';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

export const metadata: Metadata = {
  title: 'Deen App',
  description: 'Quran, Duas, Ramadan, Kids',
  applicationName: 'Deen App',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;900&family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen" suppressHydrationWarning>
        <FirebaseClientProvider>
          <AppSettingsProvider>
            {children}
            <Toaster />
          </AppSettingsProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
