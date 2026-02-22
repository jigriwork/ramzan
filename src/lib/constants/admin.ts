/**
 * Admin access is intentionally NOT hardcoded by email.
 *
 * Development currently relies on Firestore rules that allow writes for
 * verified-email users where needed.
 *
 * TODO: Replace this placeholder strategy with Firebase custom claims
 * (e.g. `request.auth.token.admin == true`) once backend admin role
 * management is finalized.
 */
export const ADMIN_ROLE_STRATEGY = 'custom-claims-pending';
