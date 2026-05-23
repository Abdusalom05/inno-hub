import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminStatisticsController } from './statistics/admin-statistics.controller';
import { AdminStatisticsService } from './statistics/admin-statistics.service';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule],
  controllers: [AdminController, AdminStatisticsController],
  providers: [AdminService, AdminStatisticsService],
})
export class AdminModule {}
