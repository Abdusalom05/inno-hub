import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UpdateLessonProgressDto {
  @ApiProperty({
    example: 320,
    description: 'Absolute watched duration in seconds',
  })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  watchSeconds: number;
}
