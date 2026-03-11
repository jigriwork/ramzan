import { NextResponse } from 'next/server';
import { getUserByEmail, listAdmins, setAdminClaim } from '@/firebase/admin-claims';

type Payload = {
  email?: string;
};

export async function POST(request: Request) {
  const providedSecret = request.headers.get('x-admin-secret');
  const expectedSecret = process.env.ADMIN_PROMOTE_SECRET;

  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ ok: false, error: 'Email is required' }, { status: 400 });
  }

  try {
    const existingAdmins = await listAdmins();
    if (existingAdmins.length > 0) {
      return NextResponse.json({ ok: false, error: 'Admin already exists' }, { status: 409 });
    }

    const user = await getUserByEmail(email);
    await setAdminClaim(user.uid, true);

    return NextResponse.json({
      ok: true,
      action: 'bootstrap-admin',
      uid: user.uid,
      email: user.email,
    });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || 'Bootstrap failed' }, { status: 500 });
  }
}
