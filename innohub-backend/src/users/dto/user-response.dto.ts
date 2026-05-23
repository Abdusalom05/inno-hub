import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  firebaseUid: string | null;

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
  lastLoginAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedUsersMetaDto {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  totalPages: number;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  items: UserResponseDto[];

  @ApiProperty({ type: PaginatedUsersMetaDto })
  meta: PaginatedUsersMetaDto;
}
