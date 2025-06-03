import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';
import { StaffUser } from '../models/staff-user';
import { ApiResponse } from '../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class StaffUserService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getAdvanceSearch(params:{
    order: any,
    columnDef: { apiNotation: string; filter: string }[],
    pageSize: number,
    pageIndex: number
  }): Observable<ApiResponse<{ results: StaffUser[], total: number}>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.staffUser.getAdvanceSearch,
      params)
    .pipe(
      tap(_ => this.log('staff-user')),
      catchError(this.handleError('staff-user', []))
    );
  }

  getByCode(userCode: string): Observable<ApiResponse<StaffUser>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.staffUser.getByCode + userCode)
    .pipe(
      tap(_ => this.log('staff-user')),
      catchError(this.handleError('staff-user', []))
    );
  }

  create(data: any): Observable<ApiResponse<StaffUser>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.staffUser.create, data)
    .pipe(
      tap(_ => this.log('staff-user')),
      catchError(this.handleError('staff-user', []))
    );
  }

  updateProfile(userCode: string, data: any): Observable<ApiResponse<StaffUser>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.staffUser.updateProfile + userCode, data)
    .pipe(
      tap(_ => this.log('staff-user')),
      catchError(this.handleError('staff-user', []))
    );
  }

  update(id: string, data: any): Observable<ApiResponse<StaffUser>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.staffUser.update + id, data)
    .pipe(
      tap(_ => this.log('staff-user')),
      catchError(this.handleError('staff-user', []))
    );
  }

  delete(userCode): Observable<ApiResponse<StaffUser>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.staffUser.delete + userCode)
    .pipe(
      tap(_ => this.log('staff-user')),
      catchError(this.handleError('staff-user', []))
    );
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      this.log(`${operation} failed: ${Array.isArray(error.error.message) ? error.error.message[0] : error.error.message}`);
      return of(error.error as T);
    };
  }

  log(message: string) {
    console.log(message);
  }
}
