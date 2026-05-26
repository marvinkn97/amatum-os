import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TalemaiService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8085/api/talemai';


  sendMessage(query: string): Observable<string> {
    // We set responseType to 'text' because the controller returns a raw String
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    return this.http.post(`${this.API_URL}/ask`, query, { 
      headers, 
      responseType: 'text' 
    });
  }


}
