import { doc, getDoc, setDoc, type Firestore } from 'firebase/firestore';
import {
    KAABA_COORDINATES,
    calculateQiblaBearing,
    validateCoordinates,
    type CoordinateValidationErrorCode,
} from '@/lib/qibla';
import { locationService } from '@/services/locationService';

export type QiblaStatus = 'success' | 'error';

export type QiblaError = {
    code: CoordinateValidationErrorCode | 'INTERNAL_ERROR';
    message: string;
};

export type QiblaResult = {
    success: boolean;
    status: QiblaStatus;
    qiblaBearing: number | null;
    userLatitude: number | null;
    userLongitude: number | null;
    kaabaLatitude: number;
    kaabaLongitude: number;
    error: QiblaError | null;
};

export type LastKnownQiblaSettings = {
    lastLatitude: number;
    lastLongitude: number;
    lastQiblaBearing: number;
    qiblaUpdatedAt: string;
};

type GetQiblaOptions = {
    latitude: unknown;
    longitude: unknown;
};

type ResolveQiblaFromLocationOptions = {
    db?: Firestore;
    uid?: string;
    preferredCity?: string;
    forceRefresh?: boolean;
};

type SaveLastKnownQiblaOptions = {
    db?: Firestore;
    uid?: string;
    payload: LastKnownQiblaSettings;
};

const QIBLA_CACHE_KEY = 'qibla_last_known_v1';

function normalizeSavedQibla(input: unknown): LastKnownQiblaSettings | null {
    if (!input || typeof input !== 'object') return null;
    const raw = input as Partial<LastKnownQiblaSettings>;

    if (
        typeof raw.lastLatitude !== 'number' ||
        typeof raw.lastLongitude !== 'number' ||
        typeof raw.lastQiblaBearing !== 'number' ||
        typeof raw.qiblaUpdatedAt !== 'string'
    ) {
        return null;
    }

    return {
        lastLatitude: raw.lastLatitude,
        lastLongitude: raw.lastLongitude,
        lastQiblaBearing: raw.lastQiblaBearing,
        qiblaUpdatedAt: raw.qiblaUpdatedAt,
    };
}

function saveQiblaToLocal(payload: LastKnownQiblaSettings) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(QIBLA_CACHE_KEY, JSON.stringify(payload));
}

function readQiblaFromLocal(): LastKnownQiblaSettings | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(QIBLA_CACHE_KEY);
        if (!raw) return null;
        return normalizeSavedQibla(JSON.parse(raw));
    } catch {
        return null;
    }
}

export const qiblaService = {
    getQiblaFromCoordinates(options: GetQiblaOptions): QiblaResult {
        const validated = validateCoordinates(options.latitude, options.longitude);
        if (!validated.valid) {
            return {
                success: false,
                status: 'error',
                qiblaBearing: null,
                userLatitude: null,
                userLongitude: null,
                kaabaLatitude: KAABA_COORDINATES.latitude,
                kaabaLongitude: KAABA_COORDINATES.longitude,
                error: {
                    code: validated.code,
                    message: validated.message,
                },
            };
        }

        const qiblaBearing = calculateQiblaBearing(validated.latitude, validated.longitude);
        return {
            success: true,
            status: 'success',
            qiblaBearing,
            userLatitude: validated.latitude,
            userLongitude: validated.longitude,
            kaabaLatitude: KAABA_COORDINATES.latitude,
            kaabaLongitude: KAABA_COORDINATES.longitude,
            error: null,
        };
    },

    async resolveQiblaFromDetectedLocation(options: ResolveQiblaFromLocationOptions = {}): Promise<QiblaResult> {
        try {
            const detected = await locationService.detectLocation(options);
            return qiblaService.getQiblaFromCoordinates({
                latitude: detected.latitude,
                longitude: detected.longitude,
            });
        } catch {
            return {
                success: false,
                status: 'error',
                qiblaBearing: null,
                userLatitude: null,
                userLongitude: null,
                kaabaLatitude: KAABA_COORDINATES.latitude,
                kaabaLongitude: KAABA_COORDINATES.longitude,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to resolve location for Qibla calculation.',
                },
            };
        }
    },

    async saveLastKnownQibla(options: SaveLastKnownQiblaOptions): Promise<void> {
        const normalized = normalizeSavedQibla(options.payload);
        if (!normalized) return;

        saveQiblaToLocal(normalized);

        if (!options.db || !options.uid) return;

        try {
            await setDoc(
                doc(options.db, 'users', options.uid),
                {
                    settings: {
                        qibla: {
                            lastLatitude: normalized.lastLatitude,
                            lastLongitude: normalized.lastLongitude,
                            lastQiblaBearing: normalized.lastQiblaBearing,
                            qiblaUpdatedAt: normalized.qiblaUpdatedAt,
                        },
                    },
                    updatedAt: new Date().toISOString(),
                },
                { merge: true },
            );
        } catch {
            // Local cache remains source of truth fallback.
        }
    },

    async getLastKnownQibla(options: { db?: Firestore; uid?: string } = {}): Promise<LastKnownQiblaSettings | null> {
        if (options.db && options.uid) {
            try {
                const snap = await getDoc(doc(options.db, 'users', options.uid));
                if (snap.exists()) {
                    const data = snap.data() as Record<string, unknown>;
                    const settings = (data.settings && typeof data.settings === 'object')
                        ? (data.settings as Record<string, unknown>)
                        : null;
                    const qiblaRaw = settings?.qibla;
                    const cloud = normalizeSavedQibla(qiblaRaw);
                    if (cloud) {
                        saveQiblaToLocal(cloud);
                        return cloud;
                    }
                }
            } catch {
                // fall back to local cache
            }
        }

        return readQiblaFromLocal();
    },
};
