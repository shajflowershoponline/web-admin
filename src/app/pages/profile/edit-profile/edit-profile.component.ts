import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { StaffUser } from 'src/app/models/staff-user';
import { AppConfigService } from 'src/app/services/app-config.service';
import { AuthService } from 'src/app/services/auth.service';
import { StaffUserService } from 'src/app/services/staff-user.service';
import { StorageService } from 'src/app/services/storage.service';
import { AlertDialogModel } from 'src/app/shared/components/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/components/alert-dialog/alert-dialog.component';
import { ImageUploadDialogComponent } from 'src/app/shared/components/image-upload-dialog/image-upload-dialog.component';
import { ImageViewerDialogComponent } from 'src/app/shared/components/image-viewer-dialog/image-viewer-dialog.component';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  host: {
    class: "page-component"
  }
})
export class EditProfileComponent {
  currentUserCode;
  isNew = false;

  isReadOnly = true;

  error;
  isLoading = true;

  profileForm: FormGroup;
  mediaWatcher: Subscription;
  isProcessing = false;
  isLoadingRoles = false;
  maxDate = moment(new Date().getFullYear() - 18).format('YYYY-MM-DD');

  staffUser: StaffUser;
  staffUserProfilePicSource: any;
  staffUserProfilePic;
  staffUserProfilePicLoaded = false;
  constructor(
    private staffUserService: StaffUserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private appconfig: AppConfigService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    public router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
  ) {
    this.staffUser = this.storageService.getLoginProfile();
    if(!this.staffUser || !this.staffUser.staffUserCode || !this.staffUser.staffUserId) {
      this.router.navigate(['/auth/']);
    }
    // if(this.staffUser.userProfilePic?.file?.url) {
    //   this.staffUserProfilePicSource = this.staffUser.userProfilePic?.file?.url;
    // }
    this.currentUserCode = this.staffUser.staffUserCode;
  }

  get f() {
    return this.profileForm.controls;
  }
  get formIsValid() {
    return this.profileForm.valid;
  }
  get formIsReady() {
    return this.profileForm.valid && this.profileForm.dirty;
  }
  get formData() {
    return this.profileForm.value;
    // return {
    //   ...this.profileForm.value,
    //   userProfilePic: this.staffUserProfilePic,
    // }
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.profileForm = this.formBuilder.group(
      {
        name: [
          this.staffUser.name,
          [Validators.required, Validators.pattern('^[a-zA-Z0-9\\-\\s]+$')],
        ],
        userName: [
          this.staffUser.userName,
          [
            Validators.required,
          ],
        ],
      }
    );
    this.profileForm.markAllAsTouched();
  }

  getError(key: string) {
    return this.f[key].errors;
  }

  onShowImageViewer() {
    const dialogRef = this.dialog.open(ImageViewerDialogComponent, {
        disableClose: true,
        panelClass: "image-viewer-dialog"
    });
    dialogRef.componentInstance.imageSource = this.staffUserProfilePicSource;
    dialogRef.componentInstance.canChange = true;

    dialogRef.componentInstance.changed.subscribe(res=> {
      this.staffUserProfilePicLoaded = false;
      this.staffUserProfilePicSource = res.base64;
      dialogRef.close();

      this.staffUserProfilePic = {
        fileName: `${moment().format("YYYY-MM-DD-hh-mm-ss")}.png`,
        data: res.base64.toString().split(',')[1]
      };
    })
  }

  onChangeProfile() {
    const dialogRef = this.dialog.open(ImageUploadDialogComponent, {
        disableClose: true,
        panelClass: "image-upload-dialog"
    });
    dialogRef.componentInstance.showCropper = false;
    dialogRef.componentInstance.showWebCam = false;
    dialogRef.componentInstance.doneSelect.subscribe(res=> {
      this.staffUserProfilePicLoaded = false;
      this.staffUserProfilePicSource = res.base64;
      dialogRef.close();

      this.staffUserProfilePic = {
        fileName: `${moment().format("YYYY-MM-DD-hh-mm-ss")}.png`,
        data: res.base64.toString().split(',')[1]
      };
    })
  }


  onSubmitUpdateProfile() {
    if (!this.profileForm.valid) {
      return;
    }

    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = 'Update profile?';
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
        const res = await this.staffUserService.updateProfile(this.currentUserCode, params).toPromise();
        if (res.success) {
          this.snackBar.open('Saved!', 'close', {
            panelClass: ['style-success'],
          });
          this.isProcessing = false;
          dialogRef.componentInstance.isProcessing = this.isProcessing;
          dialogRef.close();
          this.profileForm.markAsPristine();
          this.staffUser.name = this.formData.name;
          this.staffUser.userName = this.formData.email;
          // this.staffUser.userProfilePic = res.data.userProfilePic;
          this.storageService.saveLoginProfile(this.staffUser);
          window.location.reload();
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
    return '../../../../assets/img/person.png';
  }
}
