import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { Observable, Subscription, debounceTime, distinctUntilChanged, forkJoin, of, map, filter, startWith, switchMap } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { MyErrorStateMatcher } from 'src/app/shared/form-validation/error-state.matcher';
import { getAge } from 'src/app/shared/utility/utility';
import { AlertDialogModel } from 'src/app/shared/components/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/components/alert-dialog/alert-dialog.component';
import { ImageViewerDialogComponent } from 'src/app/shared/components/image-viewer-dialog/image-viewer-dialog.component';
import { Product } from 'src/app/models/product';
import { CategoryService } from 'src/app/services/category.service';
import { ProductService } from 'src/app/services/product.service';
import { ApiResponse } from 'src/app/shared/models/api-response.model';
import { GiftAddOns } from 'src/app/models/gift-add-ons';
import { Discounts } from 'src/app/models/discounts';
import { GiftAddOnsService } from 'src/app/services/gift-add-ons.service';
import { DiscountsService } from 'src/app/services/discounts.service';
import { ProductImage } from 'src/app/models/product-image';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  host: {
    class: 'page-component',
  },
})
export class ProductDetailsComponent implements OnInit {
  sku;
  isNew = false;
  isReadOnly = true;
  error;
  isLoading = true;
  productForm: FormGroup = new FormGroup({
    sku: new FormControl(),
    name: new FormControl('', [Validators.required]),
    shortDesc: new FormControl('', [ Validators.required]),
    price: new FormControl(0, [ Validators.required]),
    color: new FormControl(0, [ Validators.required]),
    size: new FormControl(0, [ Validators.required]),
    longDesc: new FormControl('', [ Validators.required]),
    categoryId: new FormControl('', [ Validators.required]),
    productImages: new FormControl([], [Validators.required]),
    selectedGiftAddOns: new FormControl([]),
    selectedDiscounts: new FormControl([]),
    updateImage: new FormControl(false),
    }
  );
  mediaWatcher: Subscription;
  matcher = new MyErrorStateMatcher();
  isProcessing = false;
  isLoadingRoles = false;
  maxDate = moment(new Date().getFullYear() - 18).format('YYYY-MM-DD');

  categorySearchCtrl = new FormControl()
  isOptionsCategoryLoading = false;
  optionsCategory: { name: string; code: string}[] = [];
  @ViewChild('categorySearchInput', { static: true}) categorySearchInput: ElementRef<HTMLInputElement>;

  searchGiftAddOnsCtrl = new FormControl();
  searchDiscountsCtrl = new FormControl();
  filteredGiftAddOnsOptions$: Observable<GiftAddOns[]> = of([]);
  filteredDiscountsOptions$: Observable<Discounts[]> = of([]);

  product: Product;
  productThumbnailSource: any;
  productThumbnail;
  productThumbnailLoaded = false;

  optionsMultiSelect: {
    giftAddOns: GiftAddOns[];
    discounts: Discounts[];
  } = {
    giftAddOns: [],
    discounts: []
  };

  filterOptions: {
    giftAddOns: GiftAddOns[];
    discounts: Discounts[];
  } = {
    giftAddOns: [],
    discounts: []
  };

  loadingOptions: {
    giftAddOns: boolean;
    discounts: boolean
  } = {
    giftAddOns: false,
    discounts: false,
  };
  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private giftAddOnsService: GiftAddOnsService,
    private discountsService: DiscountsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private appconfig: AppConfigService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    public router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {
    const { isNew, edit } = this.route.snapshot.data;
    this.isNew = isNew ? isNew : false;
    this.sku = this.route.snapshot.paramMap.get('sku');
    this.isReadOnly = !edit && !isNew;
  }

  get pageRights() {
    let rights = {};
    // for(var right of this.pageAccess.rights) {
    //   rights[right] = this.pageAccess.modify;
    // }
    return rights;
  }

  get f() {
    return this.productForm.controls;
  }
  get formIsValid() {
    console.log("this.productForm.valid && this.categorySearchCtrl.valid ", this.productForm.valid && this.categorySearchCtrl.valid)
    return this.productForm.valid && this.categorySearchCtrl.valid;
  }
  get formIsReady() {
    console.log("this.productForm.valid && this.categorySearchCtrl.valid && (this.productForm.dirty || this.categorySearchCtrl.dirty)", this.productForm.valid && this.categorySearchCtrl.valid && (this.productForm.dirty || this.categorySearchCtrl.dirty))
    return this.productForm.valid && this.categorySearchCtrl.valid && (this.productForm.dirty || this.categorySearchCtrl.dirty);
  }
  get formData() {
    const data = this.productForm.value;
    data.price = data?.price?.toString();
    data.selectedGiftAddOns = (data.selectedGiftAddOns??[]) as GiftAddOns[];
    data.selectedDiscounts = (data.selectedDiscounts??[]) as Discounts[];
    data.giftAddOnsAvailable = ((data.selectedGiftAddOns??[]) as GiftAddOns[]).map(x=>x.giftAddOnId);
    data.discountTagsIds = ((data.selectedDiscounts??[]) as Discounts[]).map(x=>x.discountId);
    return data;
  }

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    if(!this.isNew) {
      await this.initDetails();
    }
    this.categorySearchCtrl.valueChanges
    .pipe(
        debounceTime(2000),
        distinctUntilChanged()
    )
    .subscribe(async value => {
        await this.initCategoryOptions();
    });
    await this.initCategoryOptions();
    await this.initMultiSelect();
    this.isLoading = false;
  }

  async initDetails() {
    try {
      forkJoin([
        this.productService.getByCode(this.sku).toPromise(),
        this.categoryService.getAdvanceSearch({
          keywords: this.categorySearchInput.nativeElement.value,
            order: {
              "name": "ASC"
            } as any,
          pageIndex: 0,
          pageSize: 10
        })
      ]).subscribe(([product, categoryOptions])=> {
        if(categoryOptions.success) {
          this.optionsCategory = categoryOptions.data.results.map(x=> {
            return { name: x.name, code: x.categoryId }
          });
        }
        if (product.success) {
          this.product = product.data;
          this.productForm.setValue({
            sku: product.data.sku,
            name: product.data.name,
            shortDesc: product.data.shortDesc,
            price: product.data.price,
            size: product?.data?.size ? Number(product?.data?.size) : null,
            color: product.data.color,
            longDesc: product.data.longDesc,
            categoryId: product.data.category?.categoryId,
            updateImage: false,
            productImages: product.data.productImages.map(x=> {
              return {
                fileName: x?.file?.fileName,
                base64: "",
                dataURL: x?.file?.url,
                guid: x?.file?.guid,
                sequenceId: x?.file?.sequenceId??"0",
                noChanges: true,
              }
            }),
            selectedGiftAddOns: product.data.selectedGiftAddOns,
            selectedDiscounts: product.data.selectedDiscounts,
          });
          this.productForm.updateValueAndValidity();
          if (this.isReadOnly) {
            this.productForm.disable();
            this.categorySearchCtrl.disable();
            this.searchGiftAddOnsCtrl.disable();
            this.searchDiscountsCtrl.disable();
          }
          this.categorySearchCtrl.setValue(product.data.category?.categoryId);
          this.productForm.markAsPristine();
          this.productForm.markAsUntouched();
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.error = Array.isArray(product.message) ? product.message[0] : product.message;
          this.snackBar.open(this.error, 'close', {
            panelClass: ['style-error'],
          });
        }
      });
    } catch(ex) {
      this.isLoading = false;
      this.error = Array.isArray(ex.message) ? ex.message[0] : ex.message;
      this.snackBar.open(this.error, 'close', {
        panelClass: ['style-error'],
      });
    }
  }

  onShowImageViewer() {
    const dialogRef = this.dialog.open(ImageViewerDialogComponent, {
        disableClose: true,
        panelClass: "image-viewer-dialog"
    });
    const img: HTMLImageElement = document.querySelector(".profile-pic img");
    dialogRef.componentInstance.imageSource = img?.src;
    dialogRef.componentInstance.canChange = false;

    dialogRef.componentInstance.changed.subscribe(res=> {
      this.productThumbnailLoaded = false;
      this.productThumbnailSource = res.base64;
      dialogRef.close();

      this.productThumbnail = {
        fileName: `${moment().format("YYYY-MM-DD-hh-mm-ss")}.png`,
        data: res.base64.toString().split(',')[1]
      };
    })
  }

  async initCategoryOptions() {
    this.isOptionsCategoryLoading = true;
    const res = await this.categoryService.getAdvanceSearch({
      keywords: this.categorySearchInput.nativeElement.value,
        order: {
          "name": "ASC"
        } as any,
      pageIndex: 0,
      pageSize: 10
    }).toPromise();
    this.optionsCategory = res.data.results.map(a=> { return { name: a.name, code: a.categoryId }});
    this.mapSearchCategory();
    this.isOptionsCategoryLoading = false;
  }

  async initMultiSelect() {
    this.filteredGiftAddOnsOptions$ = this.searchGiftAddOnsCtrl.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      switchMap(searchTerm => this.fetchMultiOptions(searchTerm, "gift-add-ons") as Observable<GiftAddOns[]>)
    );
    this.filteredDiscountsOptions$ = this.searchDiscountsCtrl.valueChanges.pipe(
      debounceTime(300),
      startWith(''),
      switchMap(searchTerm => this.fetchMultiOptions(searchTerm, "discounts") as Observable<Discounts[]>)
    );
  }

  fetchMultiOptions(query: string, type: "gift-add-ons" | "discounts"): Observable<GiftAddOns[]> | Observable<Discounts[]> {
    if (!query || query === "") return of([] as any[]);
    if(type === "gift-add-ons") {
      return this.giftAddOnsService.getAdvanceSearch({
        keywords: query,
        order: {
          name: 'ASC',
        } as any,
        pageIndex: 0,
        pageSize: 10,
      }).pipe(
        map((res: ApiResponse<{
            results: GiftAddOns[];
            total: number;
        }>) => {
          if (res.success) {
            return res.data.results;
          }
          return [];
        })
      );
    } else if(type === "discounts") {
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

  toggleMultiSelection(option: GiftAddOns | Discounts, type: "gift-add-ons" | "discounts") {
    if(type === "gift-add-ons") {
      const index = this.formData.selectedGiftAddOns.findIndex(o => o.giftAddOnId === (option as GiftAddOns).giftAddOnId);
      if (index > -1) {
        const currentSelected = this.formData.selectedGiftAddOns;
        currentSelected.splice(index, 1);
        this.productForm.get("selectedGiftAddOns").setValue(currentSelected);
        this.productForm.get("selectedGiftAddOns").markAsDirty();
      } else {
        const currentSelected = this.formData.selectedGiftAddOns;
        currentSelected.push(option as GiftAddOns);
        this.productForm.get("selectedGiftAddOns").setValue(currentSelected);
        this.productForm.get("selectedGiftAddOns").markAsDirty();
      }
    } else if(type === "discounts") {
      const index = this.formData.selectedDiscounts.findIndex(o => o.discountId === (option as Discounts).discountId);
      if (index > -1) {
        const currentSelected = this.formData.selectedDiscounts;
        currentSelected.splice(index, 1);
        this.productForm.get("selectedDiscounts").setValue(currentSelected);
        this.productForm.get("selectedDiscounts").markAsDirty();
      } else {
        const currentSelected = this.formData.selectedDiscounts;
        currentSelected.push(option as Discounts);
        this.productForm.get("selectedDiscounts").setValue(currentSelected);
        this.productForm.get("selectedDiscounts").markAsDirty();
      }
    }
  }

  isSelectedMultiSelect(option: GiftAddOns| Discounts, type: "gift-add-ons" | "discounts"): boolean {
    if(type === "gift-add-ons") {
    return this.formData.selectedGiftAddOns.some(o => o.giftAddOnId === (option as GiftAddOns).giftAddOnId);
    } else if(type === "discounts") {
    return this.formData.selectedDiscounts.some(o => o.discountId === (option as Discounts).discountId);
    } else {
      return false;
    }
  }

  displayCategoryName(value?: number) {
    return value ? this.optionsCategory.find(_ => _.code === value?.toString())?.name : undefined;
  }

  mapSearchCategory() {
    if(this.f['categoryId'].value !== this.categorySearchCtrl.value) {
      this.f['categoryId'].setErrors({ required: true});
      const selected = this.optionsCategory.find(x=>x.code === this.categorySearchCtrl.value);
      if(selected) {
        this.f["categoryId"].setValue(selected.code);
      } else {
        this.f["categoryId"].setValue(null);
      }
      if(!this.f["categoryId"].value) {
        this.f["categoryId"].setErrors({required: true});
      } else {
        this.f['categoryId'].setErrors(null);
        this.f['categoryId'].markAsPristine();
      }
    }
    this.categorySearchCtrl.setErrors(this.f["categoryId"].errors);
  }

  getError(key: string) {
    return this.f[key].errors;
  }

  onSubmit() {
    if (this.productForm.invalid || this.categorySearchCtrl.invalid) {
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
        let res:ApiResponse<Product>;
        if(this.isNew) {
          res = await this.productService.create(params).toPromise();
        } else {
          res = await this.productService.update(this.sku, params).toPromise();
        }
        this.isProcessing = false;

        if (res.success) {
          this.snackBar.open('Saved!', 'close', {
            panelClass: ['style-success'],
          });
          this.router.navigate(['/product/' + res.data.sku]);
          dialogRef.componentInstance.isProcessing = this.isProcessing;
          dialogRef.close();
        } else {
          dialogRef.componentInstance.isProcessing = this.isProcessing;
          this.error = Array.isArray(res.message)
            ? res.message[0]
            : res.message;
          this.snackBar.open(this.error, 'close', {
            panelClass: ['style-error'],
          });
          dialogRef.close();
          if(res?.message?.toString().toLowerCase().includes("already exist")) {
            this.productForm.get("name").setErrors({
              exist: true
            })
          }
          if(res?.message?.toString().toLowerCase().includes("size must be") && res?.message?.toString().toLowerCase().includes("following values")) {
            this.productForm.get("size").setErrors({
              invalid: true
            })
          }
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

  onDeleteProduct() {
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Delete product';
    dialogData.message = 'Are you sure you want to delete this product?';
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

        const res = await this.productService.delete(this.sku).toPromise();
        if (res.success) {
          this.snackBar.open('product deleted!', 'close', {
            panelClass: ['style-success'],
          });
          this.router.navigate(['/product/']);
          this.isProcessing = false;
          dialogRef.componentInstance.isProcessing = this.isProcessing;
          dialogRef.close();
        } else {
          this.isProcessing = false;
          dialogRef.componentInstance.isProcessing = this.isProcessing;
          this.error = Array.isArray(res.message)
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

  onProductImageChanged(event) {
    this.productForm.get('updateImage').setValue(true);
    if(event && event.length > 0) {
      this.productForm.controls['productImages'].patchValue(event);
      this.productForm.controls['productImages'].markAsDirty();
      this.productForm.controls['productImages'].markAllAsTouched();
      this.productForm.controls['productImages'].updateValueAndValidity();
    } else {
      this.productForm.controls['productImages'].setValue(null);
    }
    this.productForm.markAsDirty();
    this.productForm.markAllAsTouched();
    this.productForm.updateValueAndValidity();
  }

  profilePicErrorHandler(event) {
    event.target.src = this.getDeafaultProfilePicture();
  }

  getDeafaultProfilePicture() {
    return '../../../../../assets/img/person.png';
  }
}
