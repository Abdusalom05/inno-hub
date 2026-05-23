import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CompleteLessonDto } from './dto/complete-lesson.dto';
import { UpdateLessonProgressDto } from './dto/update-lesson-progress.dto';
import { ProgressService } from './progress.service';

@ApiTags('Progress')
@ApiBearerAuth()
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('lessons/:topicId')
  @ApiOperation({ summary: 'Update watch progress for a lesson' })
  updateLessonProgress(
    @CurrentUser() user: AuthenticatedUser,
    @Param('topicId') topicId: string,
    @Body() dto: UpdateLessonProgressDto,
  ) {
    return this.progressService.updateLessonProgress(user, topicId, dto);
  }

  @Post('lessons/:topicId/complete')
  @ApiOperation({ summary: 'Mark a lesson as completed' })
  completeLesson(
    @CurrentUser() user: AuthenticatedUser,
    @Param('topicId') topicId: string,
    @Body() dto: CompleteLessonDto,
  ) {
    return this.progressService.completeLesson(user, topicId, dto);
  }
}
