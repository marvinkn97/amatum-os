import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TalemaiService {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl + 'talemai';


  sendMessage(query: string): Observable<string> {
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    return this.http.post(`${this.API_URL}/ask`, query, { 
      headers, 
      responseType: 'text' 
    });
  }


}
