import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PresignedUrlResponse {
  uploadUrl: string;
  objectKey: string;
}

export interface S3UploadRequest {
  fileName: string;
  contentType: string;
}

@Injectable({
  providedIn: 'root',
})
export class S3Service {
  private http = inject(HttpClient);
  private readonly API_URL = environment.apiUrl + 'uploads/s3';


  getPresignedUrl(fileName: string, contentType: string): Observable<PresignedUrlResponse> {
    const body: S3UploadRequest = { fileName, contentType };
    return this.http.post<PresignedUrlResponse>(`${this.API_URL}/upload-url`, body);
  }

  uploadToStorage(file: File, uploadUrl: string): Promise<any> {
    const headers = new HttpHeaders({ 'Content-Type': file.type });

    return firstValueFrom(this.http.put(uploadUrl, file, { headers, responseType: 'text' }));
  }

  deleteFile(objectKey: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/remove`, {
      params: { objectKey },
    });
  }
}
