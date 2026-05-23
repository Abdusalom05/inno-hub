import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateIssueDto {
  @ApiProperty({
    description: 'Tegishli jurnalning unikal identifikatori (UUID).',
    example: 'b2c3d4e5-f6a7-8901-bcde-f0123456789a',
  })
  @IsUUID()
  @IsNotEmpty()
  journalId: string;

  @ApiProperty({
    description: 'Chop qilinayotgan son sarlavhasi.',
    example: '2-son (2026)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'Jurnal jildi (tom raqami).',
    example: '45',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  volume?: string;

  @ApiPropertyOptional({
    description: 'Jurnalning maxsus tartib soni.',
    example: '2',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  number?: string;

  @ApiPropertyOptional({
    description: 'Son chop etilgan kalendar yili.',
    example: 2026,
  })
  @IsOptional()
  @IsInt()
  @Min(1900)
  year?: number;
}
