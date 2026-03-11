import 'server-only';

import { getAdminAuth } from '@/firebase/admin';

export type AdminUserSummary = {
  uid: string;
  email: string | null;
};

export async function getUserByEmail(email: string) {
  const auth = getAdminAuth();
  return auth.getUserByEmail(email);
}

export async function setAdminClaim(uid: string, isAdmin: boolean) {
  const auth = getAdminAuth();
  const user = await auth.getUser(uid);
  const existingClaims = user.customClaims || {};
  const nextClaims = { ...existingClaims };

  if (isAdmin) {
    nextClaims.admin = true;
  } else {
    delete nextClaims.admin;
  }

  await auth.setCustomUserClaims(uid, nextClaims);
}

export async function listAdmins(): Promise<AdminUserSummary[]> {
  const auth = getAdminAuth();
  const admins: AdminUserSummary[] = [];
  let nextPageToken: string | undefined;

  do {
    const page = await auth.listUsers(1000, nextPageToken);
    page.users.forEach((u) => {
      if (u.customClaims?.admin === true) {
        admins.push({ uid: u.uid, email: u.email ?? null });
      }
    });
    nextPageToken = page.pageToken;
  } while (nextPageToken);

  return admins;
}
