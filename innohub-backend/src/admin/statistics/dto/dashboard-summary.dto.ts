import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  totalCourses: number;

  @ApiProperty()
  totalTopics: number;

  @ApiProperty()
  totalEnrollments: number;

  @ApiProperty()
  publishedCoursesCount: number;

  @ApiProperty()
  draftCoursesCount: number;

  @ApiProperty()
  activeEnrollments: number;

  @ApiProperty()
  completedEnrollments: number;
}
