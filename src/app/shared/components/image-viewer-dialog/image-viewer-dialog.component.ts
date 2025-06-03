import { Component, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ImageUploadDialogComponent } from '../image-upload-dialog/image-upload-dialog.component';
import { StorageService } from 'src/app/services/storage.service';
import { Router } from '@angular/router';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { StaffUser } from 'src/app/models/staff-user';

@Component({
  selector: 'app-image-viewer-dialog',
  templateUrl: './image-viewer-dialog.component.html',
  styleUrls: ['./image-viewer-dialog.component.scss']
})
export class ImageViewerDialogComponent {
  imageSource;
  imageError = false;
  canChange = false;
  staffUser: StaffUser;
  changed = new EventEmitter<ImageCroppedEvent>();
  constructor(
    private storageService: StorageService,
    public router: Router,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<ImageViewerDialogComponent>) {
      this.staffUser = this.storageService.getLoginProfile();
      if(!this.staffUser || !this.staffUser.staffUserCode || !this.staffUser.staffUserId) {
        this.router.navigate(['/auth/']);
      }
  }
  onChange() {
    const dialogRef = this.dialog.open(ImageUploadDialogComponent, {
        disableClose: true,
        panelClass: "image-upload-dialog"
    });
    dialogRef.componentInstance.doneSelect.subscribe(res=> {
      this.imageSource = res.objectUrl;
      dialogRef.close();
      this.changed.emit(res);
    })
  }

  profilePicErrorHandler(event) {
    this.imageError = true;
    event.target.src = '../../../assets/img/thumbnail.png';
  }
  close() {
    this.dialogRef.close();
  }
}
