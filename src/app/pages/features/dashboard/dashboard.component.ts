import { Component, ViewChild } from '@angular/core';
import * as ApexCharts from 'apexcharts';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {  Moment } from 'moment';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, catchError, forkJoin, of, takeUntil } from 'rxjs';
import { DashboardService } from 'src/app/services/dashboard.service';
import { StorageService } from 'src/app/services/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  host: {
    class: 'page-component',
  },
})
export class DashboardComponent {
  isLoading = false;
  isLoadingMap = false;
  showMap = true;
  totalClients = 0;
  totalEventsPending = 0;
  totalEventsRegistered = 0;
  totalSupportTicket = 0;
  error;
  geolocationPosition;
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  eventStatusCtrl = new FormControl("ALL");

  constructor(
    private snackBar: MatSnackBar,
    private dashboardService: DashboardService,
    private storageService: StorageService,
    private dialog: MatDialog,
    private router: Router
  ) {
  }

  async ngAfterViewInit(): Promise<void> {
  }

  initDashboardUsers() {
    try {
    } catch (ex) {
      this.isLoading = false;
      this.error = Array.isArray(ex?.message) ? ex?.message[0] : ex?.message;
      this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
    }
  }

  handleError<T>(operation = 'operation', result?: any) {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    return (error: any): Observable<any> => {
      return of(error.error as any);
    };
  }
}
