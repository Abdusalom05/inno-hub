import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateJournalDto {
  @ApiProperty({
    description: 'Nashriyot jurnalining to\'liq nomi.',
    example: 'Ilm-fan va taraqqiyot jurnali',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'URL yo\'nalish nomi.',
    example: 'ilm-fan-taraqqiyot',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({
    description: 'Xalqaro standart seriya raqami.',
    example: '1476-4687',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  issn?: string;
}
