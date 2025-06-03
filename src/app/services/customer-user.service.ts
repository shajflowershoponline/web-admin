import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CustomerUser } from '../models/customer-user';
import { ApiResponse } from '../shared/models/api-response.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class CustomerUserService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getAdvanceSearch(params:{
    order: any,
    columnDef: { apiNotation: string; filter: string }[],
    pageSize: number,
    pageIndex: number
  }): Observable<ApiResponse<{ results: CustomerUser[], total: number}>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.customerUser.getAdvanceSearch,
      params)
    .pipe(
      tap(_ => this.log('customer-user')),
      catchError(this.handleError('customer-user', []))
    );
  }

  getByCode(userCode: string): Observable<ApiResponse<CustomerUser>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.customerUser.getByCode + userCode)
    .pipe(
      tap(_ => this.log('customer-user')),
      catchError(this.handleError('customer-user', []))
    );
  }

  updateProfile(userCode: string, data: any): Observable<ApiResponse<CustomerUser>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.customerUser.updateProfile + userCode, data)
    .pipe(
      tap(_ => this.log('customer-user')),
      catchError(this.handleError('customer-user', []))
    );
  }

  update(id: string, data: any): Observable<ApiResponse<CustomerUser>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.customerUser.update + id, data)
    .pipe(
      tap(_ => this.log('customer-user')),
      catchError(this.handleError('customer-user', []))
    );
  }

  delete(userCode): Observable<ApiResponse<CustomerUser>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.customerUser.delete + userCode)
    .pipe(
      tap(_ => this.log('customer-user')),
      catchError(this.handleError('customer-user', []))
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
