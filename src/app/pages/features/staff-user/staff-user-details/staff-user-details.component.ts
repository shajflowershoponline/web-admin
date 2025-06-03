import { StaffUserService } from 'src/app/services/staff-user.service';
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
import { AccessPagesTableComponent } from 'src/app/shared/components/access-pages-table/access-pages-table.component';
import { AlertDialogModel } from 'src/app/shared/components/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/components/alert-dialog/alert-dialog.component';
import { ImageViewerDialogComponent } from 'src/app/shared/components/image-viewer-dialog/image-viewer-dialog.component';
import { StaffUser } from 'src/app/models/staff-user';
import { StaffUserChangePasswordComponent } from './staff-change-password/staff-user-change-password.component';
import { StaffAccessService } from 'src/app/services/staff-access.service';

@Component({
  selector: 'app-staff-user-details',
  templateUrl: './staff-user-details.component.html',
  styleUrls: ['./staff-user-details.component.scss'],
  host: {
    class: 'page-component',
  },
})
export class StaffUserDetailsComponent implements OnInit {
  currentUserCode;
  staffUserCode;
  isNew = false;
  isReadOnly = true;

  error;
  isLoading = true;

  staffUserForm: FormGroup;
  mediaWatcher: Subscription;
  matcher = new MyErrorStateMatcher();
  isProcessing = false;
  isLoadingRoles = false;
  maxDate = moment(new Date().getFullYear() - 18).format('YYYY-MM-DD');

  staffAccessSearchCtrl = new FormControl()
  isOptionsAccessLoading = false;
  optionsAccess: { name: string; code: string}[] = [];
  @ViewChild('accessPagesTable', { static: true}) accessPagesTable: AccessPagesTableComponent;
  @ViewChild('staffAccessSearchInput', { static: true}) staffAccessSearchInput: ElementRef<HTMLInputElement>;

  user: StaffUser;
  userProfilePicSource: any;
  userProfilePic;
  userProfilePicLoaded = false;

  constructor(
    private staffUserService: StaffUserService,
    private staffAccessService: StaffAccessService,
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
    this.staffUserCode = this.route.snapshot.paramMap.get('staffUserCode');
    const profile = this.storageService.getLoginProfile();
    this.currentUserCode = profile["staffUserCode"];
    this.isReadOnly = !edit && !isNew;
    if(!isNew && edit && edit !== undefined && this.currentUserCode ===this.staffUserCode) {
      this.router.navigate(['/staff-user/' + this.staffUserCode]);
    }
    if (this.route.snapshot.data) {
      // this.pageAccess = {
      //   ...this.pageAccess,
      //   ...this.route.snapshot.data['access'],
      // };
    }
  }

  get pageRights() {
    let rights = {};
    // for(var right of this.pageAccess.rights) {
    //   rights[right] = this.pageAccess.modify;
    // }
    return rights;
  }

  get f() {
    return this.staffUserForm.controls;
  }
  get formIsValid() {
    return this.staffUserForm.valid && this.staffAccessSearchCtrl.valid;
  }
  get formIsReady() {
    return (this.staffUserForm.valid && this.staffAccessSearchCtrl.valid) && (this.staffUserForm.dirty || this.staffAccessSearchCtrl.dirty);
  }
  get formData() {
    return this.staffUserForm.value;
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.initDetails();
  }

  async initDetails() {
    try {
      if (this.isNew) {
        this.staffUserForm = this.formBuilder.group(
          {
            name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9\\-\\s]+$')]),
            userName: new FormControl(
              '',
              [
                Validators.required,
              ]),
            password: new FormControl(
              '',
              [
                Validators.minLength(6),
                Validators.maxLength(16),
                Validators.required,
              ]),
            confirmPassword: new FormControl(),
            staffAccessCode: new FormControl(),
          },
          { validators: this.checkPasswords }
        );
        this.isLoading = false;
      } else {
        this.staffUserForm = this.formBuilder.group({
          name: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9\\-\\s]+$')]),
          userName: new FormControl(
            '',
            [
              Validators.required,
            ]),
            staffAccessCode: new FormControl(),
        });


        forkJoin([
          this.staffUserService.getByCode(this.staffUserCode).toPromise(),
          this.staffAccessService.getByAdvanceSearch({
          order: {},
          columnDef: [],
          pageIndex: 0,
          pageSize: 10
        })
        ]).subscribe(([user, accessOptions])=> {
          if(accessOptions.success) {
            this.optionsAccess = accessOptions.data.results.map(x=> {
              return { name: x.name, code: x.staffAccessCode }
            });
          }
          if (user.success) {
            this.user = user.data;
            this.staffUserForm.patchValue({
              name: user.data.name,
              userName: user.data.userName,
              accessCode: user.data.staffAccess?.staffAccessCode,
            });
            this.staffUserForm.updateValueAndValidity();
            if(user.data.staffAccess?.accessPages) {
              this.accessPagesTable.setDataSource(user.data.staffAccess?.accessPages);
            }
            if (this.isReadOnly) {
              this.staffUserForm.disable();
              this.staffAccessSearchCtrl.disable();
            }
            this.staffAccessSearchCtrl.setValue(user.data.staffAccess?.staffAccessCode);
            this.isLoading = false;
          } else {
            this.isLoading = false;
            this.error = Array.isArray(user.message) ? user.message[0] : user.message;
            this.snackBar.open(this.error, 'close', {
              panelClass: ['style-error'],
            });
          }
        });
      }
      this.f['staffAccessCode'].valueChanges.subscribe(async res=> {
        // this.spinner.show();
        const staffAccess = await this.staffAccessService.getByCode(res).toPromise();
        if(staffAccess.data && staffAccess.data.accessPages) {
          this.accessPagesTable.setDataSource(staffAccess.data.accessPages)
        }
        // this.spinner.hide();
      })
      this.staffAccessSearchCtrl.valueChanges
      .pipe(
          debounceTime(2000),
          distinctUntilChanged()
      )
      .subscribe(async value => {
          await this.initAccessOptions();
      });
      await this.initAccessOptions();
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
      this.userProfilePicLoaded = false;
      this.userProfilePicSource = res.base64;
      dialogRef.close();

      this.userProfilePic = {
        fileName: `${moment().format("YYYY-MM-DD-hh-mm-ss")}.png`,
        data: res.base64.toString().split(',')[1]
      };
    })
  }

  async initAccessOptions() {
    this.isOptionsAccessLoading = true;
    const res = await this.staffAccessService.getByAdvanceSearch({
      order: {},
      columnDef: [{
        apiNotation: "name",
        filter: this.staffAccessSearchInput.nativeElement.value
      }],
      pageIndex: 0,
      pageSize: 10
    }).toPromise();
    this.optionsAccess = res.data.results.map(a=> { return { name: a.name, code: a.staffAccessCode }});
    this.mapSearchAccess();
    this.isOptionsAccessLoading = false;
  }

  displayAccessName(value?: number) {
    return value ? this.optionsAccess.find(_ => _.code === value?.toString())?.name : undefined;
  }

  mapSearchAccess() {
    if(this.f['staffAccessCode'].value !== this.staffAccessSearchCtrl.value) {
      this.f['staffAccessCode'].setErrors({ required: true});
      const selected = this.optionsAccess.find(x=>x.code === this.staffAccessSearchCtrl.value);
      if(selected) {
        this.f["staffAccessCode"].setValue(selected.code);
      } else {
        this.f["staffAccessCode"].setValue(null);
      }
      if(!this.f["staffAccessCode"].value) {
        this.f["staffAccessCode"].setErrors({required: true});
      } else {
        this.f['staffAccessCode'].setErrors(null);
        this.f['staffAccessCode'].markAsPristine();
      }
    }
    this.staffAccessSearchCtrl.setErrors(this.f["staffAccessCode"].errors);
  }

  getError(key: string) {
    if (key === 'confirmPassword') {
      this.formData.confirmPassword !== this.formData.password
        ? this.f[key].setErrors({ notMatched: true })
        : this.f[key].setErrors(null);
    }
    return this.f[key].errors;
  }

  checkPasswords: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const pass = group.get('password').value;
    const confirmPass = group.get('confirmPassword').value;
    return pass === confirmPass ? null : { notMatched: true };
  };

  onSubmit() {
    if (this.staffUserForm.invalid || this.staffAccessSearchCtrl.invalid) {
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
        let res;
        if(this.isNew) {
          res = await this.staffUserService.create(params).toPromise();
        } else {
          res = await this.staffUserService.update(this.staffUserCode, params).toPromise();
        }

        if (res.success) {
          this.snackBar.open('Saved!', 'close', {
            panelClass: ['style-success'],
          });
          this.router.navigate(['/staff-user/' + res.data.staffUserCode]);
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

  openChangePasswordDialog() {
    const dialogRef = this.dialog.open(StaffUserChangePasswordComponent, {
      maxWidth: '720px',
      width: '720px',
      disableClose: true,
    });
    dialogRef.componentInstance.staffUserCode = this.staffUserCode;
  }

  onDeleteUser() {
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Delete User';
    dialogData.message = 'Are you sure you want to delete this user?';
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

        const res = await this.staffUserService.delete(this.staffUserCode).toPromise();
        if (res.success) {
          this.snackBar.open('User deleted!', 'close', {
            panelClass: ['style-success'],
          });
          this.router.navigate(['/staff-user/']);
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

  profilePicErrorHandler(event) {
    event.target.src = this.getDeafaultProfilePicture();
  }

  getDeafaultProfilePicture() {
    return '../../../../../assets/img/person.png';
  }
}
