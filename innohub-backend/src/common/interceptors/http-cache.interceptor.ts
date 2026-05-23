import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const isGetRequest = request.method === 'GET';
    const cacheKey = this.generateCacheKey(request);

    if (!isGetRequest) {
      // Invalidate cache if mutation occurs (simplified strategy)
      // Real implementation would target specific keys
      return next.handle();
    }

    const cachedResponse = await this.cacheManager.get(cacheKey);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheManager.set(cacheKey, response, 60000); // 1 minute default
      }),
    );
  }

  private generateCacheKey(request: any): string {
    const url = request.url;
    const userRole = request.user?.role || 'public';
    return `http_cache:${userRole}:${url}`;
  }
}
