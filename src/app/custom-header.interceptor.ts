import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class CustomHeaderInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (this.router.url.includes('auth')) {
      request = request.clone({
        setHeaders: {
          'X-Include-X-Frame-Options': 'true'
        }
      });
    }
    return next.handle(request);
  }
}
