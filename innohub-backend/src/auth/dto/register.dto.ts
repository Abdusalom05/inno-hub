import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Foydalanuvchining elektron pochta manzili.',
    example: 'eshmat.toshmatov@misol.uz',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Hisobning maxfiy paroli (kamida 6 ta belgi).',
    example: 'MaxfiyParol123',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Foydalanuvchining to\'liq ismi sharifi.',
    example: 'Eshmat Toshmatov',
  })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiPropertyOptional({
    description: 'Profil rasmining manzili.',
    example: 'https://cdn.example.com/rasmlar/eshmat_avatar.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  avatarUrl?: string;
}
