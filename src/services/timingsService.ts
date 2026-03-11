export type PrayerTimes = {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  method: number;
  timezone: string;
  date: string;
};

export type PrayerTimesResult = PrayerTimes & {
  isFromCache?: boolean;
  isOfflineFallback?: boolean;
  cacheDateUsed?: string;
};

type GetPrayerTimesParams = {
  lat: number;
  lon: number;
  method: number;
};

type TimingsCacheRecord = {
  timestamp: number;
  locationKey: string;
  dateKey: string;
  method: number;
  data: PrayerTimes;
};

const CACHE_KEY = 'prayer_timings_cache_v1';
const REQUEST_TIMEOUT_MS = 10000;

function fetchWithTimeout(url: string, timeoutMs = REQUEST_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timeout));
}

function getDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getLocationKey(lat: number, lon: number): string {
  return `${lat.toFixed(3)},${lon.toFixed(3)}`;
}

function parseTime(value: string | undefined): string {
  if (!value) return '--:--';
  return value.split(' ')[0];
}

function parseApiToPrayerTimes(payload: any, method: number): PrayerTimes {
  return {
    fajr: parseTime(payload?.timings?.Fajr),
    sunrise: parseTime(payload?.timings?.Sunrise),
    dhuhr: parseTime(payload?.timings?.Dhuhr),
    asr: parseTime(payload?.timings?.Asr),
    maghrib: parseTime(payload?.timings?.Maghrib),
    isha: parseTime(payload?.timings?.Isha),
    method,
    timezone: payload?.meta?.timezone || 'UTC',
    date: payload?.date?.gregorian?.date || getDateKey(),
  };
}

function getAllCacheRecords(): TimingsCacheRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TimingsCacheRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAllCacheRecords(records: TimingsCacheRecord[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CACHE_KEY, JSON.stringify(records.slice(-50)));
}

function getCachedRecord(locationKey: string, dateKey: string, method: number): TimingsCacheRecord | null {
  const records = getAllCacheRecords();
  return records.find(
    (entry) => entry.locationKey === locationKey && entry.dateKey === dateKey && entry.method === method,
  ) || null;
}

function saveCachedRecord(record: TimingsCacheRecord) {
  const records = getAllCacheRecords().filter(
    (entry) => !(entry.locationKey === record.locationKey && entry.dateKey === record.dateKey && entry.method === record.method),
  );
  records.push(record);
  saveAllCacheRecords(records);
}

async function fetchFromAladhan(lat: number, lon: number, method: number): Promise<PrayerTimes> {
  const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=${method}`;
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new Error(`Timings API failed with status ${response.status}`);
  }
  const json = await response.json();
  if (json?.code !== 200 || !json?.data) {
    throw new Error('Invalid timings response');
  }
  return parseApiToPrayerTimes(json.data, method);
}

async function fetchWithSingleRetry(lat: number, lon: number, method: number): Promise<PrayerTimes> {
  try {
    return await fetchFromAladhan(lat, lon, method);
  } catch {
    return await fetchFromAladhan(lat, lon, method);
  }
}

function subtractDays(input: string, days: number): string {
  const date = new Date(`${input}T00:00:00`);
  date.setDate(date.getDate() - days);
  return getDateKey(date);
}

export const timingsService = {
  async getPrayerTimes(params: GetPrayerTimesParams): Promise<PrayerTimesResult> {
    const { lat, lon, method } = params;
    const dateKey = getDateKey();
    const locationKey = getLocationKey(lat, lon);

    const currentCache = getCachedRecord(locationKey, dateKey, method);

    try {
      const fresh = await fetchWithSingleRetry(lat, lon, method);
      saveCachedRecord({
        timestamp: Date.now(),
        locationKey,
        dateKey,
        method,
        data: fresh,
      });
      return fresh;
    } catch {
      if (currentCache) {
        return {
          ...currentCache.data,
          isFromCache: true,
          isOfflineFallback: true,
          cacheDateUsed: currentCache.dateKey,
        };
      }

      const yesterdayKey = subtractDays(dateKey, 1);
      const yesterdayCache = getCachedRecord(locationKey, yesterdayKey, method);
      if (yesterdayCache) {
        return {
          ...yesterdayCache.data,
          isFromCache: true,
          isOfflineFallback: true,
          cacheDateUsed: yesterdayCache.dateKey,
        };
      }

      throw new Error('Unable to fetch prayer timings and no cache available');
    }
  },
};
