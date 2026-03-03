/**
 * Admin access is intentionally NOT hardcoded by email.
 *
 * The app now relies on Firebase custom claims for admin authorization:
 * `request.auth.token.admin == true`
 *
 * Bootstrap/promote/demote APIs are provided under /api/admin/* routes.
 */
export const ADMIN_ROLE_STRATEGY = 'custom-claims';
