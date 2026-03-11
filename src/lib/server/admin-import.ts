import 'server-only';

import { getAdminDb } from '@/firebase/admin';
import { QURAN_SURAH_META } from '@/lib/data/quran-surah-meta';

type UnknownRecord = Record<string, unknown>;

export const IMPORT_BATCH_SIZE = 425;
const DEFAULT_MAX_BATCHES_PER_RUN = Number(process.env.IMPORT_MAX_BATCHES_PER_RUN || 6);

export type ImportStatus = {
  jobName: string;
  total: number;
  cursor: number;
  completed: boolean;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
  lastError?: string;
};

export function assertAdminSecret(request: Request) {
  const providedSecret = request.headers.get('x-admin-secret');
  const expectedSecret = process.env.ADMIN_IMPORT_SECRET || process.env.ADMIN_PROMOTE_SECRET;

  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    throw new Error('Unauthorized');
  }
}

export async function fetchJsonFromEnv(envKey: string) {
  const url = process.env[envKey];
  if (!url) {
    throw new Error(`Missing environment variable: ${envKey}`);
  }

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to download dataset from ${envKey} (${res.status})`);
  }

  return res.json();
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

export function toAyahDocId(surahId: string | number, ayahNumber: string | number) {
  return `${String(surahId)}:${String(ayahNumber)}`;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function pickNumber(row: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const raw = row[key];
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    if (typeof raw === 'string' && raw.trim() !== '' && Number.isFinite(Number(raw))) return Number(raw);
  }
  return undefined;
}

function pickString(row: UnknownRecord, keys: string[]) {
  for (const key of keys) {
    const raw = row[key];
    if (typeof raw === 'string' && raw.trim() !== '') return raw.trim();
  }
  return undefined;
}

export type NormalizedAyah = {
  surahId: string;
  ayahNumber: number;
  text?: string;
  transliteration?: string;
  translation?: string;
  juz?: number;
  page?: number;
};

export type NormalizedDua = {
  id: string;
  title: string;
  category: string;
  arabic: string;
  transliteration: string;
  translation_en: string;
  translation_ur?: string;
  translation_hi?: string;
};

export type NormalizedDuaCollection = {
  id: string;
  title: string;
  image?: string;
  duaIds: string[];
};

export type NormalizedNamazStep = {
  id: string;
  order: number;
  title: string;
  instruction: string;
  arabic: string;
  transliteration: string;
  translation_en: string;
  translation_ur?: string;
  translation_hi?: string;
};

export function normalizeAyahDataset(payload: unknown): NormalizedAyah[] {
  const rows: unknown[] = [];

  const obj = (payload && typeof payload === 'object' ? payload : null) as UnknownRecord | null;
  const data = obj?.data;

  if (Array.isArray(payload)) rows.push(...payload);
  if (Array.isArray(obj?.ayahs)) rows.push(...asArray(obj?.ayahs));
  if (Array.isArray(obj?.verses)) rows.push(...asArray(obj?.verses));
  if (Array.isArray(obj?.quran)) rows.push(...asArray(obj?.quran));
  if (Array.isArray(data)) rows.push(...asArray(data));

  if (data && typeof data === 'object') {
    const dataObj = data as UnknownRecord;
    if (Array.isArray(dataObj.ayahs)) rows.push(...asArray(dataObj.ayahs));
    if (Array.isArray(dataObj.verses)) rows.push(...asArray(dataObj.verses));

    const surahs = asArray(dataObj.surahs);
    surahs.forEach((surah) => {
      if (!surah || typeof surah !== 'object') return;
      const surahObj = surah as UnknownRecord;
      const surahNumber = pickNumber(surahObj, ['id', 'number', 'surah', 'surahId']);
      asArray(surahObj.ayahs).forEach((ayah) => {
        if (!ayah || typeof ayah !== 'object') return;
        rows.push({ ...(ayah as UnknownRecord), surahId: surahNumber ?? (ayah as UnknownRecord).surahId });
      });
    });
  }

  return rows
    .map((row): NormalizedAyah | null => {
      if (!row || typeof row !== 'object') return null;
      const r = row as UnknownRecord;

      const surah = pickNumber(r, ['surahId', 'surah', 'sura', 'chapter', 'chapter_number', 'surah_number']);
      const ayah = pickNumber(r, ['ayahNumber', 'ayah', 'aya', 'verse', 'verse_number', 'numberInSurah']);
      if (!surah || !ayah) return null;

      const text = pickString(r, ['text_ar', 'text', 'arabic', 'uthmani', 'quranText']);
      const transliteration = pickString(r, ['translit_en', 'transliteration', 'translit', 'latin']);
      const translation = pickString(r, ['translation', 'translation_text', 'text_en', 'text']);
      const juz = pickNumber(r, ['juz', 'juzNumber']);
      const page = pickNumber(r, ['page', 'pageNumber']);

      return {
        surahId: String(surah),
        ayahNumber: ayah,
        text,
        transliteration,
        translation,
        juz,
        page,
      };
    })
    .filter((v): v is NormalizedAyah => Boolean(v));
}

function pickNestedTranslation(record: UnknownRecord, lang: 'en' | 'ur' | 'hi') {
  const nested = record.translations;
  if (nested && typeof nested === 'object') {
    const v = (nested as UnknownRecord)[lang];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return pickString(record, [`translation_${lang}`, `text_${lang}`]);
}

export function normalizeDuasDataset(payload: unknown) {
  const root = (payload && typeof payload === 'object' ? payload : {}) as UnknownRecord;
  const duasRows = Array.isArray(payload)
    ? payload
    : asArray(root.duas).length
      ? asArray(root.duas)
      : asArray(root.data);
  const collectionsRows = asArray(root.collections);

  const duas: NormalizedDua[] = [];
  duasRows.forEach((row, index) => {
    if (!row || typeof row !== 'object') return;
    const r = row as UnknownRecord;
    const title = pickString(r, ['title', 'name']);
    const arabic = pickString(r, ['arabic', 'text_ar', 'text']);
    const transliteration = pickString(r, ['transliteration', 'translit_en', 'translit']);
    const translation_en = pickNestedTranslation(r, 'en') || pickString(r, ['translation', 'translation_text']);

    if (!title || !arabic || !transliteration || !translation_en) return;

    const sourceId = pickString(r, ['id', 'slug']) || `${slugify(title)}-${index + 1}`;
    const normalized: NormalizedDua = {
      id: sourceId,
      title,
      category: pickString(r, ['category']) || 'General',
      arabic,
      transliteration,
      translation_en,
    };

    const ur = pickNestedTranslation(r, 'ur');
    const hi = pickNestedTranslation(r, 'hi');
    if (ur) normalized.translation_ur = ur;
    if (hi) normalized.translation_hi = hi;
    duas.push(normalized);
  });

  const collections: NormalizedDuaCollection[] = [];
  collectionsRows.forEach((row, index) => {
    if (!row || typeof row !== 'object') return;
    const r = row as UnknownRecord;
    const title = pickString(r, ['title', 'name']);
    const duaIds = asArray(r.duaIds).map(String).filter(Boolean);
    if (!title || duaIds.length === 0) return;

    const normalized: NormalizedDuaCollection = {
      id: pickString(r, ['id', 'slug']) || `${slugify(title)}-${index + 1}`,
      title,
      duaIds,
    };
    const image = pickString(r, ['image']);
    if (image) normalized.image = image;
    collections.push(normalized);
  });

  return { duas, collections };
}

export function normalizeNamazStepsDataset(payload: unknown): NormalizedNamazStep[] {
  const root = (payload && typeof payload === 'object' ? payload : {}) as UnknownRecord;
  const rows = Array.isArray(payload)
    ? payload
    : asArray(root.steps).length
      ? asArray(root.steps)
      : asArray(root.data);

  const steps: NormalizedNamazStep[] = [];
  rows.forEach((row, index) => {
    if (!row || typeof row !== 'object') return;
    const r = row as UnknownRecord;
    const title = pickString(r, ['title', 'name']);
    const instruction = pickString(r, ['instruction', 'whatToSay', 'description']) || 'Recite:';
    const arabic = pickString(r, ['arabic', 'text_ar', 'text']);
    const transliteration = pickString(r, ['transliteration', 'translit_en', 'translit']);
    const translation_en = pickNestedTranslation(r, 'en') || pickString(r, ['translation']);

    if (!title || !arabic || !transliteration || !translation_en) return;

    const normalized: NormalizedNamazStep = {
      id: pickString(r, ['id', 'slug']) || `${slugify(title)}-${index + 1}`,
      order: pickNumber(r, ['order', 'index', 'step']) || index + 1,
      title,
      instruction,
      arabic,
      transliteration,
      translation_en,
    };
    const ur = pickNestedTranslation(r, 'ur');
    const hi = pickNestedTranslation(r, 'hi');
    if (ur) normalized.translation_ur = ur;
    if (hi) normalized.translation_hi = hi;
    steps.push(normalized);
  });

  return steps;
}

export async function upsertSurahMeta() {
  const db = getAdminDb();

  for (let i = 0; i < QURAN_SURAH_META.length; i += IMPORT_BATCH_SIZE) {
    const batch = db.batch();
    const slice = QURAN_SURAH_META.slice(i, i + IMPORT_BATCH_SIZE);
    slice.forEach((surah) => {
      const ref = db.collection('quran_surahs').doc(String(surah.id));
      batch.set(ref, surah, { merge: true });
    });
    await batch.commit();
  }
}

export async function upsertJuzMeta() {
  const db = getAdminDb();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { QURAN_JUZ_META } = require('@/lib/data/quran-surah-meta');

  for (let i = 0; i < QURAN_JUZ_META.length; i += IMPORT_BATCH_SIZE) {
    const batch = db.batch();
    const slice = QURAN_JUZ_META.slice(i, i + IMPORT_BATCH_SIZE);
    slice.forEach((juz: any) => {
      const ref = db.collection('quran_juzs').doc(String(juz.id));
      batch.set(ref, juz, { merge: true });
    });
    await batch.commit();
  }
}

export async function runResumableImport(params: {
  jobName: string;
  total: number;
  maxBatches?: number;
  writeChunk: (start: number, end: number) => Promise<void>;
}) {
  const db = getAdminDb();
  const now = new Date().toISOString();
  const statusRef = db.collection('import_status').doc(params.jobName);
  const existing = await statusRef.get();
  const existingData = (existing.data() || {}) as Partial<ImportStatus>;
  const cursor = Number(existingData.cursor || 0);

  await statusRef.set(
    {
      jobName: params.jobName,
      total: params.total,
      cursor,
      completed: false,
      startedAt: existingData.startedAt || now,
      updatedAt: now,
      lastError: null,
    },
    { merge: true }
  );

  let current = cursor;
  let batches = 0;
  const maxBatches = Number.isFinite(params.maxBatches) && params.maxBatches && params.maxBatches > 0
    ? params.maxBatches
    : DEFAULT_MAX_BATCHES_PER_RUN;

  try {
    while (current < params.total && batches < maxBatches) {
      const next = Math.min(params.total, current + IMPORT_BATCH_SIZE);
      await params.writeChunk(current, next);
      current = next;
      batches += 1;

      await statusRef.set(
        {
          cursor: current,
          completed: current >= params.total,
          updatedAt: new Date().toISOString(),
          ...(current >= params.total ? { completedAt: new Date().toISOString() } : {}),
        },
        { merge: true }
      );
    }

    return {
      ok: true,
      jobName: params.jobName,
      total: params.total,
      cursor: current,
      completed: current >= params.total,
      hasMore: current < params.total,
      batchesProcessed: batches,
    };
  } catch (error: any) {
    await statusRef.set(
      {
        updatedAt: new Date().toISOString(),
        lastError: error?.message || 'Import failed',
      },
      { merge: true }
    );
    throw error;
  }
}

export function assertCountOrThrow(name: string, actual: number, envExpectedKey: string, fallbackExpected?: number) {
  const expectedFromEnv = process.env[envExpectedKey] ? Number(process.env[envExpectedKey]) : undefined;
  const expected = Number.isFinite(expectedFromEnv) ? expectedFromEnv : fallbackExpected;
  if (expected && actual !== expected) {
    throw new Error(`${name} validation failed. Expected ${expected}, got ${actual}`);
  }
}
