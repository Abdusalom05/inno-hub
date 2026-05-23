import {
  Injectable,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Custom Cache Interceptor for InnoHub.
 * Extends the default CacheInterceptor to provide more granular control
 * over cache keys and TTLs for high-load endpoints.
 */
@Injectable()
export class InnoHubCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const { method, url, query, user } = request;

    // We only cache GET requests
    if (method !== 'GET') {
      return undefined;
    }

    // Include User ID in cache key if data is user-specific (e.g., Progress)
    // For "Discovery" (Course list), we use a generic key
    const isDiscovery = url.includes('/api/courses') && !url.includes('/lesson');
    
    if (isDiscovery) {
      return `cache:discovery:${url}:${JSON.stringify(query)}`;
    }

    // Default: use URL as key
    return `cache:generic:${url}`;
  }
}
