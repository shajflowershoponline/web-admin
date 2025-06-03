import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../shared/models/api-response.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';
import { Settings } from '../models/settings.model';

@Injectable({
  providedIn: 'root'
})
export class SettingsService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getAll(): Observable<ApiResponse<Settings[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.settings.getAll)
    .pipe(
      tap(_ => this.log('settings')),
      catchError(this.handleError('settings', []))
    );
  }

  find(key: string): Observable<ApiResponse<Settings>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.settings.find + key)
    .pipe(
      tap(_ => this.log('settings')),
      catchError(this.handleError('settings', []))
    );
  }

  update(data: any): Observable<ApiResponse<Settings>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.settings.update, data)
    .pipe(
      tap(_ => this.log('settings')),
      catchError(this.handleError('settings', []))
    );
  }

  uploadCertificateTemplate(data: any): Observable<ApiResponse<Settings>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.settings.uploadCertificateTemplate, data)
    .pipe(
      tap(_ => this.log('settings')),
      catchError(this.handleError('settings', []))
    );
  }

  handleError<T>(operation: string, result?: T) {
    return (error: any): Observable<T> => {
      this.log(`${operation} failed: ${Array.isArray(error.error.message) ? error.error.message[0] : error.error.message}`);
      return of(error.error as T);
    };
  }
  log(message: string) {
    console.log(message);
  }
}
