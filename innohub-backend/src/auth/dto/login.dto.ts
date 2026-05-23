import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Foydalanuvchining elektron pochta manzili.',
    example: 'eshmat.toshmatov@misol.uz',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Hisobning maxfiy paroli.',
    example: 'MaxfiyParol123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
