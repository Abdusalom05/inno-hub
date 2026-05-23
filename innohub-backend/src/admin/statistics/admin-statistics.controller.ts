import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AdminJwtAuthGuard } from '../../admin-auth/guards/admin-jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

import { Role } from '../../common/enums/role.enum';
import { DashboardSummaryDto } from './dto/dashboard-summary.dto';
import { AdminStatisticsService } from './admin-statistics.service';

@ApiTags('Admin Statistics')
@ApiBearerAuth()
@Controller('admin/statistics')
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AdminStatisticsController {
  constructor(
    private readonly adminStatisticsService: AdminStatisticsService,
  ) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get admin dashboard summary statistics' })
  @ApiOkResponse({ type: DashboardSummaryDto })
  getSummary() {
    return this.adminStatisticsService.getSummary();
  }

  @Get('recent-users')
  @ApiOperation({ summary: 'Get recently registered users' })
  getRecentUsers(@Query('limit') limit?: string) {
    return this.adminStatisticsService.getRecentUsers(limit);
  }

  @Get('recent-enrollments')
  @ApiOperation({ summary: 'Get recent course enrollments' })
  getRecentEnrollments(@Query('limit') limit?: string) {
    return this.adminStatisticsService.getRecentEnrollments(limit);
  }
}
