import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from 'src/app/services/app-config.service';
import { DiscountsService } from 'src/app/services/discounts.service';
import { StorageService } from 'src/app/services/storage.service';
import { DiscountsTableColumn } from 'src/app/shared/utility/table';

@Component({
  selector: 'app-gift-add-ons',
  templateUrl: './discounts.component.html',
  styleUrl: './discounts.component.scss',
  host: {
    class: "page-component"
  }
})
export class DiscountsComponent implements OnInit, AfterViewInit {
  currentStaffUserCode;
  error: string;
  dataSource = new MatTableDataSource<DiscountsTableColumn>();
  displayedColumns = [];
  isLoading = false;
  isProcessing = false;
  pageIndex = 0;
  pageSize = 12;
  total = 0;
  filterKeywords = "";
  orderBy = "promoCode"
  orderDirection = "ASC"

  // pageAccess: Access = {
  //   view: true,
  //   modify: false,
  // };
  constructor(
    private discountsService: DiscountsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public appConfig: AppConfigService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    public router: Router) {
    this.dataSource = new MatTableDataSource([]);


  }

  ngOnInit(): void {
    const profile = this.storageService.getLoginProfile();
    this.currentStaffUserCode = profile && profile["staffUserCode"];
    this.getPaginated();
  }

  ngAfterViewInit() {
  }

  async pageChange(event: { pageIndex: number, pageSize: number }) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    await this.getPaginated();
  }

  getPaginated() {
    try {
      this.isLoading = true;
      this.discountsService.getAdvanceSearch({
        keywords: this.filterKeywords ,
        order: {
          [this.orderBy]: this.orderDirection
        } as any,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      }).subscribe(async res => {
        this.isLoading = false;
        if (res.success) {
          const data = res.data.results.map(d => ({
            discountId: d.discountId,
            name: d.promoCode,
            description: d.description,
            type: d.type,
            value: d.value,
            thumbnailUrl: d.thumbnailFile?.url,
            url: `/discounts/${d.discountId}`,
          }) as any);

          this.total = res.data.total;
          this.dataSource = new MatTableDataSource(data);
        } else {
          this.error = typeof res?.message !== 'string' && Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
        }
      }, async (err) => {
        this.error = Array.isArray(err.message) ? err.message[0] : err.message;
        this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
      });
    } catch (e) {
      this.error = Array.isArray(e.message) ? e.message[0] : e.message;
      this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
    }
  }


  onPageChange(event: any) {
    console.log(event);
    const {
      previousPageIndex,
      pageIndex,
      pageSize,
      length
    } = event;
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.getPaginated();
  }

  pictureErrorHandler(event) {
    event.target.src = this.getDeafaultPicture();
  }

  getDeafaultPicture() {
    return '../../../../assets/img/thumbnail-discount.png';
  }
}
