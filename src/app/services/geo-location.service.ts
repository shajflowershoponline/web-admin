import { Injectable } from '@angular/core';
import { IServices } from './interface/iservices';
import { BehaviorSubject, catchError, Observable, switchMap, tap, timeInterval } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../shared/models/api-response.model';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root',
})
export class GeoLocationService implements IServices {
  private data = new BehaviorSubject({});
  data$ = this.data.asObservable();
  constructor(private http: HttpClient, private appconfig: AppConfigService) {
    navigator.geolocation.watchPosition((pos: GeolocationPosition) => {
      this.data.next(pos);
    },
      () => {
        console.log('Position is not available');
      },
      {
        timeout: 4000,
        enableHighAccuracy: true,
      });
  }

  public getPosition(): Observable<GeolocationPosition> {
    return Observable.create((observer) => {
      navigator.geolocation.watchPosition((pos: GeolocationPosition) => {
        observer.next(pos);
        console.log(pos);
        this.data.next(pos);
      }, ()=> {

      }, { timeout: 4000, enableHighAccuracy: true})
    });
  }

  public getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition((pos: GeolocationPosition)=>{
        resolve(pos);
      }, (res)=>{
        reject(res);
      },{ enableHighAccuracy: true, timeout: 4000 })
    });
  }

  geocodeAddress(query: string): Observable<ApiResponse<
    {
      address: string;
      coordinates: {
        lat: number
        lng: number;
      };
    }[]>> {
    return this.http.get<any>(environment.apiBaseUrl + this.appconfig.config.apiEndPoints.geolocation.searchAddress + "?query=" + query)
    .pipe(
      tap(_ => this.log('geolocation')),
      catchError(this.handleError('geolocation', []))
    );
  }

  reverseGeocode(lat: number, lng: number) {
    const apiKey = environment.openRouteServiceAPIKey;
    return this.http.get<any>(`https://api.openrouteservice.org/geocode/reverse?api_key=${apiKey}&point.lat=${lat}&point.lon=${lng}`)
      .pipe(
        switchMap(response => {
          const label = response?.features?.[0]?.properties?.label || '';
          return [label];
        })
      );
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return new BehaviorSubject(result as T).asObservable();
    };
  }
  log(message: string) {
    console.log(message);
  }
}
