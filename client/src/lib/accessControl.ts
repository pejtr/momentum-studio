export type RoleAwareUser = { role?: string | null } | null | undefined;

export type RoleAwareMenuItem = {
  requiresAdmin?: boolean;
};

export function canAccessAdminRoute(user: RoleAwareUser): boolean {
  return user?.role === "admin";
}

export function getAccessibleMenuItems<T extends RoleAwareMenuItem>(items: readonly T[], user: RoleAwareUser): T[] {
  return items.filter((item) => !item.requiresAdmin || canAccessAdminRoute(user));
}
