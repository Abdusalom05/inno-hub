import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLevel, CourseStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Kursning to\'liq sarlavhasi.',
    example: 'JavaScript asoslari',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  title: string;

  @ApiPropertyOptional({
    description: 'URL uchun qulay sarlavha.',
    example: 'javascript-asoslari',
  })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  slug?: string;

  @ApiProperty({
    description: 'Kursning batafsil tavsifi.',
    example: 'Ushbu kurs noldan boshlab dasturlashni o\'rgatadi.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({
    description: 'Vizual ikonka nomi.',
    example: 'CodeIcon',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  icon?: string;

  @ApiPropertyOptional({
    description: 'Kurs muqova rasmi manzili.',
    example: 'https://cdn.example.com/kurslar/javascript.png',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({
    description: 'Dizayn boshlang\'ich rangi.',
    example: '#0F172A',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  gradientFrom?: string;

  @ApiPropertyOptional({
    description: 'Dizayn yakuniy rangi.',
    example: '#2563EB',
  })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  gradientTo?: string;

  @ApiPropertyOptional({
    enum: CourseLevel,
    description: 'O\'quvchi bilim darajasi.',
    example: CourseLevel.BEGINNER,
    default: CourseLevel.BEGINNER,
  })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiProperty({
    description: 'Kursning umumiy vaqti.',
    example: '12 soat',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  durationLabel: string;

  @ApiPropertyOptional({
    description: 'Darslarning umumiy soni.',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  totalLessons?: number;

  @ApiPropertyOptional({
    enum: CourseStatus,
    description: 'E\'lon qilinish holati.',
    example: CourseStatus.DRAFT,
    default: CourseStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @ApiPropertyOptional({
    description: 'Saralash ketma-ketligi raqami.',
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({
    description: 'Kurs yaratuvchisining unikal identifikatori.',
    example: 'd9b2d63d-a110-47c4-a692-0b73c9f28821',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  createdBy?: string;
}
