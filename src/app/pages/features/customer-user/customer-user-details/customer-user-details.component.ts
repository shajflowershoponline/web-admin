import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { CustomerUser } from 'src/app/models/customer-user';
import { AppConfigService } from 'src/app/services/app-config.service';
import { AuthService } from 'src/app/services/auth.service';
import { CustomerUserService } from 'src/app/services/customer-user.service';
import { StorageService } from 'src/app/services/storage.service';
import { AlertDialogModel } from 'src/app/shared/components/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/components/alert-dialog/alert-dialog.component';
import { ImageUploadDialogComponent } from 'src/app/shared/components/image-upload-dialog/image-upload-dialog.component';
import { ImageViewerDialogComponent } from 'src/app/shared/components/image-viewer-dialog/image-viewer-dialog.component';

@Component({
  selector: 'app-customer-user-details',
  templateUrl: './customer-user-details.component.html',
  styleUrl: './customer-user-details.component.scss',
  host: {
    class: "page-component"
  }
})
export class CustomerUserDetailsComponent {
  customerUserCode;
  error;
  isLoading = true;
  mediaWatcher: Subscription;
  maxDate = moment(new Date().getFullYear() - 18).format('YYYY-MM-DD');
  customerUser: CustomerUser;
  customerUserProfilePicSource: any;
  customerUserProfilePic;
  customerUserProfilePicLoaded = false;
  constructor(
    private customerUserService: CustomerUserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private appconfig: AppConfigService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    public router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
  ) {
    this.customerUserCode = this.route.snapshot.paramMap.get('customerUserCode');
    // if(this.customerUser.userProfilePic?.file?.url) {
    //   this.customerUserProfilePicSource = this.customerUser.userProfilePic?.file?.url;
    // }
    this.initDetails();
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
  }

  initDetails() {
    this.isLoading = true;
    try {

      this.customerUserService.getByCode(this.customerUserCode).subscribe(res=> {
        this.isLoading = false;
        if (res.success) {
          this.customerUser = res.data;
        } else {
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.open(this.error, 'close', {
            panelClass: ['style-error'],
          });
        }
      }, (error)=> {
        this.isLoading = false;
        this.error = Array.isArray(error.message) ? error.message[0] : error.message;
        this.snackBar.open(this.error, 'close', {
          panelClass: ['style-error'],
        });
      });

    } catch(ex) {
      this.isLoading = false;
      this.error = Array.isArray(ex.message) ? ex.message[0] : ex.message;
      this.snackBar.open(this.error, 'close', {
        panelClass: ['style-error'],
      });
    }
  }

  profilePicErrorHandler(event) {
    event.target.src = this.getDeafaultProfilePicture();
  }

  getDeafaultProfilePicture() {
    return '../../../../assets/img/person.png';
  }
}
