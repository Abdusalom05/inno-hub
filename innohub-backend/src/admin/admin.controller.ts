import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminJwtAuthGuard } from '../admin-auth/guards/admin-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { Role } from '../common/enums/role.enum';
import { ListUsersQueryDto } from '../users/dto/list-users-query.dto';
import {
  PaginatedUsersResponseDto,
  UserResponseDto,
} from '../users/dto/user-response.dto';
import { AdminService } from './admin.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { DashboardSummaryDto } from './statistics/dto/dashboard-summary.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  @ApiOkResponse({ type: DashboardSummaryDto })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({
    summary: 'Get a paginated list of users for admin management',
  })
  @ApiOkResponse({ type: PaginatedUsersResponseDto })
  getUsers(@Query() query: ListUsersQueryDto) {
    return this.adminService.getUsers(query);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update a user role' })
  @ApiOkResponse({ type: UserResponseDto })
  updateUserRole(
    @CurrentUser() actor: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(actor, id, dto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user account' })
  removeUser(@CurrentUser() actor: AuthenticatedUser, @Param('id') id: string) {
    return this.adminService.removeUser(actor, id);
  }
}
