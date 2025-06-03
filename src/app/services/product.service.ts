import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Product } from '../models/product';
import { ApiResponse } from '../shared/models/api-response.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class ProductService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getAdvanceSearch(params:{
    order: any,
    columnDef: { apiNotation: string; filter: string }[],
    pageSize: number,
    pageIndex: number
  }): Observable<ApiResponse<{ results: Product[], total: number}>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.product.getAdvanceSearch,
      params)
    .pipe(
      tap(_ => this.log('product')),
      catchError(this.handleError('product', []))
    );
  }

  getByCode(sku: string): Observable<ApiResponse<Product>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.product.getByCode + sku)
    .pipe(
      tap(_ => this.log('product')),
      catchError(this.handleError('product', []))
    );
  }

  create(data: any): Observable<ApiResponse<Product>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.product.create, data)
    .pipe(
      tap(_ => this.log('product')),
      catchError(this.handleError('product', []))
    );
  }

  update(id: string, data: any): Observable<ApiResponse<Product>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.product.update + id, data)
    .pipe(
      tap(_ => this.log('product')),
      catchError(this.handleError('product', []))
    );
  }

  delete(sku): Observable<ApiResponse<Product>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.product.delete + sku)
    .pipe(
      tap(_ => this.log('product')),
      catchError(this.handleError('product', []))
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
