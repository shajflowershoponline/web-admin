import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { Observable, Subscription, debounceTime, distinctUntilChanged, forkJoin, of, map, startWith, switchMap } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { MyErrorStateMatcher } from 'src/app/shared/form-validation/error-state.matcher';
import { getAge } from 'src/app/shared/utility/utility';
import { AlertDialogModel } from 'src/app/shared/components/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/components/alert-dialog/alert-dialog.component';
import { ImageViewerDialogComponent } from 'src/app/shared/components/image-viewer-dialog/image-viewer-dialog.component';
import { Collection } from 'src/app/models/collection';
import { CollectionService } from 'src/app/services/collection.service';
import { ApiResponse } from 'src/app/shared/models/api-response.model';
import { ImageUploadDialogComponent } from 'src/app/shared/components/image-upload-dialog/image-upload-dialog.component';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { ProductService } from 'src/app/services/product.service';
import { ProductTableColumn } from 'src/app/shared/utility/table';
import { Discounts } from 'src/app/models/discounts';
import { DiscountsService } from 'src/app/services/discounts.service';


export class ProductCollectionTableColumn extends ProductTableColumn {
  isNew: boolean;
}

export class SelectProductTableColumn extends ProductTableColumn {
  selected: boolean;
}

@Component({
  selector: 'app-collection-details',
  templateUrl: './collection-details.component.html',
  styleUrls: ['./collection-details.component.scss'],
  host: {
    class: 'page-component',
  },
})
export class CollectionDetailsComponent implements OnInit {
  collectionId;
  isNew = false;
  isReadOnly = true;
  error;
  isLoading = true;
  collectionForm: FormGroup = new FormGroup({
    sequenceId: new FormControl(null, [Validators.required]),
    name: new FormControl(null, [Validators.required]),
    desc: new FormControl(null, [Validators.required]),
    isFeatured: new FormControl(false),
    isSale: new FormControl(false),
    saleFromDate: new FormControl(new Date().toISOString(), [Validators.required]),
    saleDueDate: new FormControl(new Date().toISOString(), [Validators.required]),
    selectedDiscounts: new FormControl(),
    productIds: new FormControl()
  }
  );
  mediaWatcher: Subscription;
  matcher = new MyErrorStateMatcher();
  isProcessing = false;
  isLoadingRoles = false;
  maxDate = moment(new Date().getFullYear() - 18).format('YYYY-MM-DD');

  collection: Collection;
  collectionThumbnailSource: any;
  collectionThumbnail;
  collectionThumbnailLoaded = false;

  productCollectionDisplayedColumns = ["sku", "name", "category", "controls"]
  productCollectionDataSource = new MatTableDataSource<ProductCollectionTableColumn>();

  @ViewChild('selectProductDialog') selectProductDialog: TemplateRef<any>;
  productDisplayedColumns = ["selected", "sku", "name", "category"]
  productDataSource = new MatTableDataSource<SelectProductTableColumn>();
  selectedProduct: SelectProductTableColumn;
  total = 0;
  pageIndex = 0;
  pageSize = 10
  productOrder = { name: "ASC" } as any;
  filterSKU = "";
  filterProductName = "";
  filterProductCategory = "";
  @ViewChild('productPaginator', { static: false }) productPaginator: MatPaginator;
  @ViewChild(MatSort) productSort: MatSort;
  productDialog: MatDialogRef<any, any>;


  searchDiscountsCtrl = new FormControl();
  filteredDiscountsOptions$: Observable<Discounts[]> = of([]);
  optionDiscounts: Discounts[] = [];
  filterOptionDiscounts: Discounts[] = [];
  loadingOptionDiscounts = false;

  constructor(
    private collectionService: CollectionService,
    private productService: ProductService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private appconfig: AppConfigService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    public router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private discountsService: DiscountsService,
  ) {
    const { isNew, edit } = this.route.snapshot.data;
    this.isNew = isNew ? isNew : false;
    this.collectionId = this.route.snapshot.paramMap.get('collectionId');
    this.isReadOnly = !edit && !isNew;
    this.collection = {
      thumbnailFile: {}
    } as any;
  }

  get pageRights() {
    let rights = {};
    // for(var right of this.pageAccess.rights) {
    //   rights[right] = this.pageAccess.modify;
    // }
    return rights;
  }

  get f() {
    return this.collectionForm.controls;
  }
  get formIsValid() {
    return this.collectionForm.valid;
  }
  get formIsReady() {
    const newProductIds = this.productCollectionDataSource?.data.map(x => x.productId) ?? [];
    const oldProductIds = this.collection?.productCollections?.map(x => x.product.productId) ?? [];
    const hasChanges = newProductIds.length !== oldProductIds.length ||
      new Set(newProductIds).size !== new Set([...newProductIds, ...oldProductIds]).size;
    return this.collectionForm.dirty || hasChanges;
  }
  get formData() {
    const data = this.collectionForm.value;
    data.sequenceId = data?.sequenceId?.toString();
    data.selectedDiscounts = (data.selectedDiscounts ?? []) as Discounts[];
    data.thumbnailFile = this.collectionThumbnail;
    data.productIds = this.productCollectionDataSource?.data.map(x => x.productId);
    data.discountTagsIds = ((data.selectedDiscounts ?? []) as Discounts[]).map(x => x.discountId);
    return data;
  }

  async ngOnInit(): Promise<void> {

    this.collectionForm.get("saleFromDate").disable();
    this.collectionForm.get("saleDueDate").disable();
    if (!this.isNew) {
      this.isLoading = true;
      await this.initDetails();
      this.isLoading = false;
    }
    await this.initMultiSelect();
    this.isLoading = false;
    this.collectionForm.get("isSale").valueChanges.subscribe(res => {
      if (res) {
        this.collectionForm.get("saleFromDate").enable({ emitEvent: false });
        this.collectionForm.get("saleDueDate").enable({ emitEvent: false });
        this.collectionForm.controls["selectedDiscounts"] = new FormControl(null, [Validators.required]);
      } else {
        this.collectionForm.get("saleFromDate").disable();
        this.collectionForm.get("saleDueDate").disable();
        this.collectionForm.controls["selectedDiscounts"].setValidators(null);
      }
    });
  }

  ngAfterViewInit() {
  }
  async initDetails() {
    try {
      forkJoin([
        this.collectionService.getByCode(this.collectionId).toPromise(),
        this.collectionService.getAdvanceSearch({
          keywords: "",
          pageIndex: 0,
          pageSize: 10
        })
      ]).subscribe(([collection]) => {
        if (collection.success) {
          this.collection = collection.data;
          this.collectionForm.patchValue({
            sequenceId: collection.data.sequenceId,
            name: collection.data.name,
            desc: collection.data.desc,
            isSale: collection.data.isSale,
            isFeatured: collection.data.isFeatured,
            saleFromDate: collection.data.saleFromDate,
            saleDueDate: collection.data.saleDueDate,
            selectedDiscounts: collection.data.selectedDiscounts,
          }, { emitEvent: false });
          let items: ProductCollectionTableColumn[] = [];
          if (collection.data.productCollections && collection.data.productCollections.length > 0) {
            items = collection.data.productCollections.map(x => {
              return {
                sku: x.product?.sku,
                name: x.product?.name,
                category: x.product?.category?.name,
                productId: x.product?.productId,
                isNew: false
              } as ProductCollectionTableColumn;
            });
            this.productCollectionDataSource.data = items;
          }

          this.collectionForm.updateValueAndValidity({ emitEvent: false });
          if (this.isReadOnly) {
            this.collectionForm.disable();
            this.searchDiscountsCtrl.disable();
          }

          if (this.collection.isSale) {
            this.collectionForm.get("saleFromDate").enable();
            this.collectionForm.get("saleDueDate").enable();
            this.collectionForm.get("isSale").setValue(true, { emitEvent: false });
            this.collectionForm.controls["selectedDiscounts"] = new FormControl(this.collection.selectedDiscounts, [Validators.required]);
          } else {
            this.collectionForm.get("saleFromDate").disable();
            this.collectionForm.get("saleDueDate").disable();
            this.collectionForm.get("isSale").setValue(false, { emitEvent: false });
            this.collectionForm.controls["selectedDiscounts"] = new FormControl(null);
          }
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.error = Array.isArray(collection.message) ? collection.message[0] : collection.message;
          this.snackBar.open(this.error, 'close', {
            panelClass: ['style-error'],
          });
        }
      });
    } catch (ex) {
      this.isLoading = false;
      this.error = Array.isArray(ex.message) ? ex.message[0] : ex.message;
      this.snackBar.open(this.error, 'close', {
        panelClass: ['style-error'],
      });
    }
  }
  async initMultiSelect() {
    this.filteredDiscountsOptions$ = this.searchDiscountsCtrl.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      switchMap(searchTerm => this.fetchMultiOptions(searchTerm, "discounts") as Observable<Discounts[]>)
    );
  }

  fetchMultiOptions(query: string, type: "discounts"): Observable<any[]> | Observable<Discounts[]> {
    if (!query || query === "") return of([] as any[]);
    if (type === "discounts") {
      return this.discountsService.getAdvanceSearch({
        keywords: query,
        order: {
          promoCode: 'ASC',
        } as any,
        pageIndex: 0,
        pageSize: 10,
      }).pipe(
        map((res: ApiResponse<{
          results: Discounts[];
          total: number;
        }>) => {
          if (res.success) {
            return res.data.results;
          }
          return [];
        })
      );
    } else {
      return of([] as any[]);
    }
  }

  toggleMultiSelection(option: any | Discounts, type: "discounts") {
    if (type === "discounts") {
      const index = this.formData.selectedDiscounts.findIndex(o => o.discountId === (option as Discounts).discountId);
      if (index > -1) {
        const currentSelected = this.formData.selectedDiscounts;
        currentSelected.splice(index, 1);
        this.collectionForm.controls["selectedDiscounts"].setValue(currentSelected);
        this.collectionForm.controls["productIds"].setValue(currentSelected);
      } else {
        const currentSelected = this.formData.selectedDiscounts;
        currentSelected.push(option as Discounts);
        this.collectionForm.controls["selectedDiscounts"].setValue(currentSelected);
        this.collectionForm.controls["productIds"].setValue(currentSelected);
      }
      this.collectionForm.controls["selectedDiscounts"].markAsDirty();
      this.collectionForm.controls["selectedDiscounts"].markAsTouched();
      this.collectionForm.controls["selectedDiscounts"].markAllAsTouched();
      this.collectionForm.controls["productIds"].markAsDirty();
      this.collectionForm.controls["productIds"].markAsTouched();
      this.collectionForm.controls["productIds"].markAllAsTouched();
    }
  }

  isSelectedMultiSelect(option: any | Discounts, type: "discounts"): boolean {
    if (type === "discounts") {
      return this.formData.selectedDiscounts.some(o => o.discountId === (option as Discounts).discountId);
    } else {
      return false;
    }
  }

  getError(key: string) {
    return this.f[key].errors;
  }

  onSubmit() {
    if (this.collectionForm.invalid) {
      return;
    }

    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = 'Save user?';
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
        const params = this.formData;
        let res: ApiResponse<Collection>;
        if (this.isNew) {
          res = await this.collectionService.create(params).toPromise();
        } else {
          res = await this.collectionService.update(this.collectionId, params).toPromise();
        }
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
          if (res?.message?.toString().toLowerCase().includes("name") && res?.message?.toString().toLowerCase().includes("already exist")) {
            this.collectionForm.get("name").setErrors({
              exist: true
            })
          }
          if (res?.message?.toString().toLowerCase().includes("sequence") && res?.message?.toString().toLowerCase().includes("must be a number string")) {
            this.collectionForm.get("sequenceId").setErrors({
              invalid: true
            })
          }
          if (res?.message?.toString().toLowerCase().includes("sequence") && res?.message?.toString().toLowerCase().includes("already exist")) {
            this.collectionForm.get("sequenceId").setErrors({
              exist: true
            })
          }
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

  onDeleteCollection() {
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Delete collection';
    dialogData.message = 'Are you sure you want to delete this collection?';
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
      try {

        const res = await this.collectionService.delete(this.collectionId).toPromise();
        if (res.success) {
          this.snackBar.open('collection deleted!', 'close', {
            panelClass: ['style-success'],
          });
          this.router.navigate(['/collection/']);
          this.isProcessing = false;
          dialogRef.componentInstance.isProcessing = this.isProcessing;
          dialogRef.close();
        } else {
          this.isProcessing = false;
          dialogRef.componentInstance.isProcessing = this.isProcessing;
          this.error = typeof res?.message !== "string" && Array.isArray(res.message)
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
        this.error = Array.isArray(e.message) ? e.message[0] : e.message;
        this.snackBar.open(this.error, 'close', {
          panelClass: ['style-error'],
        });
        dialogRef.close();
      }
    });
  }

  onShowChangeThumbnail() {
    const dialogRef = this.dialog.open(ImageUploadDialogComponent, {
      disableClose: true,
      panelClass: "image-upload-dialog"
    });
    dialogRef.componentInstance.showCropper = false;
    dialogRef.componentInstance.showWebCam = false;
    dialogRef.componentInstance.doneSelect.subscribe(res => {
      this.collectionThumbnailLoaded = false;
      this.collection.thumbnailFile = {
        url: res.base64
      };
      this.collectionForm.markAsDirty();
      this.collectionForm.markAllAsTouched();
      dialogRef.close();

      this.collectionThumbnail = {
        fileName: `${moment().format("YYYY-MM-DD-hh-mm-ss")}.png`,
        data: res.base64.toString().split(',')[1]
      };
    })
  }

  onShowImageViewer() {
    const dialogRef = this.dialog.open(ImageViewerDialogComponent, {
      disableClose: true,
      panelClass: "image-viewer-dialog"
    });
    const img: HTMLImageElement = document.querySelector(".thumbnail-pic img");
    dialogRef.componentInstance.imageSource = img?.src;
    dialogRef.componentInstance.canChange = false;

    dialogRef.componentInstance.changed.subscribe(res => {
      this.collectionThumbnailLoaded = false;
      this.collectionThumbnailSource = res.base64;
      dialogRef.close();

      this.collectionThumbnail = {
        fileName: `${moment().format("YYYY-MM-DD-hh-mm-ss")}.png`,
        data: res.base64.toString().split(',')[1]
      };
    })
  }

  pictureErrorHandler(event) {
    event.target.src = this.getDeafaultPicture();
  }

  getDeafaultPicture() {
    return '../../../../../assets/img/thumbnail-collection.png';
  }

  openSelectProductDialog() {
    this.productDataSource = new MatTableDataSource<SelectProductTableColumn>([]);
    this.isProcessing = true;
    this.productDialog = this.dialog.open(this.selectProductDialog, {
      disableClose: true,
      panelClass: 'select-product',
      width: "900px",
    });
    this.isProcessing = false;
    this.productDialog.afterOpened().subscribe(async res => {
      this.initProduct();
      this.initProductDialog();
    });
    this.productDialog.afterClosed().subscribe(async res => {
      console.log("close", res);
      this.selectedProduct = null;
    });
  }

  initProductDialog() {
    this.productDataSource.sort = this.productSort;
    this.productDataSource.paginator = this.productPaginator;
    this.productPaginator.page.subscribe((event: PageEvent) => {
      const { pageIndex, pageSize } = event;
      this.pageIndex = pageIndex;
      this.pageSize = pageSize;
      this.initProduct();
    });
    this.productDataSource.sort.sortChange.subscribe((event: MatSort) => {
      const { active, direction } = event;
      if (active === "name") {
        this.productOrder = { name: direction.toUpperCase() }
      } else if (active === "category") {
        this.productOrder = {
          category: {
            name: direction.toUpperCase()
          }
        }
      }
      this.initProduct();
    });
  }

  initProduct() {
    const filter: any[] = [
      {
        apiNotation: "sku",
        filter: this.filterSKU,
      },
      {
        apiNotation: "name",
        filter: this.filterProductName,
      },
      {
        apiNotation: "category.name",
        filter: this.filterProductCategory,
      },
    ];
    try {
      this.productService.getAdvanceSearch({
        order: this.productOrder,
        columnDef: filter,
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      }).subscribe(res => {
        this.productDataSource = new MatTableDataSource(res.data.results.map(x => {
          return {
            productId: x.productId,
            sku: x.sku,
            name: x.name,
            category: x.category.name,
            selected: this.selectedProduct?.productId === x.productId
          }
        }));
        this.total = res.data.total;
      });
    } catch (ex) {

    }
  }

  isSelected(item: SelectProductTableColumn) {
    return this.productDataSource.data.find(x => x.productId === item.productId && x.selected) ? true : false;
  }

  selectionChange(currentItem: SelectProductTableColumn, selected) {
    console.log(currentItem);
    console.log("selected", selected);
    const items = this.productDataSource.data;
    if (selected) {
      for (var item of items) {
        item.selected = currentItem.productId === item.productId;
      }
    }
    else {
      const items = this.productDataSource.data;
      for (var item of items) {
        item.selected = false;
      }
    }
    this.productDataSource = new MatTableDataSource<SelectProductTableColumn>(items);
    console.log("selected", this.productDataSource.data);
    this.selectedProduct = this.productDataSource.data.find(x => x.selected);
  }

  async doneProductSelection() {
    try {
      const res = await this.productService.getByCode(this.selectedProduct.sku).toPromise();
      if (res.success) {
        let items = this.productCollectionDataSource.data;
        const exist = items.find(x => x.sku === res.data.sku);
        if (exist) {
          this.snackBar.open("Product already exist in collection", 'close', {
            panelClass: ['style-error'],
          });
          return;
        }

        items.push({
          sku: res.data.sku,
          name: res.data.name,
          category: res.data.category.name,
          productId: res.data.productId,
          isNew: true,
        });

        this.productCollectionDataSource.data = items;
        this.productDialog.close(res.data);
        this.collectionForm.controls["productIds"].setValue(this.productCollectionDataSource.data.map(x=>x.productId));
        this.collectionForm.controls["productIds"].markAsTouched();
        this.collectionForm.controls["productIds"].markAsDirty();
      } else {
        const error = Array.isArray(res.message) ? res.message[0] : res.message;
        this.snackBar.open(error, 'close', { panelClass: ['style-error'] });
      }
    } catch (ex) {
      const error = Array.isArray(ex.message) ? ex.message[0] : ex.message;
      this.snackBar.open(error, 'close', { panelClass: ['style-error'] });
    }
  }

  deleteProductCollectionItem(data: ProductCollectionTableColumn) {
    const newItems = this.productCollectionDataSource.data.filter(x => x.sku !== data.sku);
    this.productCollectionDataSource.data = newItems;
    this.collectionForm.controls["productIds"].setValue(this.productCollectionDataSource.data.map(x=>x.productId));
    this.collectionForm.controls["productIds"].markAsTouched();
    this.collectionForm.controls["productIds"].markAsDirty();
  }
}
