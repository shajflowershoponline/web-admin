import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { GiftAddOns } from '../models/gift-add-ons';
import { ApiResponse } from '../shared/models/api-response.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class GiftAddOnsService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getAdvanceSearch(params: {
    keywords: string;
    order: string;
    pageSize: number;
    pageIndex: number;
  }): Observable<ApiResponse<{ results: GiftAddOns[], total: number }>> {
    return this.http.post<any>(
      environment.apiBaseUrl + this.appconfig.config.apiEndPoints.giftAddOns.getAdvanceSearch,
      {
        keywords: params.keywords,
        order: params.order,
        pageSize: params.pageSize,
        pageIndex: params.pageIndex
      }
    ).pipe(
      tap(_ => this.log('giftAddOns')),
      catchError(this.handleError<ApiResponse<{ results: GiftAddOns[], total: number }>>('giftAddOns'))
    );
  }

  getByCode(sku: string): Observable<ApiResponse<GiftAddOns>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.giftAddOns.getByCode + sku)
    .pipe(
      tap(_ => this.log('giftAddOns')),
      catchError(this.handleError('giftAddOns', []))
    );
  }

  create(data: any): Observable<ApiResponse<GiftAddOns>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.giftAddOns.create, data)
    .pipe(
      tap(_ => this.log('giftAddOns')),
      catchError(this.handleError('giftAddOns', []))
    );
  }

  update(id: string, data: any): Observable<ApiResponse<GiftAddOns>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.giftAddOns.update + id, data)
    .pipe(
      tap(_ => this.log('giftAddOns')),
      catchError(this.handleError('giftAddOns', []))
    );
  }

  updateOrder(data: any[]): Observable<ApiResponse<GiftAddOns>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.giftAddOns.updateOrder, data)
    .pipe(
      tap(_ => this.log('giftAddOns')),
      catchError(this.handleError('giftAddOns', []))
    );
  }

  delete(sku): Observable<ApiResponse<GiftAddOns>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.giftAddOns.delete + sku)
    .pipe(
      tap(_ => this.log('giftAddOns')),
      catchError(this.handleError('giftAddOns', []))
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
