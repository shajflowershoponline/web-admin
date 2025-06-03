import { HttpClient } from '@angular/common/http';
import { catchError, take, throwError } from 'rxjs';

import { Injectable, APP_INITIALIZER } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig } from '../shared/utility/config';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  private static readonly configPath = "../../assets/config.json";
  private static readonly configPathTableColumns = "../../assets/config.table-columns.json";
  private static readonly configPathApi = "../../assets/config.api.json";

  private appConfig: AppConfig;
  constructor(private http: HttpClient) {
  }

  public loadConfig() {
    Promise.all([
      this.loadAppConfig(),
      this.loadAppConfigTableColumns(),
      this.loadAppConfigApi()
    ]).then(res=> {
      const [appConfig, appConfigTableColumns, appConfigApi] = res;
      this.appConfig = appConfig;
      this.appConfig.tableColumns = appConfigTableColumns;
      this.appConfig.apiEndPoints = appConfigApi;
    })
  }

  private loadAppConfig(): Promise<AppConfig> {
    return new Promise((resolve)=> {
      this.http.get(AppConfigService.configPath)
      .pipe(
        take(1),
        catchError((err) =>{
          return throwError(err || 'Server error')
        } )
      )
      .subscribe((configResponse: object) => {
        resolve(configResponse as AppConfig);
      })
    })

  }

  private loadAppConfigTableColumns(): Promise<any> {
    return new Promise((resolve)=> {
      this.http.get(AppConfigService.configPathTableColumns)
      .pipe(
        take(1),
        catchError((err) =>{
          return throwError(err || 'Server error')
        } )
      )
      .subscribe((configResponse: object) => {
        resolve(configResponse["tableColumns"] as any);
      })
    })

  }

  private loadAppConfigApi(): Promise<any> {
    return new Promise((resolve)=> {
      this.http.get(AppConfigService.configPathApi)
      .pipe(
        take(1),
        catchError((err) =>{
          return throwError(err || 'Server error')
        } )
      )
      .subscribe((configResponse: object) => {
        resolve(configResponse["apiEndPoints"] as any);
      })
    })

  }

  get config() : AppConfig {
    return this.appConfig;
  }
}
