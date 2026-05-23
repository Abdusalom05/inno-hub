import {
  Body,
  Controller,
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
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateAuthorDto } from './dto/create-author.dto';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { ListSubmissionsQueryDto } from './dto/list-submissions-query.dto';
import {
  PaginatedSubmissionsResponseDto,
  SubmissionAuthorDto,
  SubmissionDetailDto,
} from './dto/submission-response.dto';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { SubmissionsService } from './submissions.service';

@ApiTags('Submissions')
@ApiBearerAuth()
@Controller('submissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a submission editorial record' })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSubmissionDto,
  ) {
    return this.submissionsService.create(user, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get a paginated list of submissions' })
  @ApiOkResponse({ type: PaginatedSubmissionsResponseDto })
  findAll(@Query() query: ListSubmissionsQueryDto) {
    return this.submissionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one submission by id' })
  @ApiOkResponse({ type: SubmissionDetailDto })
  findOne(@Param('id') id: string) {
    return this.submissionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a submission editorial record' })
  @ApiOkResponse({ type: SubmissionDetailDto })
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateSubmissionDto,
  ) {
    return this.submissionsService.update(user, id, dto);
  }

  @Post(':id/authors')
  @ApiOperation({ summary: 'Add an author to a submission' })
  @ApiOkResponse({ type: SubmissionAuthorDto })
  addAuthor(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAuthorDto,
  ) {
    return this.submissionsService.addAuthor(user, id, dto);
  }
}
