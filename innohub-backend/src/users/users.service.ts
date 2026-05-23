import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateUserRoleDto } from '../admin/dto/update-user-role.dto';
import { Role } from '../common/enums/role.enum';
import { PrismaService } from '../prisma/prisma.service';
import {
  authUserSelect,
  type AuthenticatedUser,
} from '../auth/interfaces/authenticated-user.interface';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';

type PaginatedUsersResponse = {
  items: AuthenticatedUser[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUser(userId: string): Promise<AuthenticatedUser> {
    return this.findUserOrThrow(userId);
  }

  async updateCurrentUser(
    userId: string,
    dto: UpdateMyProfileDto,
  ): Promise<AuthenticatedUser> {
    await this.findUserOrThrow(userId);

    const data: Prisma.UserUpdateInput = {};

    if (dto.fullName !== undefined) {
      data.fullName = dto.fullName.trim();
    }

    if (dto.avatarUrl !== undefined) {
      data.avatarUrl = dto.avatarUrl?.trim() || null;
    }

    if (dto.password !== undefined) {
      data.password = await bcrypt.hash(dto.password, 12);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: authUserSelect,
    });
  }

  async findAll(query: ListUsersQueryDto): Promise<PaginatedUsersResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      role: query.role,
      status: query.status,
      provider: query.provider,

      ...(query.search
        ? {
            OR: [
              {
                fullName: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
              {
                email: {
                  contains: query.search,
                  mode: 'insensitive',
                },
              },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: authUserSelect,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOneById(id: string): Promise<AuthenticatedUser> {
    return this.findUserOrThrow(id);
  }

  async updateUserRole(
    actor: AuthenticatedUser,
    userId: string,
    dto: UpdateUserRoleDto,
  ): Promise<AuthenticatedUser> {
    const targetUser = await this.findUserRoleOrThrow(userId);

    this.assertCanManageUser(actor, targetUser, dto.role);

    if (targetUser.role === dto.role) {
      return this.findUserOrThrow(userId);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role },
      select: authUserSelect,
    });
  }

  async removeUser(
    actor: AuthenticatedUser,
    userId: string,
  ): Promise<{ message: string }> {
    const targetUser = await this.findUserRoleOrThrow(userId);

    this.assertCanManageUser(actor, targetUser);

    await this.prisma.$transaction(async (tx) => {
      await tx.course.updateMany({
        where: { createdBy: userId },
        data: { createdBy: null },
      });

      await tx.user.update({
        where: { id: userId },
        data: { deletedAt: new Date() },
      });

    });

    return {
      message: 'User deleted successfully.',
    };
  }

  private async findUserOrThrow(id: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: authUserSelect,
    });


    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  private async findUserRoleOrThrow(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        role: true,
      },
    });


    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  private assertCanManageUser(
    actor: AuthenticatedUser,
    targetUser: { id: string; role: Role },
    nextRole?: Role,
  ): void {
    if (actor.id === targetUser.id) {
      throw new BadRequestException(
        'You cannot manage your own account from the admin users endpoint.',
      );
    }

    if (
      targetUser.role === Role.SUPER_ADMIN &&
      actor.role !== Role.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        'Only a SUPER_ADMIN can manage another SUPER_ADMIN account.',
      );
    }

    if (nextRole === Role.SUPER_ADMIN && actor.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Only a SUPER_ADMIN can assign the SUPER_ADMIN role.',
      );
    }
  }
}
