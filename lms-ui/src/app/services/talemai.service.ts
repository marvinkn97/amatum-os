import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TalemaiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl + 'talemai';

  sendMessage(query: string): Observable<string> {
    return new Observable<string>((subscriber) => {
      let lastLength = 0;

      const subscription = this.http
        .post(
          `${this.API_URL}/ask`,
          { question: query },
          {
            headers: new HttpHeaders({
              'Content-Type': 'application/json',
              Accept: 'application/x-ndjson',
            }),
            responseType: 'text',
            observe: 'events',
            reportProgress: true,
          },
        )
        .subscribe({
          next: (event: HttpEvent<string>) => {
            if (event.type === HttpEventType.DownloadProgress) {
              const response = event.partialText ?? '';

              const newChunk = response.substring(lastLength);

              lastLength = response.length;

              if (newChunk) {
                subscriber.next(newChunk);
              }
            }

            if (event.type === HttpEventType.Response) {
              const response = event.body ?? '';

              const remaining = response.substring(lastLength);

              if (remaining) {
                subscriber.next(remaining);
              }

              subscriber.complete();
            }
          },

          error: (error) => {
            subscriber.error(error);
          },
        });

      return () => subscription.unsubscribe();
    });
  }
}