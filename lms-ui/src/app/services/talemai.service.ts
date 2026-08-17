// import { inject, Injectable } from '@angular/core';
// import {
//   HttpClient,
//   HttpEvent,
//   HttpEventType,
//   HttpHeaders,
// } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../environments/environment';

// @Injectable({
//   providedIn: 'root',
// })
// export class TalemaiService {
//   private readonly http = inject(HttpClient);
//   private readonly API_URL = environment.apiUrl + 'talemai';

//   sendMessage(query: string): Observable<string> {
//     return new Observable<string>((subscriber) => {
//       let lastLength = 0;

//       const subscription = this.http
//         .post(
//           `${this.API_URL}/ask`,
//           { question: query },
//           {
//             headers: new HttpHeaders({
//               'Content-Type': 'application/json',
//               Accept: 'application/x-ndjson',
//             }),
//             responseType: 'text',
//             observe: 'events',
//             reportProgress: true,
//           },
//         )
//         .subscribe({
//           next: (event: HttpEvent<string>) => {
//             if (event.type === HttpEventType.DownloadProgress) {
//               const response = event.partialText ?? '';

//               const newChunk = response.substring(lastLength);
//               lastLength = response.length;

//               if (newChunk) {
//                 subscriber.next(newChunk);
//               }
//             }

//             if (event.type === HttpEventType.Response) {
//               const response = event.body ?? '';

//               const remaining = response.substring(lastLength);

//               if (remaining) {
//                 subscriber.next(remaining);
//               }

//               subscriber.complete();
//             }
//           },

//           error: (error) => {
//             subscriber.error(error);
//           },
//         });

//       return () => subscription.unsubscribe();
//     });
//   }
// }

import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class TalemaiService {
  private readonly API_URL = environment.apiUrl + 'talemai';
  private readonly keycloak = inject(KeycloakService);

  sendMessage(query: string): Observable<string> {
    return new Observable<string>((subscriber) => {
      const controller = new AbortController();

      const stream = async () => {
        try {
          const token = await this.keycloak.getToken();

          const response = await fetch(`${this.API_URL}/ask`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/x-ndjson',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              question: query,
            }),
            signal: controller.signal,
          });

          if (!response.ok) {
            throw new Error(
              `Request failed: ${response.status} ${response.statusText}`,
            );
          }

          if (!response.body) {
            throw new Error('Response body is not readable');
          }

          const reader = response.body.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { value, done } = await reader.read();

            if (done) {
              break;
            }

            const chunk = decoder.decode(value, {
              stream: true,
            });

            if (chunk) {
              subscriber.next(chunk);
            }
          }

          // Flush any remaining decoder data
          const remaining = decoder.decode();

          if (remaining) {
            subscriber.next(remaining);
          }

          subscriber.complete();
        } catch (error) {
          if (!controller.signal.aborted) {
            subscriber.error(error);
          }
        }
      };

      stream();

      return () => {
        controller.abort();
      };
    });
  }
}