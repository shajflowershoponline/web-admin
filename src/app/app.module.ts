import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes }   from '@angular/router';

import { AppComponent } from './app.component'
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FeaturesComponent } from './pages/features/features.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AppRoutingModule } from './app-routing.module';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { AppConfigService } from './services/app-config.service';
import { PageNotFoundComponent } from './pages/page-not-found/page-not-found.component';
import { CustomHttpInterceptor } from './interceptors/custom-http.interceptors';
import { NoAccessComponent } from './pages/no-access/no-access.component';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { TimeagoClock, TimeagoFormatter, TimeagoIntl, TimeagoModule } from 'ngx-timeago';
import { Observable, interval } from 'rxjs';
import { WebcamModule } from 'ngx-webcam';
import { FlexLayoutModule } from '@ngbracket/ngx-layout';
import { SharedModule } from './shared/shared.module';
import { SharedComponentsModule } from './shared/components/shared-components.module';
import { MaterialModule } from './shared/material/material.module';
import { AppDateAdapter } from './shared/utility/app-date-adapter';
import { AuthComponent } from './pages/auth/auth.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
export class MyClock extends TimeagoClock {
  tick(then: number): Observable<number> {
    return interval(1000);
  }
}

@NgModule({
  declarations: [
    AppComponent,
    FeaturesComponent,
    ProfileComponent,
    AuthComponent,
    PageNotFoundComponent,
    NoAccessComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    SharedModule,
    MaterialModule,
    SharedComponentsModule,
    ReactiveFormsModule,
    WebcamModule,
    FlexLayoutModule,
    DragDropModule,
    TimeagoModule.forRoot({
      formatter: {provide: TimeagoClock, useClass: MyClock },
    })
  ],
  providers: [
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500} },
    {
      provide : APP_INITIALIZER,
      multi : true,
      deps : [AppConfigService],
      useFactory : (config : AppConfigService) =>  () => config.loadConfig()
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptor,
      multi: true
    },
    {provide: DateAdapter, useClass: AppDateAdapter},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
