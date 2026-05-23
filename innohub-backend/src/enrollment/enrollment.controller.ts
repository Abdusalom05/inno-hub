import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { EnrollCourseDto } from './dto/enroll-course.dto';
import { MyCoursesQueryDto } from './dto/my-courses-query.dto';
import { EnrollmentService } from './enrollment.service';

@ApiTags('Enrollments')
@ApiBearerAuth()
@Controller('enrollments')
@UseGuards(JwtAuthGuard)
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post()
  @ApiOperation({ summary: 'Enroll the current user in a published course' })
  enroll(@CurrentUser() user: AuthenticatedUser, @Body() dto: EnrollCourseDto) {
    return this.enrollmentService.enroll(user, dto);
  }

  @Get('my-courses')
  @ApiOperation({ summary: 'Get paginated courses for the current user' })
  getMyCourses(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: MyCoursesQueryDto,
  ) {
    return this.enrollmentService.getMyCourses(user, query);
  }

  @Get('my-courses/:courseId')
  @ApiOperation({ summary: 'Get one enrolled course for the current user' })
  getMyCourseById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentService.getMyCourseById(user, courseId);
  }
}
