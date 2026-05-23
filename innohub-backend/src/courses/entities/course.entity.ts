import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourseLevel, CourseStatus } from '@prisma/client';

export class CourseEntity {
  @ApiProperty({
    description: 'Kursning unikal identifikatori.',
    example: 'react-native-mukammal-kurs-101',
  })
  id: string;

  @ApiProperty({
    description: 'URL uchun qulay nomlanishi.',
    example: 'react-native-mukammal-kurs',
  })
  slug: string;

  @ApiProperty({
    description: 'Kurs sarlavhasi.',
    example: 'React Native bilan mukammal mobil ilovalar',
  })
  title: string;

  @ApiProperty({
    description: 'Kurs haqida qisqacha ma\'lumot.',
    example: 'Ushbu kursda siz zamonaviy va masshtablashadigan mobil dasturlar yaratishni o\'rganasiz.',
  })
  description: string;

  @ApiPropertyOptional({
    description: 'Kurs uchun vizual ikonka.',
    example: 'CodeIcon',
  })
  icon: string | null;

  @ApiPropertyOptional({
    description: 'Kursning muqova rasmi manzili.',
    example: 'https://cdn.example.com/kurslar/react_native_muqova.jpg',
  })
  imageUrl: string | null;

  @ApiPropertyOptional({
    description: 'Dizayn boshlang\'ich rangi.',
    example: '#4A00E0',
  })
  gradientFrom: string | null;

  @ApiPropertyOptional({
    description: 'Dizayn yakuniy rangi.',
    example: '#8E2DE2',
  })
  gradientTo: string | null;

  @ApiProperty({
    enum: CourseLevel,
    description: 'O\'quvchining bilim darajasi.',
    example: CourseLevel.ADVANCED,
  })
  level: CourseLevel;

  @ApiProperty({
    description: 'Kursning davomiyligi.',
    example: '12 soat',
  })
  durationLabel: string;

  @ApiProperty({
    description: 'Kursdagi darslar soni.',
    example: 12,
  })
  totalLessons: number;

  @ApiProperty({
    enum: CourseStatus,
    description: 'Kursning e\'lon qilinish holati.',
    example: CourseStatus.PUBLISHED,
  })
  status: CourseStatus;

  @ApiProperty({
    description: 'Saralash tartibi.',
    example: 1,
  })
  sortOrder: number;

  @ApiPropertyOptional({
    description: 'Kurs yaratuvchisi identifikatori.',
    example: 'd9b2d63d-a110-47c4-a692-0b73c9f28821',
  })
  createdBy: string | null;

  @ApiProperty({
    description: 'Yaratilgan vaqti.',
    example: '2026-03-01T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Oxirgi yangilangan vaqti.',
    example: '2026-04-28T16:35:00Z',
  })
  updatedAt: Date;
}
