import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CountryEntity {
  @ApiProperty({
    description: 'Davlatning unikal identifikatori.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef0123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Davlatning to\'liq nomi.',
    example: 'O\'zbekiston',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Xalqaro ISO kodi.',
    example: 'UZ',
  })
  code: string | null;

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
