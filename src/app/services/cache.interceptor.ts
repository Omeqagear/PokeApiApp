import { HttpResponse } from '@angular/common/http';
import { HttpInterceptorFn } from '@angular/common/http';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

const cache = new Map<string, HttpResponse<any>>();
const timestamps = new Map<string, number>();
const MAX_AGE = 5 * 60 * 1000; // 5 minutes

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('pokeapi.co') || req.method !== 'GET') {
    return next(req);
  }

  const cached = cache.get(req.url);
  const timestamp = timestamps.get(req.url);

  if (cached && timestamp && (Date.now() - timestamp) < MAX_AGE) {
    return of(cached);
  }

  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        cache.set(req.url, event);
        timestamps.set(req.url, Date.now());
      }
    })
  );
};
