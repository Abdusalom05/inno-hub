import type { Prisma } from '@prisma/client';

export const authUserSelect = {
  id: true,
  email: true,
  fullName: true,
  avatarUrl: true,
  role: true,
  status: true,
  provider: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type AuthenticatedUser = Prisma.UserGetPayload<{
  select: typeof authUserSelect;
}>;
