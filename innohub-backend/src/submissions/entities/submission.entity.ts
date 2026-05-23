import { ApiProperty } from '@nestjs/swagger';

export class SubmissionEntity {
  @ApiProperty({
    description: 'Maqolaning unikal identifikatori.',
    example: 'e5f6a7b8-c9d0-1234-ef01-23456789abcd',
  })
  id: string;

  @ApiProperty({
    description: 'Ilmiy maqolaning to\'liq sarlavhasi.',
    example: 'Sun\'iy intellektning zamonaviy ta\'limdagi o\'rni',
  })
  title: string;

  @ApiProperty({
    description: 'Maqola uchun qisqacha annotatsiya.',
    example: 'Ushbu ilmiy ishda algoritmlarning o\'quv jarayonlari samaradorligiga ta\'siri tahlil qilinadi.',
  })
  abstract: string;

  @ApiProperty({
    description: 'Kalit so\'zlar ro\'yxati.',
    example: ['Sun\'iy intellekt', 'Ta\'lim texnologiyalari', 'Zamonaviy metodlar'],
  })
  keywords: string[];

  @ApiProperty({
    description: 'Foydalanilgan adabiyotlar ro\'yxati.',
    example: '[1] Toshmatov E. (2025). Sun\'iy intellekt asoslari. Ilm-fan nashriyoti.',
  })
  references: string;

  @ApiProperty({
    description: 'Muloqot uchun asosiy elektron pochta.',
    example: 'eshmat.toshmatov@misol.uz',
  })
  correspondingEmail: string;

  @ApiProperty({
    description: 'Davlatning identifikatori.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef0123456789',
  })
  countryId: string;

  @ApiProperty({
    description: 'Nashriyot jurnali identifikatori.',
    example: 'b2c3d4e5-f6a7-8901-bcde-f0123456789a',
  })
  journalId: string;

  @ApiProperty({
    description: 'Chop etiladigan sonning identifikatori.',
    example: 'c3d4e5f6-a7b8-9012-cdef-0123456789ab',
  })
  issueId: string;

  @ApiProperty({
    description: 'Yaratilgan vaqti.',
    example: '2026-04-20T09:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Oxirgi yangilangan vaqti.',
    example: '2026-04-28T16:00:00Z',
  })
  updatedAt: Date;
}
