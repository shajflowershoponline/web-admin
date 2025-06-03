import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Discounts } from '../models/discounts';
import { ApiResponse } from '../shared/models/api-response.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class DiscountsService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getAdvanceSearch(params:{
    keywords: string;
    order: string;
    pageSize: number;
    pageIndex: number;
  }): Observable<ApiResponse<{ results: Discounts[], total: number}>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.discounts.getAdvanceSearch,
      {
        keywords: params.keywords,
        order: params.order,
        pageSize: params.pageSize,
        pageIndex: params.pageIndex
      })
    .pipe(
      tap(_ => this.log('discounts')),
      catchError(this.handleError('discounts', []))
    );
  }

  getByCode(sku: string): Observable<ApiResponse<Discounts>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.discounts.getByCode + sku)
    .pipe(
      tap(_ => this.log('discounts')),
      catchError(this.handleError('discounts', []))
    );
  }

  create(data: any): Observable<ApiResponse<Discounts>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.discounts.create, data)
    .pipe(
      tap(_ => this.log('discounts')),
      catchError(this.handleError('discounts', []))
    );
  }

  update(id: string, data: any): Observable<ApiResponse<Discounts>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.discounts.update + id, data)
    .pipe(
      tap(_ => this.log('discounts')),
      catchError(this.handleError('discounts', []))
    );
  }

  updateOrder(data: any[]): Observable<ApiResponse<Discounts>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.discounts.updateOrder, data)
    .pipe(
      tap(_ => this.log('discounts')),
      catchError(this.handleError('discounts', []))
    );
  }

  delete(sku): Observable<ApiResponse<Discounts>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.discounts.delete + sku)
    .pipe(
      tap(_ => this.log('discounts')),
      catchError(this.handleError('discounts', []))
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
