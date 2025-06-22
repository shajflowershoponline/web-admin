import { Component, ViewChild } from '@angular/core';
import * as ApexCharts from 'apexcharts';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment } from 'moment';
import * as moment from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subject, catchError, forkJoin, of, takeUntil } from 'rxjs';
import { DashboardService } from 'src/app/services/dashboard.service';
import { StorageService } from 'src/app/services/storage.service';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { ChartConfiguration, ChartOptions } from 'chart.js';


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

  cards = [
    {
      title: 'Total Sales',
      value: '₱23000',
      change: '↑ 12% from last week',
      icon: 'attach_money',
      colorClass: 'sales',
      isNegative: false
    },
    {
      title: 'Total Orders',
      value: '286',
      change: '↑ 8% from last week',
      icon: 'shopping_bag',
      colorClass: 'orders',
      isNegative: false
    },
    {
      title: 'Products',
      value: '86',
      change: '↓ 3% from last week',
      icon: 'local_florist',
      colorClass: 'products',
      isNegative: true
    },
    {
      title: 'Customers',
      value: '487',
      change: '↑ 15% from last week',
      icon: 'people',
      colorClass: 'customers',
      isNegative: false
    }
  ];

  revenueChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['May 15', 'May 20', 'May 25', 'May 30', 'Jun 5', 'Jun 10', 'Jun 15'],
    datasets: [
      {
        label: 'Revenue',
        data: [11335, 33059, 14938, 18901, 29478, 12030, 20150],
        borderColor: '#4a7c59',
        backgroundColor: 'rgba(74, 124, 89, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4
      }
    ],

  };

  revenueChartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => {
            return '₱' + Number(value).toLocaleString(); // ✅ Currency with commas
          },
          color: '#333',
          font: {
            size: 12,
          }
        }
      }
    }
  };


  productChartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Rose Bouquet', 'Tulip Bouquet', 'Lily Arrangement', 'Sunflower Basket', 'Mixed Flowers'],
    datasets: [{
      label: 'Top Products',
      data: [35, 25, 20, 10, 10],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)'
      ],
      borderColor: '#fff',
      borderWidth: 2
    }]
  };

  orders = [
    { id: '#ORD-4567', customer: 'Sarah Johnson', date: 'Jun 12, 2023', amount: '₱89.99', status: 'Completed' },
    { id: '#ORD-4566', customer: 'Michael Brown', date: 'Jun 11, 2023', amount: '₱124.50', status: 'Completed' },
    { id: '#ORD-4565', customer: 'Emily Davis', date: 'Jun 11, 2023', amount: '₱65.25', status: 'Pending' },
    { id: '#ORD-4564', customer: 'Robert Wilson', date: 'Jun 10, 2023', amount: '₱149.99', status: 'Failed' },
    { id: '#ORD-4563', customer: 'Jennifer Lee', date: 'Jun 10, 2023', amount: '₱79.99', status: 'Completed' },
  ];

  displayedColumns = ['id', 'customer', 'date', 'amount', 'status', 'action'];
}
