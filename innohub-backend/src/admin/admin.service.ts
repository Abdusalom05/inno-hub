import { Injectable } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { ListUsersQueryDto } from '../users/dto/list-users-query.dto';
import { UsersService } from '../users/users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AdminStatisticsService } from './statistics/admin-statistics.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly adminStatisticsService: AdminStatisticsService,
  ) {}

  getStats() {
    return this.adminStatisticsService.getSummary();
  }

  getUsers(query: ListUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  updateUserRole(
    actor: AuthenticatedUser,
    userId: string,
    dto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateUserRole(actor, userId, dto);
  }

  removeUser(actor: AuthenticatedUser, userId: string) {
    return this.usersService.removeUser(actor, userId);
  }
}
