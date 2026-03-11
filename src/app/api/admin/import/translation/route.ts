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
} from '@/lib/server/admin-import';

const ENV_BY_LANG: Record<string, string> = {
  en: 'QURAN_TRANS_EN_URL',
  ur: 'QURAN_TRANS_UR_URL',
  hi: 'QURAN_TRANS_HI_URL',
};

const COUNT_ENV_BY_LANG: Record<string, string> = {
  en: 'QURAN_TRANS_EN_EXPECTED_COUNT',
  ur: 'QURAN_TRANS_UR_EXPECTED_COUNT',
  hi: 'QURAN_TRANS_HI_EXPECTED_COUNT',
};

export async function POST(request: Request) {
  try {
    assertAdminSecret(request);

    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || '').toLowerCase();

    if (!['en', 'ur', 'hi'].includes(lang)) {
      return NextResponse.json({ ok: false, error: 'Invalid lang. Use en|ur|hi' }, { status: 400 });
    }

    const payload = await fetchJsonFromEnv(ENV_BY_LANG[lang]);
    const ayahs = normalizeAyahDataset(payload).filter((a) => Boolean(a.translation));
    assertCountOrThrow(`Quran ${lang} translation ayahs`, ayahs.length, COUNT_ENV_BY_LANG[lang], 6236);

    await upsertSurahMeta();
    const db = getAdminDb();

    const result = await runResumableImport({
      jobName: `quran-translation-${lang}`,
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
              [`translations.${lang}`]: ayah.translation,
            },
            { merge: true }
          );
        });
        await batch.commit();
      },
    });

    return NextResponse.json({ ...result, lang });
  } catch (error: any) {
    const message = error?.message || 'Import failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
