import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, HttpResponse<any>>();
  private readonly maxAge = 5 * 60 * 1000; // 5 minutes
  private readonly timestamps = new Map<string, number>();

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only cache GET requests to PokeAPI
    if (!req.url.includes('pokeapi.co') || req.method !== 'GET') {
      return next.handle(req);
    }

    const cached = this.cache.get(req.url);
    const timestamp = this.timestamps.get(req.url);

    if (cached && timestamp && (Date.now() - timestamp) < this.maxAge) {
      return of(cached);
    }

    // Cache expired or not present, fetch from API
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.cache.set(req.url, event);
          this.timestamps.set(req.url, Date.now());
        }
      })
    );
  }
}
