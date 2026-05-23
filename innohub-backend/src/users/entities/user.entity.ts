import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthProvider, Role, UserStatus } from '@prisma/client';

export class UserEntity {
  @ApiProperty({
    description: 'Foydalanuvchining unikal identifikatori.',
    example: 'd9b2d63d-a110-47c4-a692-0b73c9f28821',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'Tashqi Firebase UID identifikatori.',
    example: 'AIzaSyD7g8L7_U9_K8dG7hG6s8D7F6G5H4J3K2',
  })
  firebaseUid: string | null;

  @ApiProperty({
    description: 'Asosiy aloqa elektron pochta manzili.',
    example: 'eshmat.toshmatov@misol.uz',
  })
  email: string;

  @ApiProperty({
    description: 'Foydalanuvchining to\'liq ismi sharifi.',
    example: 'Eshmat Toshmatov',
  })
  fullName: string;

  @ApiPropertyOptional({
    description: 'Profil rasmining manzili.',
    example: 'https://cdn.example.com/rasmlar/eshmat_avatar.jpg',
  })
  avatarUrl: string | null;

  @ApiProperty({
    enum: Role,
    description: 'Foydalanuvchining tizimdagi roli.',
    example: Role.USER,
  })
  role: Role;

  @ApiProperty({
    enum: UserStatus,
    description: 'Foydalanuvchi hisobining faollik holati.',
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiProperty({
    enum: AuthProvider,
    description: 'Ro\'yxatdan o\'tish metodologiyasi.',
    example: AuthProvider.EMAIL,
  })
  provider: AuthProvider;

  @ApiPropertyOptional({
    description: 'Oxirgi marta tizimga kirgan vaqti.',
    example: '2026-04-28T12:00:00Z',
  })
  lastLoginAt: Date | null;

  @ApiProperty({
    description: 'Yaratilgan vaqti.',
    example: '2026-01-01T08:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Oxirgi yangilangan vaqti.',
    example: '2026-04-28T16:33:00Z',
  })
  updatedAt: Date;
}
