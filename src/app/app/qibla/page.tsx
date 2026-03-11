"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, Compass, AlertCircle, RefreshCw, Navigation, MapPin, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { qiblaService, type QiblaResult, type LastKnownQiblaSettings } from '@/services/qiblaService';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

type QiblaState = 'detecting' | 'ready' | 'error' | 'cached';

export default function QiblaPage() {
    const router = useRouter();
    const { user } = useUser();
    const db = useFirestore();

    const [state, setState] = useState<QiblaState>('detecting');
    const [result, setResult] = useState<QiblaResult | null>(null);
    const [cachedResult, setCachedResult] = useState<LastKnownQiblaSettings | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    // Compass state
    const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
    const [hasCompassSupport, setHasCompassSupport] = useState<boolean | null>(null);

    const fetchCompassOrientation = useCallback((e: DeviceOrientationEvent) => {
        // WebKit based
        const webkitHeading = (e as any).webkitCompassHeading;
        if (webkitHeading !== undefined && webkitHeading !== null) {
            setHasCompassSupport(true);
            setDeviceHeading(webkitHeading);
            return;
        }

        // Standard (Absolute)
        if (e.absolute === true && e.alpha !== null) {
            setHasCompassSupport(true);
            const heading = (360 - e.alpha) % 360;
            setDeviceHeading(heading);
            return;
        }

        setHasCompassSupport(false);
    }, []);

    const requestCompassPermission = useCallback(async () => {
        // For iOS 13+ devices
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const permissionState = await (DeviceOrientationEvent as any).requestPermission();
                if (permissionState === 'granted') {
                    (window as any).addEventListener('deviceorientationabsolute', fetchCompassOrientation, true);
                    window.addEventListener('deviceorientation', fetchCompassOrientation as any, true);
                } else {
                    setHasCompassSupport(false);
                }
            } catch (err) {
                setHasCompassSupport(false);
            }
        } else {
            // Non iOS 13+ devices
            if ('ondeviceorientationabsolute' in window) {
                (window as any).addEventListener('deviceorientationabsolute', fetchCompassOrientation, true);
            } else {
                (window as any).addEventListener('deviceorientation', fetchCompassOrientation as any, true);
            }
        }
    }, [fetchCompassOrientation]);

    const loadQibla = useCallback(async (forceRefresh = false) => {
        setState('detecting');
        setErrorMessage('');

        // Try cloud/local cache first if not explicitly forcing a refresh
        if (!forceRefresh) {
            const lastKnown = await qiblaService.getLastKnownQibla({ db, uid: user?.uid });
            if (lastKnown) {
                setCachedResult(lastKnown);
                setState('cached');

                // Still attempt to get live in background if supported, let's just show cached instantly
                try {
                    await requestCompassPermission();
                } catch (e) { }
                return;
            }
        }

        try {
            const qiblaResult = await qiblaService.resolveQiblaFromDetectedLocation({
                db,
                uid: user?.uid,
                forceRefresh,
            });

            if (qiblaResult.success && qiblaResult.qiblaBearing !== null && qiblaResult.userLatitude !== null && qiblaResult.userLongitude !== null) {
                setResult(qiblaResult);
                setState('ready');

                await qiblaService.saveLastKnownQibla({
                    db,
                    uid: user?.uid,
                    payload: {
                        lastLatitude: qiblaResult.userLatitude,
                        lastLongitude: qiblaResult.userLongitude,
                        lastQiblaBearing: qiblaResult.qiblaBearing,
                        qiblaUpdatedAt: new Date().toISOString()
                    }
                });

                // Setup compass after precise location acquired
                await requestCompassPermission();
            } else {
                setState('error');
                setErrorMessage(qiblaResult.error?.message || 'Unable to accurately detect your location for Qibla calculation.');
            }
        } catch (err: any) {
            setState('error');
            setErrorMessage(err.message || 'An unexpected error occurred trying to find the Qibla.');
        }
    }, [db, user?.uid, requestCompassPermission]);

    useEffect(() => {
        loadQibla();
        return () => {
            (window as any).removeEventListener('deviceorientationabsolute', fetchCompassOrientation, true);
            window.removeEventListener('deviceorientation', fetchCompassOrientation as any, true);
        };
    }, [loadQibla, fetchCompassOrientation]);

    const currentBearing = state === 'cached' && cachedResult ? cachedResult.lastQiblaBearing : result?.qiblaBearing;
    const bearingDefined = typeof currentBearing === 'number';

    // Calculate needle rotation based on device heading if available
    const needleRotation = (bearingDefined && deviceHeading !== null)
        ? (currentBearing - deviceHeading)
        : (currentBearing || 0);

    return (
        <div className="space-y-8 pb-24">
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h2 className="text-3xl font-black text-primary">Qibla Finder</h2>
                    <p className="text-muted-foreground font-medium">Sacred direction to the Kaaba</p>
                </div>
            </header>

            {state === 'detecting' && (
                <Card className="border-none shadow-premium-lg rounded-[3rem] overflow-hidden bg-white min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-6 text-center">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center relative">
                        <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                        <Navigation className="w-8 h-8 text-primary opacity-50" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-800">Detecting Location</h3>
                        <p className="text-muted-foreground font-medium mt-2">Aligning with the sacred direction...</p>
                    </div>
                </Card>
            )}

            {state === 'error' && (
                <Card className="border-none shadow-premium-lg rounded-[3rem] overflow-hidden bg-red-50/50 min-h-[50vh] flex flex-col items-center justify-center p-8 space-y-6 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                        <AlertCircle className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-red-900">Location Unavailable</h3>
                        <p className="text-red-700/80 font-medium mt-2 max-w-[250px] mx-auto">{errorMessage}</p>
                    </div>

                    <Button size="lg" className="rounded-full shadow-xl shadow-red-200 bg-red-600 hover:bg-red-700 font-bold px-8 mt-4" onClick={() => loadQibla(true)}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Detect Again
                    </Button>
                </Card>
            )}

            {(state === 'ready' || state === 'cached') && currentBearing !== undefined && currentBearing !== null && (
                <div className="space-y-6">
                    <Card className="border-none shadow-premium-lg rounded-[4rem] overflow-hidden bg-white relative">
                        <div className="absolute top-6 right-8 text-right z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Bearing</p>
                            <p className="text-2xl font-black text-primary">{Math.round(currentBearing)}&deg;</p>
                        </div>

                        {state === 'cached' && (
                            <div className="absolute top-6 left-8 z-10 flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase">
                                <MapPin className="w-3 h-3" /> Cached Location
                            </div>
                        )}

                        <CardContent className="p-12 flex flex-col items-center justify-center min-h-[60vh] relative">
                            {/* Compass Outer Ring */}
                            <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full border-[12px] border-slate-50 relative flex items-center justify-center shadow-inner">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-slate-300 font-black text-xl">N</div>
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-slate-300 font-black text-lg">S</div>
                                <div className="absolute top-1/2 -right-3 -translate-y-1/2 text-slate-300 font-black text-lg">E</div>
                                <div className="absolute top-1/2 -left-3 -translate-y-1/2 text-slate-300 font-black text-lg">W</div>

                                {/* Device Orientation Needle Wrapper */}
                                <div
                                    className={cn(
                                        "absolute inset-4 transition-transform ease-out",
                                        hasCompassSupport ? "duration-100" : "duration-1000"
                                    )}
                                    style={{ transform: `rotate(${needleRotation}deg)` }}
                                >
                                    {/* Directional Arrow / Kaaba Indicator */}
                                    <div className="absolute inset-0 flex flex-col items-center justify-start py-8">
                                        <div className="w-1.5 h-1/2 bg-gradient-to-t from-transparent to-primary rounded-t-full relative">
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40">
                                                    <Navigation className="w-6 h-6 fill-current" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Center Dot */}
                                <div className="w-4 h-4 bg-slate-200 rounded-full z-10 absolute" />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-center space-y-4 px-6 relative z-0">
                        <div className="bg-white/50 backdrop-blur-md rounded-3xl p-6 border border-white max-w-sm mx-auto shadow-sm">
                            {hasCompassSupport ? (
                                <p className="font-bold text-slate-800 flex flex-col items-center gap-2">
                                    <Compass className="w-6 h-6 text-primary" />
                                    Hold your phone flat and follow the arrow.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    <p className="font-bold text-slate-800 text-sm">
                                        Live compass unavailable.
                                    </p>
                                    <p className="text-xs text-muted-foreground font-medium">
                                        Find <span className="text-slate-900 font-bold">North</span>, then turn right exactly <span className="text-primary font-bold">{Math.round(currentBearing)}&deg;</span> to face the Kaaba.
                                    </p>
                                </div>
                            )}
                        </div>

                        <Button variant="ghost" className="text-[10px] uppercase font-black tracking-widest text-muted-foreground hover:text-primary rounded-full px-6" onClick={() => loadQibla(true)}>
                            <RefreshCw className="w-3 h-3 mr-2" /> Recalculate precisely
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
