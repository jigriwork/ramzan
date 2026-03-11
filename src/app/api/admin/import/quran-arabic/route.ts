import { NextResponse } from 'next/server';
import { getAdminDb } from '@/firebase/admin';
import {
  assertAdminSecret,
  assertCountOrThrow,
  fetchJsonFromEnv,
  normalizeAyahDataset,
  runResumableImport,
  toAyahDocId,
  upsertSurahMeta,
  upsertJuzMeta,
} from '@/lib/server/admin-import';

export async function POST(request: Request) {
  try {
    assertAdminSecret(request);

    const payload = await fetchJsonFromEnv('QURAN_AR_URL');
    const ayahs = normalizeAyahDataset(payload).filter((a) => Boolean(a.text));

    assertCountOrThrow('Quran Arabic ayahs', ayahs.length, 'QURAN_AR_EXPECTED_COUNT', 6236);

    await upsertSurahMeta();
    await upsertJuzMeta();

    const db = getAdminDb();

    const result = await runResumableImport({
      jobName: 'quran-arabic',
      total: ayahs.length,
      writeChunk: async (start, end) => {
        const batch = db.batch();
        ayahs.slice(start, end).forEach((ayah) => {
          const ref = db.collection('quran_ayahs').doc(toAyahDocId(ayah.surahId, ayah.ayahNumber));
          batch.set(
            ref,
            {
              surahId: ayah.surahId,
              ayahNumber: ayah.ayahNumber,
              text_ar: ayah.text,
              ...(ayah.juz ? { juz: ayah.juz } : {}),
              ...(ayah.page ? { page: ayah.page } : {}),
            },
            { merge: true }
          );
        });
        await batch.commit();
      },
    });

    return NextResponse.json(result);
  } catch (error: any) {
    const message = error?.message || 'Import failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
