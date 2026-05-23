import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TopicStatus } from '@prisma/client';

export class TopicEntity {
  @ApiProperty({
    description: 'Mavzuning unikal identifikatori.',
    example: 'c6b3e74d-a110-47c4-a692-0b73c9f28822',
  })
  id: string;

  @ApiProperty({
    description: 'Tegishli kursning identifikatori.',
    example: 'react-native-mukammal-kurs-101',
  })
  courseId: string;

  @ApiProperty({
    description: 'Darsning ketma-ketlik raqami.',
    example: 1,
  })
  lessonNumber: number;

  @ApiProperty({
    description: 'Mavzu sarlavhasi.',
    example: 'Komponentlarning hayot aylanishi va ishlash unumdorligi',
  })
  title: string;

  @ApiProperty({
    description: 'Tashqi video pleer ID-si.',
    example: 'v=dQw4w9WgXcQ',
  })
  videoId: string;

  @ApiProperty({
    description: 'Mavzuning davomiyligi.',
    example: '15 daqiqa',
  })
  durationLabel: string;

  @ApiPropertyOptional({
    description: 'Mavzuning Markdown formatidagi matni.',
    example: '## Lifecycle bosqichlari\nHar doim holat render bo\'lishidan oldin ishga tushadi.',
  })
  contentMarkdown: string | null;

  @ApiPropertyOptional({
    description: 'Mavzuning HTML formatidagi matni.',
    example: '<h2>Lifecycle bosqichlari</h2><p>Har doim holat render bo\'lishidan oldin ishga tushadi.</p>',
  })
  contentHtml: string | null;

  @ApiProperty({
    description: 'Kursni sotib olmasdan ko\'rish imkoniyati bormi.',
    example: true,
  })
  isPreview: boolean;

  @ApiProperty({
    enum: TopicStatus,
    description: 'Mavzuning e\'lon qilinish holati.',
    example: TopicStatus.PUBLISHED,
  })
  status: TopicStatus;

  @ApiProperty({
    description: 'Yaratilgan vaqti.',
    example: '2026-03-10T11:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Oxirgi yangilangan vaqti.',
    example: '2026-04-28T16:30:00Z',
  })
  updatedAt: Date;
}
