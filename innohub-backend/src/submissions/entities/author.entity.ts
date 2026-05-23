import { ApiProperty } from '@nestjs/swagger';

export class AuthorEntity {
  @ApiProperty({
    description: 'Muallifning unikal identifikatori.',
    example: 'd4e5f6a7-b8c9-0123-def0-123456789abc',
  })
  id: string;

  @ApiProperty({
    description: 'Muallifning to\'liq ismi sharifi.',
    example: 'Eshmat Toshmatov',
  })
  fullName: string;

  @ApiProperty({
    description: 'Muallif ishlaydigan tashkilot (OTM).',
    example: 'O\'zbekiston Milliy Universiteti',
  })
  affiliation: string;

  @ApiProperty({
    description: 'Muallifning elektron pochtasi.',
    example: 'eshmat@nuu.uz',
  })
  email: string;

  @ApiProperty({
    description: 'Tegishli ilmiy maqola identifikatori.',
    example: 'e5f6a7b8-c9d0-1234-ef01-23456789abcd',
  })
  submissionId: string;
}
