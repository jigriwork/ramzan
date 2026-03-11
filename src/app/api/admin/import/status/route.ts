import { NextResponse } from 'next/server';
import { getAdminDb } from '@/firebase/admin';
import { assertAdminSecret } from '@/lib/server/admin-import';

type ImportStatusSnapshot = {
  jobName: string;
  total: number;
  cursor: number;
  completed: boolean;
  done: boolean;
  startedAt?: string;
  updatedAt?: string;
  completedAt?: string;
  lastError?: string | null;
};

async function countCollection(collectionName: string): Promise<number> {
  const db = getAdminDb();
  try {
    const aggregateSnap = await db.collection(collectionName).count().get();
    return Number(aggregateSnap.data().count || 0);
  } catch {
    const snap = await db.collection(collectionName).get();
    return snap.size;
  }
}

export async function GET(request: Request) {
  try {
    assertAdminSecret(request);

    const db = getAdminDb();
    const importStatusSnap = await db.collection('import_status').get();

    const importStatus: ImportStatusSnapshot[] = importStatusSnap.docs
      .map((doc) => {
        const data = (doc.data() || {}) as Record<string, any>;
        const completed = Boolean(data.completed);
        return {
          jobName: String(data.jobName || doc.id),
          total: Number(data.total || 0),
          cursor: Number(data.cursor || 0),
          completed,
          done: completed,
          startedAt: data.startedAt,
          updatedAt: data.updatedAt,
          completedAt: data.completedAt,
          lastError: data.lastError || null,
        };
      })
      .sort((a, b) => a.jobName.localeCompare(b.jobName));

    const importStatusByJob = importStatus.reduce<Record<string, ImportStatusSnapshot>>((acc, item) => {
      acc[item.jobName] = item;
      return acc;
    }, {});

    const quranAyahCount = await countCollection('quran_ayahs').catch(
      () => Number(importStatusByJob['quran-arabic']?.cursor || importStatusByJob['quran-arabic']?.total || 0)
    );

    const counts = {
      quran_surahs: await countCollection('quran_surahs'),
      quran_ayahs: quranAyahCount,
      duas: await countCollection('duas'),
      dua_collections: await countCollection('dua_collections'),
      namaz_steps: await countCollection('namaz_steps'),
    };

    return NextResponse.json({
      ok: true,
      importStatus,
      importStatusByJob,
      counts,
    });
  } catch (error: any) {
    const message = error?.message || 'Failed to fetch import status';
    const status = message === 'Unauthorized' ? 401 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
