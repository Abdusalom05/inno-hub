import { ApiProperty } from '@nestjs/swagger';

export class TopicCourseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  level: string;

  @ApiProperty()
  durationLabel: string;

  @ApiProperty()
  totalLessons: number;

  @ApiProperty()
  sortOrder: number;
}

export class TopicResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  lessonNumber: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  videoId: string;

  @ApiProperty()
  durationLabel: string;

  @ApiProperty({ nullable: true })
  contentMarkdown: string | null;

  @ApiProperty({ nullable: true })
  contentHtml: string | null;

  @ApiProperty()
  isPreview: boolean;

  @ApiProperty()
  status: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: TopicCourseDto })
  course: TopicCourseDto;
}

export class PaginatedTopicsMetaDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}

export class PaginatedTopicsResponseDto {
  @ApiProperty({ type: [TopicResponseDto] })
  items: TopicResponseDto[];

  @ApiProperty({ type: PaginatedTopicsMetaDto })
  meta: PaginatedTopicsMetaDto;
}
