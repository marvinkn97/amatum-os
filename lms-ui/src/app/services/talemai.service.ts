import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TalemaiService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl + 'talemai';


  sendMessage(query: string): Observable<string> {
    const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });
    return this.http.post(`${this.API_URL}/ask`, query, {
      headers,
      responseType: 'text'
    });
  }


}
