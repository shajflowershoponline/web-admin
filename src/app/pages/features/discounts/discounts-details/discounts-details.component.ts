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
import { Observable, Subscription, debounceTime, distinctUntilChanged, forkJoin, of, map, filter } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { MyErrorStateMatcher } from 'src/app/shared/form-validation/error-state.matcher';
import { getAge } from 'src/app/shared/utility/utility';
import { AlertDialogModel } from 'src/app/shared/components/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/components/alert-dialog/alert-dialog.component';
import { ImageViewerDialogComponent } from 'src/app/shared/components/image-viewer-dialog/image-viewer-dialog.component';
import { CategoryService } from 'src/app/services/category.service';
import { DiscountsService } from 'src/app/services/discounts.service';
import { ApiResponse } from 'src/app/shared/models/api-response.model';
import { Discounts } from 'src/app/models/discounts';
import { ImageUploadDialogComponent } from 'src/app/shared/components/image-upload-dialog/image-upload-dialog.component';

@Component({
  selector: 'app-discounts-details',
  templateUrl: './discounts-details.component.html',
  styleUrls: ['./discounts-details.component.scss'],
  host: {
    class: 'page-component',
  },
})
export class DiscountsDetailsComponent implements OnInit {
  discountId;
  isNew = false;
  isReadOnly = true;
  error;
  isLoading = true;
  discountForm: FormGroup = new FormGroup({
    discountId: new FormControl(),
    promoCode: new FormControl(null, [Validators.required]),
    description: new FormControl(null, [Validators.required]),
    type: new FormControl(null, [Validators.required]),
    value: new FormControl(null, [Validators.required, Validators.min(1)]),
  }
  );
  mediaWatcher: Subscription;
  matcher = new MyErrorStateMatcher();
  isProcessing = false;
  isLoadingRoles = false;
  maxDate = moment(new Date().getFullYear() - 18).format('YYYY-MM-DD');

  categorySearchCtrl = new FormControl()
  isOptionsCategoryLoading = false;
  optionsCategory: { name: string; code: string }[] = [];
  @ViewChild('categorySearchInput', { static: true }) categorySearchInput: ElementRef<HTMLInputElement>;


  discounts: Discounts;
  discountsThumbnailSource: any;
  discountsThumbnail;
  discountsThumbnailLoaded = false;

  constructor(
    private discountsService: DiscountsService,
    private categoryService: CategoryService,
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
    this.discountId = this.route.snapshot.paramMap.get('discountId');
    this.isReadOnly = !edit && !isNew;
    this.discounts = {
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
    return this.discountForm.controls;
  }
  get formIsValid() {
    return this.discountForm.valid;
  }
  get formIsReady() {
    return this.discountForm.valid && this.discountForm.dirty;
  }
  get formData() {
    const data = this.discountForm.value;
    data.value = data?.value?.toString();
    data.thumbnailFile = this.discountsThumbnail;
    return data;
  }

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    if (!this.isNew) {
      await this.initDetails();
    }
    this.isLoading = false;
  }

  async initDetails() {
    try {
      this.discountsService.getByCode(this.discountId).subscribe(res => {
        if (res.success) {
          this.discounts = res.data;
          this.discountForm.patchValue({
            discountId: res.data.discountId,
            promoCode: res.data.promoCode,
            description: res.data.description,
            type: res.data.type,
            value: res.data.value,
          });
          this.discountForm.updateValueAndValidity();
          console.log(this.discountForm.value?.productImages)
          if (this.isReadOnly) {
            this.discountForm.disable();
            this.categorySearchCtrl.disable();
          }
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
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

  getError(key: string) {
    return this.f[key].errors;
  }

  onSubmit() {
    if (this.discountForm.invalid || this.categorySearchCtrl.invalid) {
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
        let res: ApiResponse<Discounts>;
        if (this.isNew) {
          res = await this.discountsService.create(params).toPromise();
        } else {
          res = await this.discountsService.update(this.discountId, params).toPromise();
        }
        this.isProcessing = false;

        if (res.success) {
          this.snackBar.open('Saved!', 'close', {
            panelClass: ['style-success'],
          });
          this.router.navigate(['/discounts/' + res.data.discountId]);
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
          if (res?.message?.toString().toLowerCase().includes("already exist")) {
            this.discountForm.get("name").setErrors({
              exist: true
            })
          }
          if (res?.message?.toString().toLowerCase().includes("size must be") && res?.message?.toString().toLowerCase().includes("following values")) {
            this.discountForm.get("size").setErrors({
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

  onDeleteDiscounts() {
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Delete discounts';
    dialogData.message = 'Are you sure you want to delete this discounts?';
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

        const res = await this.discountsService.delete(this.discountId).toPromise();
        if (res.success) {
          this.snackBar.open('Gift Add Ons deleted!', 'close', {
            panelClass: ['style-success'],
          });
          this.router.navigate(['/discounts/']);
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

  onShowChangeThumbnail() {
    const dialogRef = this.dialog.open(ImageUploadDialogComponent, {
      disableClose: true,
      panelClass: "image-upload-dialog"
    });
    dialogRef.componentInstance.showCropper = false;
    dialogRef.componentInstance.showWebCam = false;
    dialogRef.componentInstance.doneSelect.subscribe(res => {
      this.discountsThumbnailLoaded = false;
      this.discounts.thumbnailFile = {
        url: res.base64
      };
      this.discountForm.markAsDirty();
      this.discountForm.markAllAsTouched();
      dialogRef.close();

      this.discountsThumbnail = {
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
      this.discountsThumbnailLoaded = false;
      this.discountsThumbnailSource = res.base64;
      dialogRef.close();

      this.discountsThumbnail = {
        fileName: `${moment().format("YYYY-MM-DD-hh-mm-ss")}.png`,
        data: res.base64.toString().split(',')[1]
      };
    })
  }

  pictureErrorHandler(event) {
    event.target.src = this.getDeafaultPicture();
  }

  getDeafaultPicture() {
    return '../../../../../assets/img/thumbnail-discount.png';
  }
}
