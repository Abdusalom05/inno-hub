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
import { CreateTopicDto } from './dto/create-topic.dto';
import { ListTopicsQueryDto } from './dto/list-topics-query.dto';
import {
  PaginatedTopicsResponseDto,
  TopicResponseDto,
} from './dto/topic-response.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { TopicsService } from './topics.service';

@ApiTags('Topics')
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a topic' })
  create(@Body() dto: CreateTopicDto) {
    return this.topicsService.create(dto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Browse topics. Authenticated admins can include draft topics.',
  })
  @ApiOkResponse({ type: PaginatedTopicsResponseDto })
  findAll(
    @CurrentUser() user: AuthenticatedUser | undefined,
    @Query() query: ListTopicsQueryDto,
  ) {
    return this.topicsService.findAll(query, user);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get one topic. Authenticated admins can access draft topics.',
  })
  @ApiOkResponse({ type: TopicResponseDto })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser | undefined,
  ) {
    return this.topicsService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update a topic' })
  update(@Param('id') id: string, @Body() dto: UpdateTopicDto) {
    return this.topicsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a topic' })
  remove(@Param('id') id: string) {
    return this.topicsService.remove(id);
  }
}
