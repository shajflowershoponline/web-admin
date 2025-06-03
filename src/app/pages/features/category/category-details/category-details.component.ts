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
import { Observable, Subscription, debounceTime, distinctUntilChanged, forkJoin, of, map } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';
import { MyErrorStateMatcher } from 'src/app/shared/form-validation/error-state.matcher';
import { getAge } from 'src/app/shared/utility/utility';
import { AlertDialogModel } from 'src/app/shared/components/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/components/alert-dialog/alert-dialog.component';
import { ImageViewerDialogComponent } from 'src/app/shared/components/image-viewer-dialog/image-viewer-dialog.component';
import { Category } from 'src/app/models/category';
import { CategoryService } from 'src/app/services/category.service';
import { ApiResponse } from 'src/app/shared/models/api-response.model';
import { ImageUploadDialogComponent } from 'src/app/shared/components/image-upload-dialog/image-upload-dialog.component';

@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.scss'],
  host: {
    class: 'page-component',
  },
})
export class CategoryDetailsComponent implements OnInit {
  categoryId;
  isNew = false;
  isReadOnly = true;
  error;
  isLoading = true;
  categoryForm: FormGroup = new FormGroup({
    sequenceId: new FormControl(null, [Validators.required]),
    name: new FormControl(null, [Validators.required]),
    desc: new FormControl(null, [ Validators.required]),
  }
);
  mediaWatcher: Subscription;
  matcher = new MyErrorStateMatcher();
  isProcessing = false;
  isLoadingRoles = false;
  maxDate = moment(new Date().getFullYear() - 18).format('YYYY-MM-DD');

  category: Category;
  categoryThumbnailSource: any;
  categoryThumbnail;
  categoryThumbnailLoaded = false;

  constructor(
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
    this.categoryId = this.route.snapshot.paramMap.get('categoryId');
    this.isReadOnly = !edit && !isNew;
    this.category = {
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
    return this.categoryForm.controls;
  }
  get formIsValid() {
    return this.categoryForm.valid;
  }
  get formIsReady() {
    return this.categoryForm.valid && this.categoryForm.dirty;
  }
  get formData() {
    const data = this.categoryForm.value;
    data.sequenceId = data?.sequenceId?.toString();
    data.thumbnailFile = this.categoryThumbnail;
    return data;
  }

  async ngOnInit(): Promise<void> {
    if(!this.isNew) {
      this.isLoading = true;
      await this.initDetails();
      this.isLoading = false;
    }
  }

  async initDetails() {
    try {
      forkJoin([
        this.categoryService.getByCode(this.categoryId).toPromise(),
        this.categoryService.getAdvanceSearch({
          keywords: "",
            order: {
              "name": "ASC"
            } as any,
          pageIndex: 0,
          pageSize: 10
      })
      ]).subscribe(([category])=> {
        if (category.success) {
          this.category = category.data;
          this.categoryForm.patchValue({
            sequenceId: category.data.sequenceId,
            name: category.data.name,
            desc: category.data.desc
          });
          this.categoryForm.updateValueAndValidity();
          if (this.isReadOnly) {
            this.categoryForm.disable();
          }
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.error = Array.isArray(category.message) ? category.message[0] : category.message;
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

  getError(key: string) {
    return this.f[key].errors;
  }


  onSubmit() {
    if (this.categoryForm.invalid) {
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
        let res:ApiResponse<Category>;
        if(this.isNew) {
          res = await this.categoryService.create(params).toPromise();
        } else {
          res = await this.categoryService.update(this.categoryId, params).toPromise();
        }
        this.isProcessing = false;

        if (res.success) {
          this.snackBar.open('Saved!', 'close', {
            panelClass: ['style-success'],
          });
          this.router.navigate(['/category/' + res.data.categoryId]);
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
          if(res?.message?.toString().toLowerCase().includes("name") && res?.message?.toString().toLowerCase().includes("already exist")) {
            this.categoryForm.get("name").setErrors({
              exist: true
            })
          }
          if(res?.message?.toString().toLowerCase().includes("sequence") && res?.message?.toString().toLowerCase().includes("must be a number string")) {
            this.categoryForm.get("sequenceId").setErrors({
              invalid: true
            })
          }
          if(res?.message?.toString().toLowerCase().includes("sequence") && res?.message?.toString().toLowerCase().includes("already exist")) {
            this.categoryForm.get("sequenceId").setErrors({
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

  onDeleteCategory() {
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Delete category';
    dialogData.message = 'Are you sure you want to delete this category?';
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

        const res = await this.categoryService.delete(this.categoryId).toPromise();
        if (res.success) {
          this.snackBar.open('category deleted!', 'close', {
            panelClass: ['style-success'],
          });
          this.router.navigate(['/category/']);
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
    dialogRef.componentInstance.doneSelect.subscribe(res=> {
      this.categoryThumbnailLoaded = false;
      this.category.thumbnailFile = {
        url: res.base64
      };
      this.categoryForm.markAsDirty();
      this.categoryForm.markAllAsTouched();
      dialogRef.close();

      this.categoryThumbnail = {
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

    dialogRef.componentInstance.changed.subscribe(res=> {
      this.categoryThumbnailLoaded = false;
      this.categoryThumbnailSource = res.base64;
      dialogRef.close();

      this.categoryThumbnail = {
        fileName: `${moment().format("YYYY-MM-DD-hh-mm-ss")}.png`,
        data: res.base64.toString().split(',')[1]
      };
    })
  }

  pictureErrorHandler(event) {
    event.target.src = this.getDeafaultPicture();
  }

  getDeafaultPicture() {
    return '../../../../../assets/img/thumbnail-category.png';
  }
}
