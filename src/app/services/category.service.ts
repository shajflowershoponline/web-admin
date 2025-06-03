import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Category } from '../models/category';
import { ApiResponse } from '../shared/models/api-response.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class CategoryService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getAdvanceSearch(params:{
    keywords: string;
    order?: string;
    pageSize: number;
    pageIndex: number;
  }): Observable<ApiResponse<{ results: Category[], total: number}>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.category.getAdvanceSearch,
      {
        keywords: params.keywords,
        order: params.order,
        pageSize: params.pageSize,
        pageIndex: params.pageIndex
      })
    .pipe(
      tap(_ => this.log('category')),
      catchError(this.handleError('category', []))
    );
  }

  getByCode(sku: string): Observable<ApiResponse<Category>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.category.getByCode + sku)
    .pipe(
      tap(_ => this.log('category')),
      catchError(this.handleError('category', []))
    );
  }

  create(data: any): Observable<ApiResponse<Category>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.category.create, data)
    .pipe(
      tap(_ => this.log('category')),
      catchError(this.handleError('category', []))
    );
  }

  update(id: string, data: any): Observable<ApiResponse<Category>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.category.update + id, data)
    .pipe(
      tap(_ => this.log('category')),
      catchError(this.handleError('category', []))
    );
  }

  updateOrder(data: any[]): Observable<ApiResponse<Category>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.category.updateOrder, data)
    .pipe(
      tap(_ => this.log('category')),
      catchError(this.handleError('category', []))
    );
  }

  delete(sku): Observable<ApiResponse<Category>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.category.delete + sku)
    .pipe(
      tap(_ => this.log('category')),
      catchError(this.handleError('category', []))
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
