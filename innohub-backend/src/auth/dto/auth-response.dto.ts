import { ApiProperty } from '@nestjs/swagger';

export class AuthUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;

  @ApiProperty()
  role: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  provider: string;

  @ApiProperty({ nullable: true })
  firebaseUid: string | null;

  @ApiProperty({ nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}
