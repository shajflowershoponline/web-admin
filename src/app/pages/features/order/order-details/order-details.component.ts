import { Component, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Order } from 'src/app/models/order';
import { AppConfigService } from 'src/app/services/app-config.service';
import { OrderService } from 'src/app/services/order.service';
import { StorageService } from 'src/app/services/storage.service';
import { AlertDialogModel } from 'src/app/shared/components/alert-dialog/alert-dialog-model';
import { AlertDialogComponent } from 'src/app/shared/components/alert-dialog/alert-dialog.component';
import { OrderItemComponent } from '../order-items/order-items.component';
import { OrderItemTableColumn } from 'src/app/shared/utility/table';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
  host: {
    class: 'page-component',
  },
})
export class OrderDetailsComponent {
  orderCode;
  error;
  isLoading = true;
  order: Order;
  isProcessing = false;
  @ViewChild('orderItems', { static: true}) orderItemComponent: OrderItemComponent;
  constructor(
    private readonly orderService: OrderService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
    private readonly appconfig: AppConfigService,
    private readonly storageService: StorageService,
    private readonly route: ActivatedRoute,
    public readonly router: Router,
    private readonly formBuilder: FormBuilder,
  ) {}
  ngOnInit(): void {
    this.orderCode = this.route.snapshot.paramMap.get('orderCode');
  }

  ngAfterViewInit() {
    this.initDetails();
  }

  initDetails() {
    this.isLoading = true;
    try {
      this.orderService.getByCode(this.orderCode).subscribe(res=> {
        if (res.success) {
          this.order = res.data;
          const items = this.order.orderItems.map(x=> {
            return {
              quantity: x.quantity,
              sku: x.product.sku,
              name: x.product.name,
              category: x.product.category.name,
              price: x.price,
              totalAmount: x.price,
              size:
              (Number(x.product.size) === 1 ? 'Small' : '') ||
              (Number(x.product.size) === 2 ? 'Medium' : '') ||
              (Number(x.product.size) === 3 ? 'Large' : '')
            } as OrderItemTableColumn
          });
          this.orderItemComponent.init(items);
          this.isLoading = false;
        } else {
          this.isLoading = false;
          this.error = Array.isArray(res.message) ? res.message[0] : res.message;
          this.snackBar.open(this.error, 'close', {
            panelClass: ['style-error'],
          });
          this.router.navigate(['/orders/']);
        }
      })
    } catch(ex) {
      this.error = Array.isArray(ex.message) ? ex.message[0] : ex.message;
      this.snackBar.open(this.error, 'close', {
        panelClass: ['style-error'],
      });
      this.router.navigate(['/orders/']);
      this.isLoading = false;
    }
  }

  showAction(status: "PENDING"
  | "REJECTED"
  | "PROCESSING"
  | "DELIVERY"
  | "COMPLETED"
  | "PARTIALLY-FULFILLED") {
    let show = false;
    if(this.order) {
      if(status === "PROCESSING" && this.order.status === "PENDING") {
        show = true;
      }
      if(status === "REJECTED" && this.order.status === "PENDING") {
        show = true;
      }
      if(status === "DELIVERY" && this.order.status === "PROCESSING") {
        show = true;
      }
    }
    return show;
  }

  processStatus(status: "PENDING"
  | "PROCESSING"
  | "DELIVERY") {
    const dialogData = new AlertDialogModel();
    dialogData.title = 'Confirm';
    if(status === "PROCESSING") {
      dialogData.message = 'Process order?';
    } else if(status === "DELIVERY") {
      dialogData.message = 'Mark as out for delivery?';
    } else {
      return;
    }
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
        const params = {
          status,
        } as any;
        let res = await this.orderService.updateStatus(this.orderCode, params).toPromise();
        if (res.success) {
          this.snackBar.open('Saved!', 'close', {
            panelClass: ['style-success'],
          });
          this.router.navigate(['/orders/' + this.orderCode]);
          this.isProcessing = false;
          dialogRef.componentInstance.isProcessing = this.isProcessing;
          this.initDetails();
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
