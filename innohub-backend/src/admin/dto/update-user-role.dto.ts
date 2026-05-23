import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { Role } from '../../common/enums/role.enum';

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: Role,
    example: Role.ADMIN,
    description:
      'Use USER for students. STUDENT is also accepted and normalized to USER.',
  })
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return value;
    }

    const normalizedValue = value.trim().toUpperCase();
    return normalizedValue === 'STUDENT' ? Role.USER : normalizedValue;
  })
  @IsEnum(Role)
  role: Role;
}
