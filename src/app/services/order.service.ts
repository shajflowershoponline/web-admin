import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Order } from '../models/order';
import { ApiResponse } from '../shared/models/api-response.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class OrderService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getAdvanceSearch(params:{
    order: any,
    columnDef: { apiNotation: string; filter: string }[],
    pageSize: number,
    pageIndex: number
  }): Observable<ApiResponse<{ results: Order[], total: number}>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.order.getAdvanceSearch,
      params)
    .pipe(
      tap(_ => this.log('order')),
      catchError(this.handleError('order', []))
    );
  }

  getByCode(sku: string): Observable<ApiResponse<Order>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.order.getByCode + sku)
    .pipe(
      tap(_ => this.log('order')),
      catchError(this.handleError('order', []))
    );
  }

  updateStatus(id: string, data: any): Observable<ApiResponse<Order>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.order.updateStatus + id, data)
    .pipe(
      tap(_ => this.log('order')),
      catchError(this.handleError('order', []))
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
