import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { authUserSelect } from '../auth/interfaces/authenticated-user.interface';
import { AdminLoginDto } from './dto/admin-login.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: AdminLoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });


    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid administrative credentials.');
    }

    if (user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Access denied. Insufficient role.');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('Admin account has been blocked.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid administrative credentials.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const safeUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      select: authUserSelect,
    });

    if (!safeUser) {
      throw new UnauthorizedException('Administrative account was removed.');
    }

    const accessToken = await this.jwtService.signAsync(
      {
        sub: safeUser.id,
        email: safeUser.email,
        role: safeUser.role,
        adminSession: true,
      },

      {
        audience: 'admin-panel',
      },
    );

    return {
      accessToken,
      user: safeUser,
    };
  }
}
