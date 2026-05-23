import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IssueEntity {
  @ApiProperty({
    description: 'Sonning unikal identifikatori.',
    example: 'c3d4e5f6-a7b8-9012-cdef-0123456789ab',
  })
  id: string;

  @ApiProperty({
    description: 'Tegishli jurnal identifikatori.',
    example: 'b2c3d4e5-f6a7-8901-bcde-f0123456789a',
  })
  journalId: string;

  @ApiProperty({
    description: 'Chop qilingan son nomi.',
    example: '2-son (2026)',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Jurnal tomi raqami.',
    example: '45',
  })
  volume: string | null;

  @ApiPropertyOptional({
    description: 'Jurnal sonining tartib raqami.',
    example: '2',
  })
  number: string | null;

  @ApiPropertyOptional({
    description: 'Chop qilingan yili.',
    example: 2026,
  })
  year: number | null;

  @ApiPropertyOptional({
    description: 'Rasmiy chop etilgan sana.',
    example: '2026-04-15T12:00:00Z',
  })
  publishedAt: Date | null;

  @ApiProperty({
    description: 'Yaratilgan vaqti.',
    example: '2026-02-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Oxirgi yangilangan vaqti.',
    example: '2026-04-28T00:00:00Z',
  })
  updatedAt: Date;
}
