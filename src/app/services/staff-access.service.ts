import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';
import { StaffAccess } from '../models/staff-access';
import { ApiResponse } from '../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class StaffAccessService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getByAdvanceSearch(params:{
    order: any,
    columnDef: { apiNotation: string; filter: string }[],
    pageSize: number,
    pageIndex: number
  }): Observable<ApiResponse<{ results: StaffAccess[], total: number}>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.staffAccess.getByAdvanceSearch,
      params)
    .pipe(
      tap(_ => this.log('access')),
      catchError(this.handleError('access', []))
    );
  }

  getByCode(staffAccessCode: string): Observable<ApiResponse<StaffAccess>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.staffAccess.getByCode + staffAccessCode)
    .pipe(
      tap(_ => this.log('staff-access')),
      catchError(this.handleError('staff-access', []))
    );
  }

  create(data: any): Observable<ApiResponse<StaffAccess>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.staffAccess.create, data)
    .pipe(
      tap(_ => this.log('staff-access')),
      catchError(this.handleError('staff-access', []))
    );
  }

  update(staffAccessCode: string, data: any): Observable<ApiResponse<StaffAccess>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.staffAccess.update + staffAccessCode, data)
    .pipe(
      tap(_ => this.log('staff-access')),
      catchError(this.handleError('staff-access', []))
    );
  }

  delete(staffAccessCode: string): Observable<ApiResponse<StaffAccess>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.staffAccess.delete + staffAccessCode)
    .pipe(
      tap(_ => this.log('staff-access')),
      catchError(this.handleError('staff-access', []))
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
