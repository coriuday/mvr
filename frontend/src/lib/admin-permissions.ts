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

/** PascalCase role for Rust API request bodies (Admin, Editor, Counselor). */
export function toApiRole(role: StaffRole): string {
  const labels: Record<StaffRole, string> = {
    ADMIN: "Admin",
    EDITOR: "Editor",
    COUNSELOR: "Counselor",
  };
  return labels[role];
}

/** Display label for role badges (Admin, Editor, Counselor). */
export function formatRoleLabel(role: StaffRole): string {
  return toApiRole(role);
}

export const ADMIN_NAV_PATHS = ROLE_PATHS;
