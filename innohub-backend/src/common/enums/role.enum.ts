import { Role as PrismaRole } from '@prisma/client';

export const Role = PrismaRole;
export type Role = PrismaRole;

export const ADMIN_ROLES = [Role.ADMIN, Role.SUPER_ADMIN] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export function isAdminRole(role?: Role | null): role is AdminRole {
  return role === Role.ADMIN || role === Role.SUPER_ADMIN;
}
