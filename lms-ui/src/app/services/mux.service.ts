import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';

export interface MuxUploadResponse {
  data: {
    id: string; // The Upload ID to track status
    url: string; // The temporary URL for the PUT request
    status: 'waiting' | 'uploading' | 'ready' | 'canceled';
    new_asset_settings: {
      playback_policy: string[];
    };
    cors_origin: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class MuxService {
  // Use signals to track the global upload state if needed
  isUploading = signal(false);
  uploadProgress = signal(0);

  private readonly API_URL = 'http://localhost:8082/api/mux';

  constructor(private http: HttpClient) {}

  /**
   * 1. Request the Signed Upload URL from Spring Boot
   */
  getUploadUrl(): Observable<MuxUploadResponse> {
    // Your Interceptor will automatically add the Token here
    return this.http.post<MuxUploadResponse>(`${this.API_URL}/upload-url`, {});
  }

  /**
   * 2. Perform the Direct Upload to Mux
   * We use XMLHttpRequest here specifically to track progress easily
   */
  uploadToMux(file: File, uploadUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          this.uploadProgress.set(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          resolve();
        } else {
          reject(new Error('Mux Upload Failed'));
        }
      };

      xhr.onerror = () => reject(new Error('Network Error during Mux Upload'));
      xhr.send(file);
    });
  }

  deleteMuxUpload(uploadId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/uplaods/${uploadId}`);
  }

  deleteMuxAsset(assetId: string) {
  return this.http.delete(`${this.API_URL}/assets/${assetId}`);
}
}
