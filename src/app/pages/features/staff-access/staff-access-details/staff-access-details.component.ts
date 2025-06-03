import { Component, ElementRef, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppConfigService } from 'src/app/services/app-config.service';
import { StaffAccessService } from 'src/app/services/staff-access.service';
import { StorageService } from 'src/app/services/storage.service';
import { MyErrorStateMatcher } from 'src/app/shared/form-validation/error-state.matcher';
import { StaffAccessFormComponent } from '../staff-access-form/staff-access-form.component';
import { MatTableDataSource } from '@angular/material/table';
import { AccessPagesTableComponent } from 'src/app/shared/components/access-pages-table/access-pages-table.component';
import { AlertDialogModel } from 'src/app/shared/components/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/components/alert-dialog/alert-dialog.component';
import { AccessPages } from 'src/app/shared/models/acces-pages.model';

@Component({
  selector: 'app-staff-access-details',
  templateUrl: './staff-access-details.component.html',
  styleUrls: ['./staff-access-details.component.scss'],
  host: {
    class: "page-component"
  }
})
export class StaffAccessDetailsComponent {
  code;
  isNew = false;
  // pageAccess: Access = {
  //   view: true,
  //   modify: false,
  // };

  isReadOnly = true;

  error;
  isLoading = false;

  mediaWatcher: Subscription;
  matcher = new MyErrorStateMatcher();
  isProcessing = false;
  isLoadingRoles = false;

  @ViewChild('staffAccessForm', { static: true}) staffAccessForm: StaffAccessFormComponent;
  @ViewChild('accessPagesTable', { static: true}) accessPagesTable: AccessPagesTableComponent;


  pageAccess: AccessPages = {
    view: true,
    modify: false,
  } as any;

  constructor(
    private staffAccessService: StaffAccessService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private appconfig: AppConfigService,
    private storageService: StorageService,
    private route: ActivatedRoute,
    public router: Router,
    private formBuilder: FormBuilder
  ) {
    const { isNew, edit } = this.route.snapshot.data;
    this.isNew = isNew;
    this.code = this.route.snapshot.paramMap.get('staffAccessCode');
    this.isReadOnly = !edit && !isNew;
    if (this.route.snapshot.data) {
      this.pageAccess = {
        ...this.pageAccess,
        ...this.route.snapshot.data['access'],
      };
    }
  }

  get pageRights() {
    let rights = {};
    // for(var right of this.pageAccess.rights) {
    //   rights[right] = this.pageAccess.modify;
    // }
    return rights;
  }

  ngOnInit(): void {
    this.initDetails();
  }

  ngAfterViewInit() {
  }

  accessGridChange(event) {
    this.staffAccessForm.form.controls["accessPages"].setValue(event);
    this.staffAccessForm.form.markAllAsTouched();
    this.staffAccessForm.form.markAsDirty();
  }

  initDetails() {
    this.staffAccessService.getByCode(this.code).subscribe(res=> {
      if (res.success) {
        this.staffAccessForm.setFormValue(res.data);
        if(res.data.accessPages) {
          this.accessPagesTable.setDataSource(res.data.accessPages);
        }

        if (this.isReadOnly) {
          this.staffAccessForm.form.disable();
        }
        if(!this.pageAccess.modify ) {
          this.router.navigate(['/acess/' + this.code]);
        }
      } else {
        this.error = Array.isArray(res.message) ? res.message[0] : res.message;
        this.snackBar.open(this.error, 'close', {
          panelClass: ['style-error'],
        });
      }
    });
  }
  compareFn(accessPages1: AccessPages, accessPages2: AccessPages) {
    return accessPages1 && accessPages2 ? accessPages1.page.toUpperCase() === accessPages1.page.toUpperCase() : accessPages1 === accessPages2;
  }

  onDelete() {
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = 'Delete Staff Access?';
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
        let res = await this.staffAccessService.delete(this.code).toPromise();
        if (res.success) {
          this.snackBar.open('Saved!', 'close', {
            panelClass: ['style-success'],
          });
          this.router.navigate(['/staff-access/']);
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

  onUpdate(formData) {
    formData = {
      ...formData,
      ...this.accessPagesTable.accessPagesData
    }
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = 'Update Staff Access?';
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
        let res = await this.staffAccessService.update(this.code, formData).toPromise();
        if (res.success) {
          this.snackBar.open('Saved!', 'close', {
            panelClass: ['style-success'],
          });
          this.router.navigate(['/staff-access/' + res.data.staffAccessCode]);
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
}
