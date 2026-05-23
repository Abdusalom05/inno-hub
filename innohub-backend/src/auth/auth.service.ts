import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthProvider, Role, type User, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import {
  authUserSelect,
  type AuthenticatedUser,
} from './interfaces/authenticated-user.interface';
import type { JwtPayload } from './interfaces/jwt-payload.interface';


type AuthResponse = {
  accessToken: string;
  user: AuthenticatedUser;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}


  async register(dto: RegisterDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(dto.email);
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const createdUser = await this.prisma.user.create({
      data: {
        email,
        fullName: dto.fullName.trim(),
        avatarUrl: dto.avatarUrl?.trim() || null,
        password: passwordHash,
        role: Role.USER,
        status: UserStatus.ACTIVE,
        provider: AuthProvider.EMAIL,
      },
    });

    return this.buildAuthResponse(createdUser);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
    });


    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    this.assertUserCanAuthenticate(user);

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.buildAuthResponse(updatedUser);
  }

  async googleLogin(profile: any): Promise<string> {
    try {
      const email = this.normalizeEmail(profile.email);
      const fullName = profile.fullName?.trim() || email.split('@')[0];
      const avatarUrl = profile.avatar || profile.picture || null;

      const user = await this.prisma.user.upsert({
        where: { email },
        update: {
          avatarUrl,
          fullName,
          lastLoginAt: new Date(),
        },
        create: {
          email,
          fullName,
          avatarUrl,
          password: '',
          role: Role.USER,
          status: UserStatus.ACTIVE,
          provider: AuthProvider.GOOGLE,
          lastLoginAt: new Date(),
        },
      });

      this.assertUserCanAuthenticate(user);

      const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
      return this.jwtService.sign(payload);
    } catch (error) {
      console.error('❌ Google Login Service Error:', error);
      throw error;
    }
  }

  async firebaseLogin(profile: {
    email: string;
    fullName: string;
    avatar?: string;
  }): Promise<AuthResponse> {
    const email = this.normalizeEmail(profile.email);
    const fullName = profile.fullName?.trim() || email.split('@')[0];
    const avatarUrl = profile.avatar?.trim() || null;

    const user = await this.prisma.user.upsert({
      where: { email },
      update: {
        avatarUrl,
        fullName,
        lastLoginAt: new Date(),
      },
      create: {
        email,
        fullName,
        avatarUrl,
        password: '',
        role: Role.USER,
        status: UserStatus.ACTIVE,
        provider: AuthProvider.GOOGLE,
        lastLoginAt: new Date(),
      },
    });

    this.assertUserCanAuthenticate(user);

    return this.buildAuthResponse(user);
  }



  async validateJwtUser(userId: string): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: authUserSelect,
    });

    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('Your account has been blocked.');
    }

    if (user.status === UserStatus.PENDING) {
      throw new ForbiddenException('Your account is not active yet.');
    }

    return user;
  }

  logout() {
    return {
      message: 'Logged out successfully.',
    };
  }

  private async buildAuthResponse(user: User): Promise<AuthResponse> {
    const safeUser = this.toAuthenticatedUser(user);

    return {
      accessToken: await this.signAccessToken({
        sub: safeUser.id,
        email: safeUser.email,
        role: safeUser.role,
      }),
      user: safeUser,
    };
  }

  private async signAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  private assertUserCanAuthenticate(user: Pick<User, 'status'>): void {

    if (user.status === UserStatus.BLOCKED) {
      throw new ForbiddenException('Your account has been blocked.');
    }

    if (user.status === UserStatus.PENDING) {
      throw new ForbiddenException('Your account is not active yet.');
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toAuthenticatedUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: user.role,
      status: user.status,
      provider: user.provider,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
