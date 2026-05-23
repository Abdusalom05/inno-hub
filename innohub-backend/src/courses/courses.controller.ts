import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { Role, Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CoursesService } from './courses.service';
import {
  CourseDetailDto,
  PaginatedCoursesResponseDto,
} from './dto/course-response.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { ListCoursesQueryDto } from './dto/list-courses-query.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a course' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCourseDto) {
    return this.coursesService.create(user, dto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Browse courses. Authenticated admins can include draft courses.',
  })
  @ApiOkResponse({ type: PaginatedCoursesResponseDto })
  findAll(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Query() query: ListCoursesQueryDto,
  ) {
    return this.coursesService.findAll(query, user);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get one course. Authenticated admins can access draft courses.',
  })
  @ApiOkResponse({ type: CourseDetailDto })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ) {
    return this.coursesService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a course' })
  update(@Param('id') id: string, @Body() dto: UpdateCourseDto) {
    return this.coursesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a course' })
  remove(@Param('id') id: string) {
    return this.coursesService.remove(id);
  }
}
