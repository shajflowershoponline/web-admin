import { Component, ElementRef, Input, Output, TemplateRef, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/services/order.service';
import { ProductService } from 'src/app/services/product.service';
import { MyErrorStateMatcher } from 'src/app/shared/form-validation/error-state.matcher';
import { OrderItemTableColumn } from 'src/app/shared/utility/table';

@Component({
  selector: 'app-order-items',
  templateUrl: './order-items.component.html',
  styleUrls: ['./order-items.component.scss']
})
export class OrderItemComponent {
  id;
  isProcessing = false;
  isNew = false;
  accTotalAmount = 0;
  displayedColumns = ['name', 'category', 'size', 'price', 'quantity', 'totalAmount'];
  dataSource = new MatTableDataSource<OrderItemTableColumn>();
  @Input() order!: Order;
  @Input() isReadOnly = true;

  error;

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,) {
  }

  ngAfterViewInit() {
  }

  init(data: OrderItemTableColumn[]) {
    if(data) {
      this.dataSource = new MatTableDataSource(data);
      this.accTotalAmount = this.dataSource.data.map(x=>Number(x.totalAmount??0)).reduce((curr, prev) => {
        return Number(curr) + Number(prev);
      });
    }
  }

  toNumber(value: any = "0") {
    return isNaN(Number(value ? value.toString() : "0")) ? 0 : Number(value.toString());
  }

}
