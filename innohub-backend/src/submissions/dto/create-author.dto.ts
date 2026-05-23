import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({
    description: 'Muallifning to\'liq ismi sharifi.',
    example: 'Eshmat Toshmatov',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  fullName: string;

  @ApiProperty({
    description: 'Muallif ishlaydigan tashkilot yoki OTM nomi.',
    example: 'O\'zbekiston Milliy Universiteti',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  affiliation: string;

  @ApiProperty({
    description: 'Muallifning bog\'lanish elektron pochtasi.',
    example: 'eshmat@nuu.uz',
  })
  @IsEmail()
  @MaxLength(255)
  email: string;
}
