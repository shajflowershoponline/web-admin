import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StaffUserService } from 'src/app/services/staff-user.service';
import { AlertDialogModel } from 'src/app/shared/components/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/components/alert-dialog/alert-dialog.component';
import { MyErrorStateMatcher } from 'src/app/shared/form-validation/error-state.matcher';

@Component({
  selector: 'app-staff-user-change-password',
  templateUrl: './staff-user-change-password.component.html',
  styleUrls: ['./staff-user-change-password.component.scss']
})
export class StaffUserChangePasswordComponent {
  isProcessing = false;
  error;
  staffUserChangePasswordForm: FormGroup;
  staffUserCode;
  matcher = new MyErrorStateMatcher();
  constructor(
    private formBuilder: FormBuilder,
    private staffUserService: StaffUserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    public dialogRef: MatDialogRef<StaffUserChangePasswordComponent>) {

    }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

    this.staffUserChangePasswordForm = this.formBuilder.group(
      {
        password: [
          '',
          [
            Validators.minLength(6),
            Validators.maxLength(16),
            Validators.required,
          ],
        ],
        confirmPassword: '',
      },
      { validators: this.checkPasswords }
    );
  }

  checkPasswords: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const pass = group.get('password').value;
    const confirmPass = group.get('confirmPassword').value;
    return pass === confirmPass ? null : { notMatched: true };
  };

  get f() {
    return this.staffUserChangePasswordForm.controls;
  }
  get formIsValid() {
    return this.staffUserChangePasswordForm.valid;
  }
  get formIsReady() {
    return this.staffUserChangePasswordForm.valid && this.staffUserChangePasswordForm.dirty;
  }
  get formData() {
    return this.staffUserChangePasswordForm.value;
  }

  getError(key: string) {
    if (key === 'confirmPassword') {
      this.formData.confirmPassword !== this.formData.password
        ? this.f[key].setErrors({ notMatched: true })
        : this.f[key].setErrors(null);
    }
    return this.f[key].errors;
  }

  onSubmitChangePassword() {
    if (this.staffUserChangePasswordForm.invalid || this.staffUserChangePasswordForm.invalid) {
      return;
    }

    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    dialogData.message = 'Update user password?';
    dialogData.confirmButton = {
      visible: true,
      text: 'Yes, Update now',
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
        // const params = this.formData;
        // this.isProcessing = true;
        // const res = await this.staffUserService.updateUserPassword(this.staffUserCode, params).toPromise();

        // if (res.success) {
        //   this.snackBar.open('Password updated!', 'close', {
        //     panelClass: ['style-success'],
        //   });
        //   this.isProcessing = false;
        //   dialogRef.componentInstance.isProcessing = this.isProcessing;
        //   dialogRef.close();
        //   this.dialogRef.close();
        // } else {
        //   this.isProcessing = false;
        //   dialogRef.componentInstance.isProcessing = this.isProcessing;
        //   this.error = Array.isArray(res.message)
        //     ? res.message[0]
        //     : res.message;
        //   this.snackBar.open(this.error, 'close', {
        //     panelClass: ['style-error'],
        //   });
        //   dialogRef.close();
        // }
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
