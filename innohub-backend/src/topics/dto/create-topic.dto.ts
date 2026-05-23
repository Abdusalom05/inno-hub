import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TopicStatus } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTopicDto {
  @ApiProperty({
    description: 'Tegishli kursning unikal identifikatori.',
    example: 'react-native-mukammal-kurs-101',
  })
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({
    description: 'Darsning tartib raqami.',
    example: 1,
  })
  @IsInt()
  @Min(1)
  lessonNumber: number;

  @ApiProperty({
    description: 'Mavzuning sarlavhasi.',
    example: 'JavaScript operatorlari',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @ApiProperty({
    description: 'Video pleer ID raqami.',
    example: 'v=dQw4w9WgXcQ',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  videoId: string;

  @ApiProperty({
    description: 'Mavzuning davomiyligi.',
    example: '15 daqiqa',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  durationLabel: string;

  @ApiPropertyOptional({
    description: 'Mavzuning Markdown matni.',
    example: '## Operatorlar turlari\nArifmetik va mantiqiy operatorlar haqida darslik.',
  })
  @IsOptional()
  @IsString()
  contentMarkdown?: string;

  @ApiPropertyOptional({
    description: 'Mavzuning HTML matni.',
    example: '<h2>Operatorlar turlari</h2><p>Arifmetik va mantiqiy operatorlar haqida darslik.</p>',
  })
  @IsOptional()
  @IsString()
  contentHtml?: string;

  @ApiPropertyOptional({
    description: 'Sotib olmasdan ko\'rish imkoniyati bormi.',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPreview?: boolean;

  @ApiPropertyOptional({
    enum: TopicStatus,
    description: 'Darsning e\'lon qilinish holati.',
    example: TopicStatus.DRAFT,
    default: TopicStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(TopicStatus)
  status?: TopicStatus;
}
