import { NextResponse } from 'next/server';
import { getAdminDb } from '@/firebase/admin';
import {
  assertAdminSecret,
  assertCountOrThrow,
  fetchJsonFromEnv,
  normalizeDuasDataset,
  runResumableImport,
} from '@/lib/server/admin-import';

export async function POST(request: Request) {
  try {
    assertAdminSecret(request);

    const payload = await fetchJsonFromEnv('DUAS_URL');
    const { duas, collections } = normalizeDuasDataset(payload);

    assertCountOrThrow('Duas', duas.length, 'DUAS_EXPECTED_COUNT');
    assertCountOrThrow('Dua collections', collections.length, 'DUA_COLLECTIONS_EXPECTED_COUNT');

    const db = getAdminDb();

    const duaResult = await runResumableImport({
      jobName: 'duas',
      total: duas.length,
      writeChunk: async (start, end) => {
        const batch = db.batch();
        duas.slice(start, end).forEach((dua) => {
          const ref = db.collection('duas').doc(dua.id);
          batch.set(ref, dua, { merge: true });
        });
        await batch.commit();
      },
    });

    const collectionsResult = await runResumableImport({
      jobName: 'dua-collections',
      total: collections.length,
      writeChunk: async (start, end) => {
        const batch = db.batch();
        collections.slice(start, end).forEach((collection) => {
          const ref = db.collection('dua_collections').doc(collection.id);
          batch.set(ref, collection, { merge: true });
        });
        await batch.commit();
      },
    });

    return NextResponse.json({
      ok: true,
      duas: duaResult,
      collections: collectionsResult,
    });
  } catch (error: any) {
    const message = error?.message || 'Import failed';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
