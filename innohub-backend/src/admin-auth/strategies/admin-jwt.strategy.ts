import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { UserStatus } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { authUserSelect } from '../../auth/interfaces/authenticated-user.interface';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(
    private readonly prisma: PrismaService,
    configService: ConfigService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');

    if (!secret) {
      throw new Error('JWT_SECRET is required');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    if (!payload || !payload.adminSession) {
      throw new UnauthorizedException('Invalid admin session token.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: authUserSelect,
    });

    if (!user) {
      throw new UnauthorizedException('Admin account not found.');
    }

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Insufficient permissions.');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('Your account has been blocked.');
    }

    return user;
  }
}
