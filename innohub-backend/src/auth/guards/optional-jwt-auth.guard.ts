import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<Request & { headers?: { authorization?: string } }>();

    if (!request.headers?.authorization?.trim()) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info: unknown,
  ): TUser | undefined {
    if (err) {
      throw err;
    }

    if (info) {
      throw info;
    }

    return user;
  }
}
