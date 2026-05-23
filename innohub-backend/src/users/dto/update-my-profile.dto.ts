import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class UpdateMyProfileDto {
  @ApiPropertyOptional({
    description: 'Foydalanuvchining to\'liq ismi sharifi.',
    example: 'Eshmat Toshmatov',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Profil rasmining manzili.',
    example: 'https://cdn.example.com/rasmlar/eshmat_avatar.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'Yangi maxfiy parol.',
    example: 'YangiMaxfiyParol123',
  })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
