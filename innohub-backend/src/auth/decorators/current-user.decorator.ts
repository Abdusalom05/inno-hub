import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

export const CurrentUser = createParamDecorator(
  <T = AuthenticatedUser>(
    _data: unknown,
    ctx: ExecutionContext,
  ): T | undefined => {
    const request = ctx.switchToHttp().getRequest<{ user?: T }>();
    return request.user;
  },
);
