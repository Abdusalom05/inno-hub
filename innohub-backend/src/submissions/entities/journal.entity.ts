import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class JournalEntity {
  @ApiProperty({
    description: 'Jurnalning unikal identifikatori.',
    example: 'b2c3d4e5-f6a7-8901-bcde-f0123456789a',
  })
  id: string;

  @ApiProperty({
    description: 'Jurnalning rasmiy nomi.',
    example: 'Ilm-fan va taraqqiyot jurnali',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'URL yo\'nalish identifikatori.',
    example: 'ilm-fan-taraqqiyot',
  })
  slug: string | null;

  @ApiPropertyOptional({
    description: 'Xalqaro standart seriya raqami.',
    example: '1476-4687',
  })
  issn: string | null;

  @ApiProperty({
    description: 'Yaratilgan vaqti.',
    example: '2026-01-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Oxirgi yangilangan vaqti.',
    example: '2026-04-28T00:00:00Z',
  })
  updatedAt: Date;
}
