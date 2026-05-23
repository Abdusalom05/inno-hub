import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class CompleteLessonDto {
  @ApiPropertyOptional({
    example: 540,
    description: 'Optional final absolute watched duration in seconds',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  watchSeconds?: number;
}
