import { doc, getDoc, Firestore } from 'firebase/firestore';

export type LocationSource = 'firestore' | 'geolocation' | 'ip' | 'default' | 'cache';

export type DetectedLocation = {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  source: LocationSource;
};

type LocationCachePayload = {
  timestamp: number;
  data: DetectedLocation;
};

type DetectLocationOptions = {
  db?: Firestore;
  uid?: string;
  preferredCity?: string;
  forceRefresh?: boolean;
};

const CACHE_KEY = 'prayer_location_cache_v1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const MAKKAH_FALLBACK: DetectedLocation = {
  city: 'Makkah',
  country: 'Saudi Arabia',
  latitude: 21.4225,
  longitude: 39.8262,
  source: 'default',
};

const INDIA_COUNTRY_NAMES = ['india', 'bharat', 'in'];

function isIndiaCountry(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return INDIA_COUNTRY_NAMES.some((name) => normalized === name || normalized.includes(name));
}

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function getCachedLocation(): LocationCachePayload | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LocationCachePayload;
    if (!parsed?.timestamp || !parsed?.data) return null;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function cacheLocation(location: DetectedLocation) {
  if (typeof window === 'undefined') return;
  const payload: LocationCachePayload = {
    timestamp: Date.now(),
    data: location,
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

async function geocodeCity(city: string): Promise<Omit<DetectedLocation, 'source'> | null> {
  try {
    const q = encodeURIComponent(city);
    const res = await fetchWithTimeout(`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${q}%2C%20India`);
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat?: string; lon?: string; display_name?: string }>;
    if (!Array.isArray(data) || data.length === 0) return null;
    const first = data[0];
    const latitude = Number(first.lat);
    const longitude = Number(first.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

    const parts = (first.display_name || '').split(',').map((p) => p.trim()).filter(Boolean);
    const country = parts.length > 0 ? parts[parts.length - 1] : 'India';
    if (!isIndiaCountry(country)) return null;
    return {
      city,
      country: 'India',
      latitude,
      longitude,
    };
  } catch {
    return null;
  }
}

async function reverseGeocode(lat: number, lon: number): Promise<{ city: string; country: string }> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return { city: 'Current Location', country: 'Unknown' };
    const data = (await res.json()) as {
      city?: string;
      locality?: string;
      principalSubdivision?: string;
      countryName?: string;
    };
    const city = data.city || data.locality || data.principalSubdivision || 'Current Location';
    return { city, country: data.countryName || 'Unknown' };
  } catch {
    return { city: 'Current Location', country: 'Unknown' };
  }
}

async function getBrowserGeolocation(): Promise<DetectedLocation | null> {
  if (typeof window === 'undefined' || !navigator.geolocation) return null;
  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 300000,
      });
    });
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const place = await reverseGeocode(latitude, longitude);
    if (!isIndiaCountry(place.country)) return null;

    return {
      city: place.city,
      country: 'India',
      latitude,
      longitude,
      source: 'geolocation',
    };
  } catch {
    return null;
  }
}

async function getIpLocation(): Promise<DetectedLocation | null> {
  try {
    const res = await fetchWithTimeout('https://ipapi.co/json/');
    if (!res.ok) return null;
    const data = (await res.json()) as {
      city?: string;
      country_name?: string;
      latitude?: number;
      longitude?: number;
    };
    if (!Number.isFinite(data.latitude) || !Number.isFinite(data.longitude)) return null;
    if (!isIndiaCountry(data.country_name)) return null;
    return {
      city: data.city || 'Unknown City',
      country: 'India',
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      source: 'ip',
    };
  } catch {
    return null;
  }
}

async function getSavedCityFromFirestore(db?: Firestore, uid?: string): Promise<string | null> {
  if (!db || !uid) return null;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    const data = snap.data() as { city?: string };
    return typeof data.city === 'string' && data.city.trim() ? data.city.trim() : null;
  } catch {
    return null;
  }
}

export const locationService = {
  async detectLocation(options: DetectLocationOptions = {}): Promise<DetectedLocation> {
    const { db, uid, preferredCity, forceRefresh = false } = options;
    const cached = !forceRefresh ? getCachedLocation() : null;

    const savedCity = preferredCity?.trim() || await getSavedCityFromFirestore(db, uid);
    if (savedCity) {
      if (cached?.data?.city?.toLowerCase() === savedCity.toLowerCase() && isIndiaCountry(cached.data.country)) {
        return { ...cached.data, source: 'cache' };
      }
      const geocoded = await geocodeCity(savedCity);
      if (geocoded) {
        const resolved: DetectedLocation = { ...geocoded, source: 'firestore' };
        cacheLocation(resolved);
        return resolved;
      }
    }

    if (cached && isIndiaCountry(cached.data.country)) {
      return { ...cached.data, source: 'cache' };
    }

    const geo = await getBrowserGeolocation();
    if (geo) {
      cacheLocation(geo);
      return geo;
    }

    const ip = await getIpLocation();
    if (ip) {
      cacheLocation(ip);
      return ip;
    }

    cacheLocation(MAKKAH_FALLBACK);
    return MAKKAH_FALLBACK;
  },
};
