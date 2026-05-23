import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCountryDto {
  @ApiProperty({
    description: 'Davlatning to\'liq nomi.',
    example: 'O\'zbekiston',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Xalqaro ISO kodi.',
    example: 'UZ',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  code?: string;
}
