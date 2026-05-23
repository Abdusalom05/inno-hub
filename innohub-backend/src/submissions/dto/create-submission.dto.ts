import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { CreateAuthorDto } from './create-author.dto';

export class CreateSubmissionDto {
  @ApiProperty({
    description: 'Ilmiy maqolaning to\'liq sarlavhasi.',
    example: 'Sun\'iy intellektning zamonaviy ta\'limdagi o\'rni',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  title: string;

  @ApiProperty({
    description: 'Maqola uchun qisqacha annotatsiya (referat).',
    example: 'Ushbu ilmiy ishda algoritmlarning o\'quv jarayonlari samaradorligiga ta\'siri tahlil qilinadi.',
  })
  @IsString()
  @IsNotEmpty()
  abstract: string;

  @ApiProperty({
    type: [String],
    description: 'Kalit so\'zlar ro\'yxati.',
    example: ['Sun\'iy intellekt', 'Ta\'lim texnologiyalari', 'Zamonaviy metodlar'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @IsString({ each: true })
  keywords: string[];

  @ApiProperty({
    description: 'Foydalanilgan adabiyotlar (bibliografiya) ro\'yxati.',
    example: '[1] Toshmatov E. (2025). Sun\'iy intellekt asoslari. Ilm-fan nashriyoti.',
  })
  @IsString()
  @IsNotEmpty()
  references: string;

  @ApiProperty({
    description: 'Muloqot uchun asosiy elektron pochta.',
    example: 'eshmat.toshmatov@misol.uz',
  })
  @IsEmail()
  @MaxLength(255)
  correspondingEmail: string;

  @ApiProperty({
    description: 'Tegishli davlat identifikatori (UUID).',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef0123456789',
  })
  @IsString()
  @IsNotEmpty()
  countryId: string;

  @ApiProperty({
    description: 'Nashriyot jurnali identifikatori (UUID).',
    example: 'b2c3d4e5-f6a7-8901-bcde-f0123456789a',
  })
  @IsString()
  @IsNotEmpty()
  journalId: string;

  @ApiProperty({
    description: 'Chop qilinadigan sonning identifikatori (UUID).',
    example: 'c3d4e5f6-a7b8-9012-cdef-0123456789ab',
  })
  @IsString()
  @IsNotEmpty()
  issueId: string;

  @ApiPropertyOptional({
    type: [CreateAuthorDto],
    description: 'Hammualliflar ro\'yxati.',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => CreateAuthorDto)
  authors?: CreateAuthorDto[];
}
