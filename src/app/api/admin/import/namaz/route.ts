import { NextResponse } from 'next/server';
import { getAdminDb } from '@/firebase/admin';
import {
  assertAdminSecret,
  assertCountOrThrow,
  fetchJsonFromEnv,
  normalizeNamazStepsDataset,
  runResumableImport,
} from '@/lib/server/admin-import';

export async function POST(request: Request) {
  try {
    assertAdminSecret(request);

    const payload = await fetchJsonFromEnv('NAMAZ_STEPS_URL');
    const steps = normalizeNamazStepsDataset(payload);
    assertCountOrThrow('Namaz steps', steps.length, 'NAMAZ_STEPS_EXPECTED_COUNT');

    const db = getAdminDb();
    const result = await runResumableImport({
      jobName: 'namaz-steps',
      total: steps.length,
      writeChunk: async (start, end) => {
        const batch = db.batch();
        steps.slice(start, end).forEach((step) => {
          const ref = db.collection('namaz_steps').doc(step.id);
          batch.set(ref, step, { merge: true });
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
