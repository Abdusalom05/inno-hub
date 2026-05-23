import {
  Injectable,
  ExecutionContext,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Injectable()
export class HttpCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    if (method !== 'GET') {
      return undefined;
    }

    if (url.includes('/api/courses') || url.match(/\/api\/topics\/[a-zA-Z0-9-]+/)) {
      return url;
    }

    return undefined;
  }
}
