import { ApiProperty } from '@nestjs/swagger';

export class CourseCreatorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;
}

export class CourseTopicSummaryDto {
  @ApiProperty()
  id: string;

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

export class CourseSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ nullable: true })
  icon: string | null;

  @ApiProperty({ nullable: true })
  imageUrl: string | null;

  @ApiProperty({ nullable: true })
  gradientFrom: string | null;

  @ApiProperty({ nullable: true })
  gradientTo: string | null;

  @ApiProperty()
  level: string;

  @ApiProperty()
  durationLabel: string;

  @ApiProperty()
  totalLessons: number;

  @ApiProperty()
  publishedTopicsCount: number;

  @ApiProperty()
  enrollmentsCount: number;

  @ApiProperty()
  status: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: CourseCreatorDto, nullable: true })
  creator: CourseCreatorDto | null;
}

export class CourseDetailDto extends CourseSummaryDto {
  @ApiProperty({ type: [CourseTopicSummaryDto] })
  topics: CourseTopicSummaryDto[];
}

export class PaginatedCoursesMetaDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}

export class PaginatedCoursesResponseDto {
  @ApiProperty({ type: [CourseSummaryDto] })
  items: CourseSummaryDto[];

  @ApiProperty({ type: PaginatedCoursesMetaDto })
  meta: PaginatedCoursesMetaDto;
}
