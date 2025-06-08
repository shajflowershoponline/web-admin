import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { Collection } from 'src/app/models/collection';
import { AppConfigService } from 'src/app/services/app-config.service';
import { CollectionService } from 'src/app/services/collection.service';
import { StorageService } from 'src/app/services/storage.service';
import { AlertDialogModel } from 'src/app/shared/components/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/components/alert-dialog/alert-dialog.component';
import { ApiResponse } from 'src/app/shared/models/api-response.model';
import { CollectionTableColumn } from 'src/app/shared/utility/table';
import { convertNotationToObject } from 'src/app/shared/utility/utility';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrl: './collection.component.scss',
  host: {
    class: "page-component"
  }
})
export class CollectionComponent implements OnInit, AfterViewInit {
  error: string;
  dataSource = new MatTableDataSource<CollectionTableColumn>();
  displayedColumns = [];
  isLoading = false;
  isProcessing = false;
  pageIndex = 0;
  pageSize = 12;
  total = 0;
  filterKeywords = "";

  // pageAccess: Access = {
  //   view: true,
  //   modify: false,
  // };
  constructor(
    private collectionService: CollectionService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public appConfig: AppConfigService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    public router: Router) {
    this.dataSource = new MatTableDataSource([]);
  }

  drop(event: CdkDragDrop<CollectionTableColumn[]>) {
    const currentData = this.dataSource.data;
    moveItemInArray(currentData, event.previousIndex, event.currentIndex);
    currentData.forEach((item, index) => (item.sequenceId = (index + 1).toString())); // Update sequenceId as string
    this.dataSource.data = [...currentData];

    const reordered = currentData.map((item) => ({
      collectionId: item.collectionId,
      sequenceId: item.sequenceId,
    }));

    console.log("reordered ", reordered);
    this.isLoading = true;
    this.collectionService.updateOrder(reordered).subscribe(res => {
      this.isLoading = false;
      if (res.success) {

      } else {
        this.error = typeof res?.message !== "string" && Array.isArray(res.message) ? res.message[0] : res.message;
        this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
        this.isLoading = false;
      }

    }, (error) => {
      this.isLoading = false;
      this.error = typeof error?.message !== "string" && Array.isArray(error?.message) ? error?.message[0] : error?.message;
      this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
      this.isLoading = false;
    });

  }


  ngOnInit(): void {
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
      this.collectionService.getAdvanceSearch({
        keywords: this.filterKeywords,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      })
        .subscribe(async res => {
          this.isLoading = false;
          if (res.success) {
            let data = res.data.results.map((d) => {
              return {
                collectionId: d.collectionId,
                sequenceId: d.sequenceId,
                name: d.name,
                desc: d.desc,
                productCount: d.productCount,
                thumbnailUrl: d.thumbnailFile?.url,
                isSale: d.isSale,
                isFeatured: d.isFeatured,
                saleFromDate: moment(d.saleFromDate).format("YYYY-MM-DD"),
                saleDueDate: moment(d.saleDueDate).format("YYYY-MM-DD"),
                url: `/collection/${d.collectionId}`,
              } as CollectionTableColumn
            });
            this.total = res.data.total;
            this.dataSource = new MatTableDataSource(data);
          }
          else {
            this.error = typeof res?.message !== "string" && Array.isArray(res.message) ? res.message[0] : res.message;
            this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
            this.isLoading = false;
          }
        }, async (err) => {
          this.error = Array.isArray(err.message) ? err.message[0] : err.message;
          this.snackBar.open(this.error, 'close', { panelClass: ['style-error'] });
          this.isLoading = false;
        });
    }
    catch (e) {
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
    return '../../../../assets/img/thumbnail-collection.png';
  }

  onToggleFeatured(item: CollectionTableColumn) {
    const isFeatured: boolean = !item.isFeatured;
    if (!item.collectionId) {
      return;
    }

    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = isFeatured ? 'Make this collection featured?' : 'Hide this collection from featured?';
    dialogData.confirmButton = {
      visible: true,
      text: 'yes',
      color: 'primary',
    };
    dialogData.dismissButton = {
      visible: true,
      text: 'cancel',
    };
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      maxWidth: '400px',
      closeOnNavigation: true,
    });
    dialogRef.componentInstance.alertDialogConfig = dialogData;

    dialogRef.componentInstance.conFirm.subscribe(async (data: any) => {
      this.isProcessing = true;
      dialogRef.componentInstance.isProcessing = this.isProcessing;
      try {
        this.isProcessing = true;
        const params = {
          isFeatured
        };
        const res: ApiResponse<Collection> = await this.collectionService.updateFeatured(item.collectionId, params).toPromise();
        this.isProcessing = false;
        if (res.success) {
          this.snackBar.open('Saved!', 'close', {
            panelClass: ['style-success'],
          });
          this.router.navigate(['/collection/' + res.data.collectionId]);
          dialogRef.componentInstance.isProcessing = this.isProcessing;
          dialogRef.close();
        } else {
          dialogRef.componentInstance.isProcessing = this.isProcessing;
          this.error = typeof res?.message !== "string" && Array.isArray(res?.message)
            ? res.message[0]
            : res.message;
          this.snackBar.open(this.error, 'close', {
            panelClass: ['style-error'],
          });
          dialogRef.close();
        }
      } catch (e) {
        this.isProcessing = false;
        dialogRef.componentInstance.isProcessing = this.isProcessing;
        this.error = typeof e.message !== "string" && Array.isArray(e.message) ? e.message[0] : e.message;
        this.snackBar.open(this.error, 'close', {
          panelClass: ['style-error'],
        });
        dialogRef.close();
      }
    });
  }
}
