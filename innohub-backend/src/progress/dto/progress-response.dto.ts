import { ApiProperty } from '@nestjs/swagger';

export class ProgressTopicDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  lessonNumber: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  durationLabel: string;

  @ApiProperty()
  isPreview: boolean;

  @ApiProperty()
  status: string;
}

export class ProgressLessonDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  topicId: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  watchSeconds: number;

  @ApiProperty()
  isCompleted: boolean;

  @ApiProperty({ nullable: true })
  lastViewedAt: Date | null;

  @ApiProperty({ nullable: true })
  completedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ProgressEnrollmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  enrolledAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ nullable: true })
  completedAt: Date | null;
}

export class ProgressSummaryDto {
  @ApiProperty()
  completedTopicsCount: number;

  @ApiProperty()
  totalTopics: number;

  @ApiProperty()
  progressPercent: number;
}

export class ProgressResponseDto {
  @ApiProperty({ type: ProgressTopicDto })
  topic: ProgressTopicDto;

  @ApiProperty({ type: ProgressLessonDto })
  lesson: ProgressLessonDto;

  @ApiProperty({
    type: ProgressEnrollmentDto,
    additionalProperties: false,
  })
  enrollment: ProgressEnrollmentDto & {
    progress: ProgressSummaryDto;
  };
}
