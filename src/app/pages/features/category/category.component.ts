import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from 'src/app/services/app-config.service';
import { CategoryService } from 'src/app/services/category.service';
import { StorageService } from 'src/app/services/storage.service';
import { CategoryTableColumn } from 'src/app/shared/utility/table';
import { convertNotationToObject } from 'src/app/shared/utility/utility';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss',
  host: {
    class: "page-component"
  }
})
export class CategoryComponent implements OnInit, AfterViewInit {
  error: string;
  dataSource = new MatTableDataSource<CategoryTableColumn>();
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
    private categoryService: CategoryService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public appConfig: AppConfigService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    public router: Router) {
    this.dataSource = new MatTableDataSource([]);
  }

  drop(event: CdkDragDrop<CategoryTableColumn[]>) {
    const currentData = this.dataSource.data;
    moveItemInArray(currentData, event.previousIndex, event.currentIndex);
    currentData.forEach((item, index) => (item.sequenceId = (index + 1).toString())); // Update sequenceId as string
    this.dataSource.data = [...currentData];

    const reordered = currentData.map((item) => ({
      categoryId: item.categoryId,
      sequenceId: item.sequenceId,
    }));

    console.log("reordered ", reordered);
    this.isLoading = true;
    this.categoryService.updateOrder(reordered).subscribe(res => {
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
      this.categoryService.getAdvanceSearch({
        keywords: this.filterKeywords ,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      })
        .subscribe(async res => {
          this.isLoading = false;
          if (res.success) {
            let data = res.data.results.map((d) => {
              return {
                categoryId: d.categoryId,
                sequenceId: d.sequenceId,
                name: d.name,
                desc: d.desc,
                productCount: d.productCount,
                thumbnailUrl: d.thumbnailFile?.url,
                url: `/category/${d.categoryId}`,
              } as CategoryTableColumn
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
    return '../../../../assets/img/thumbnail-category.png';
  }
}
