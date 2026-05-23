import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class EnrollCourseDto {
  @ApiProperty({
    example: 'course-id-or-uuid',
    description: 'Identifier of the published course to enroll in',
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;
}
