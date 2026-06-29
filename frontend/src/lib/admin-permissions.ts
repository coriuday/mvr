export type StaffRole = "ADMIN" | "EDITOR" | "COUNSELOR";

const STAFF_ROLES: StaffRole[] = ["ADMIN", "EDITOR", "COUNSELOR"];

/** Paths each role may access in the admin panel. */
const ROLE_PATHS: Record<StaffRole, string[]> = {
  ADMIN: [
    "/admin",
    "/admin/leads",
    "/admin/users",
    "/admin/security",
    "/admin/blogs",
    "/admin/unis",
    "/admin/scholarships",
    "/admin/testimonials",
    "/admin/countries",
  ],
  COUNSELOR: ["/admin/leads"],
  EDITOR: [
    "/admin/blogs",
    "/admin/unis",
    "/admin/scholarships",
    "/admin/testimonials",
    "/admin/countries",
  ],
};

export function normalizeRole(role: unknown): StaffRole | null {
  const normalized = String(role ?? "").toUpperCase();
  if (STAFF_ROLES.includes(normalized as StaffRole)) {
    return normalized as StaffRole;
  }
  return null;
}

export function isStaffRole(role: unknown): role is StaffRole {
  return normalizeRole(role) !== null;
}

export function canAccessPath(role: unknown, path: string): boolean {
  const staffRole = normalizeRole(role);
  if (!staffRole) return false;

  const allowed = ROLE_PATHS[staffRole];
  return allowed.some((href) =>
    href === "/admin" ? path === "/admin" : path === href || path.startsWith(`${href}/`)
  );
}

export function getDefaultAdminPath(role: unknown): string {
  const staffRole = normalizeRole(role);
  switch (staffRole) {
    case "COUNSELOR":
      return "/admin/leads";
    case "EDITOR":
      return "/admin/blogs";
    case "ADMIN":
    default:
      return "/admin";
  }
}

export function shouldForceSecuritySetup(
  role: unknown,
  totpEnabled: boolean | undefined,
  options?: { bypassLock?: boolean }
): boolean {
  if (options?.bypassLock) return false;
  return normalizeRole(role) === "ADMIN" && totpEnabled === false;
}

/** Set when server 2FA setup is misconfigured — allows admin to use panel until fixed. */
export const TOTP_SETUP_BLOCKED_KEY = "mvr_2fa_setup_blocked";

export function isTotpSetupBlocked(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(TOTP_SETUP_BLOCKED_KEY) === "1";
  } catch {
    return false;
  }
}

export function setTotpSetupBlocked(blocked: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (blocked) {
      sessionStorage.setItem(TOTP_SETUP_BLOCKED_KEY, "1");
    } else {
      sessionStorage.removeItem(TOTP_SETUP_BLOCKED_KEY);
    }
  } catch {
    /* ignore */
  }
}

export const ADMIN_NAV_PATHS = ROLE_PATHS;
