import { NextResponse } from 'next/server';
import { getAdminDb } from '@/firebase/admin';
import { QURAN_SURAHS, QURAN_AYAH_MOCK, DUAS } from '@/lib/data/seed';
import duaMock from '@/mock/duas.json';

export async function POST(request: Request) {
  const providedKey = request.headers.get('x-admin-seed-key');
  const expectedKey = process.env.ADMIN_SEED_KEY;

  if (!expectedKey || !providedKey || providedKey !== expectedKey) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const batch = db.batch();

    // Quran Surahs (fixed IDs; idempotent via merge)
    QURAN_SURAHS.forEach((surah) => {
      const ref = db.collection('quran_surahs').doc(String(surah.id));
      batch.set(ref, surah, { merge: true });
    });

    // Quran Ayahs for seeded surahs (fixed IDs; idempotent)
    QURAN_AYAH_MOCK.forEach((ayah) => {
      const id = `${ayah.surahId}_${ayah.ayahNo}`;
      const ref = db.collection('quran_ayahs').doc(id);
      batch.set(ref, ayah, { merge: true });
    });

    // Duas (small set)
    DUAS.forEach((dua) => {
      const ref = db.collection('duas').doc(String(dua.id));
      batch.set(ref, dua, { merge: true });
    });

    // Dua collections (small set)
    (duaMock.collections || []).slice(0, 4).forEach((collectionItem) => {
      const ref = db.collection('dua_collections').doc(String(collectionItem.id));
      batch.set(ref, collectionItem, { merge: true });
    });

    await batch.commit();

    return NextResponse.json({
      ok: true,
      seeded: {
        surahs: QURAN_SURAHS.length,
        ayahs: QURAN_AYAH_MOCK.length,
        duas: DUAS.length,
        collections: Math.min((duaMock.collections || []).length, 4),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || 'Seed failed' },
      { status: 500 }
    );
  }
}
