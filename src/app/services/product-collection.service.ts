import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap, catchError, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Collection } from '../models/collection';
import { ApiResponse } from '../shared/models/api-response.model';
import { AppConfigService } from './app-config.service';
import { IServices } from './interface/iservices';

@Injectable({
  providedIn: 'root'
})
export class ProductCollectionService implements IServices {

  constructor(private http: HttpClient, private appconfig: AppConfigService) { }

  getAdvanceSearch(params:{
    order: any,
    columnDef: { apiNotation: string; filter: string }[],
    pageSize: number,
    pageIndex: number
  }): Observable<ApiResponse<{ results: Collection[], total: number}>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.collection.getAdvanceSearch,
      params)
    .pipe(
      tap(_ => this.log('collection')),
      catchError(this.handleError('collection', []))
    );
  }

  getByCode(sku: string): Observable<ApiResponse<Collection>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.collection.getByCode + sku)
    .pipe(
      tap(_ => this.log('collection')),
      catchError(this.handleError('collection', []))
    );
  }

  create(data: any): Observable<ApiResponse<Collection>> {
    return this.http.post<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.collection.create, data)
    .pipe(
      tap(_ => this.log('collection')),
      catchError(this.handleError('collection', []))
    );
  }

  update(id: string, data: any): Observable<ApiResponse<Collection>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.collection.update + id, data)
    .pipe(
      tap(_ => this.log('collection')),
      catchError(this.handleError('collection', []))
    );
  }

  updateOrder(data: any[]): Observable<ApiResponse<Collection>> {
    return this.http.put<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.collection.updateOrder, data)
    .pipe(
      tap(_ => this.log('collection')),
      catchError(this.handleError('collection', []))
    );
  }

  delete(sku): Observable<ApiResponse<Collection>> {
    return this.http.delete<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.collection.delete + sku)
    .pipe(
      tap(_ => this.log('collection')),
      catchError(this.handleError('collection', []))
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
