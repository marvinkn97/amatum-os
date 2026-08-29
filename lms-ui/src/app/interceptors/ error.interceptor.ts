import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 0:
          notification.error(
            'Unable to reach the server. Please check your connection and try again.'
          );
          break;

        case 429:
          notification.warning(
            'Too many requests. Please try again in a moment.'
          );
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          notification.error(
            'Something went wrong on our side. Please try again later.'
          );
          break;

        default:
          // Let the component handle expected/application-specific errors.
          break;
      }

      return throwError(() => error);
    })
  );
};