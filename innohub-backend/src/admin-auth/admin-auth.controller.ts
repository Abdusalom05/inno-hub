import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { AdminAuthResponseDto } from './dto/admin-auth-response.dto';
import { AdminLoginDto } from './dto/admin-login.dto';

@ApiTags('Admin-Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Administrative login for backend access control.',
    description: 'Generates a restricted administrative payload JWT.',
  })
  @ApiOkResponse({
    type: AdminAuthResponseDto,
    description: 'Admin authenticated successfully.',
  })
  @ApiBadRequestResponse({ description: 'Validation failed.' })
  @ApiUnauthorizedResponse({ description: 'Invalid administrative credentials.' })
  @ApiForbiddenResponse({ description: 'Insufficient authority level.' })
  login(@Body() dto: AdminLoginDto) {
    return this.adminAuthService.login(dto);
  }
}
