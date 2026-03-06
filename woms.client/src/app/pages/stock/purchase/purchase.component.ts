import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Detail, ViPurchaseModel } from '@core_models/stock/purchase/purchase.model';
import { PurchaseService } from '@core_services/stock/purchase.service';
import { ExportService } from '@shared_services/export.service';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { EntryComponent } from './entry/entry.component';
import { UpdatePurchaseModel } from '@core_models/stock/purchase/update-purchase.model';
import { DatePicker } from 'primeng/datepicker';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-purchase',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // primeNg
    ToastModule,
    ButtonModule,
    SplitButtonModule,
    ToggleSwitchModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    TagModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    DatePicker,
    ChipModule,

    EntryComponent
  ],
  standalone: true,
  providers: [ExportService, DatePipe],
  templateUrl: './purchase.component.html',
})
export class PurchaseComponent implements OnInit {
  purchases: ViPurchaseModel[] = [];
  selectedPurchase!: ViPurchaseModel;

  purchaseDetails: Detail[] = [];
  selectedPurchaseDetail!: Detail;

  items!: MenuItem[] | undefined;

  loading: boolean = false;
  isSubmitting: boolean = false;
  isEdit: boolean = false;
  modalVisible: boolean = false;
  PaymentVisible: boolean = false;
  showDeleteDialog: boolean = false;
  remark: string = '';

  expandedRows = {};
  startDate: Date = new Date();
  endDate: Date = new Date();

  constructor(
    private purchaseService: PurchaseService,
    private messageService: MessageService,
    private loggerService: LoggerService,
    private shareService: SharedService,
    private exportService: ExportService,
    private route: Router,
    private datePipe: DatePipe,
  ) {
    this.items = [
      {
        label: 'Payment',
        icon: 'pi pi-pen-to-square',
        command: () => this.update(),
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.delete(),
      },
      {
        label: 'Excel',
        icon: 'pi pi-file-excel',
        command: () => this.excel(),
      },
    ];
  }

  private formBuilder = inject(FormBuilder);
  public purchaseForm: FormGroup = this.formBuilder.group({
    purchaseVno: [{ value: '', disabled: true }],
    totalAmount: [{ value: 0, disabled: true }],
    discountAmount: [{ value: 0, disabled: true }],
    netAmount: [{ value: 0, disabled: true }],
    payAmount: [0, [Validators.required, Validators.min(0)]],
    leftAmount: [{ value: 0, disabled: true }],
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    let branchId: number = Number.parseInt((this.shareService.getDefaultBranchId() ?? "0"));
    this.loading = true;
    const start = this.startDate ?? new Date();
    const end = this.endDate ?? new Date();

    const sdate = this.datePipe.transform(start, 'yyyy-MM-dd') ?? '';
    const edate = this.datePipe.transform(end, 'yyyy-MM-dd') ?? '';

    this.purchaseService.get(branchId, sdate, edate).subscribe({
      next: (res) => {
        this.purchases = res.data as ViPurchaseModel[];
        this.loading = false;
        this.loggerService.info(this.purchases);
      },
      error: () => { },
      complete: () => {
        this.loading = false;
      },
    });
  }

  onEndDateChange(date: Date): void {
    this.endDate = date;

    if (!this.startDate || this.startDate > this.endDate) {
      this.startDate = new Date(this.endDate);
    }
  }

  create(): void {
    this.route.navigate(['/stock/purchases/entry']);
  }

  update(): void {
    this.isEdit = true;
    this.purchaseForm.reset();

    if (!this.selectedPurchase) {
      this.PaymentVisible = false;
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please choose a voucher.',
      });
      return;
    }

    if (this.selectedPurchase.leftAmount === 0) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'info',
        summary: 'Info',
        detail: 'This voucher is already fully paid.',
      });
      this.PaymentVisible = false;
      return;
    }

    this.loggerService.info(this.selectedPurchase);

    this.purchaseForm.controls['purchaseVno'].setValue(
      this.selectedPurchase.purchaseVno,
    );
    this.purchaseForm.controls['totalAmount'].setValue(
      this.selectedPurchase.totalAmount,
    );
    this.purchaseForm.controls['discountAmount'].setValue(
      this.selectedPurchase.discountAmount
    );
    this.purchaseForm.controls['netAmount'].setValue(
      this.selectedPurchase.netAmount,
    );
    this.purchaseForm.controls['leftAmount'].setValue(
      this.selectedPurchase.leftAmount
    );

    this.PaymentVisible = true;
  }

  delete(): void {
    if (this.selectedPurchase != null) {
      this.showDeleteDialog = true;
    } else {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please choose a purchase to delete.',
      });
    }
  }

  confirmDelete(): void {
    if (!this.remark.trim()) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Remark required',
        detail: 'Please enter a remark before deleting.',
      });
      return;
    }

    this.loading = true;
    this.purchaseService
      .delete(this.selectedPurchase.purchaseVno.toString(), this.remark)
      .subscribe({
        next: (res) => {
          this.messageService.add({
            key: 'globalMessage',
            severity: 'success',
            summary: 'Deleted',
            detail: res.message.en,
          });
          this.loadData();
          this.selectedPurchase = null as any;
          this.remark = '';
          this.showDeleteDialog = false;
          this.loading = false;
        },
        error: () => {
          this.showDeleteDialog = false;
          this.loading = false;
        },
      });
  }

  excel(): void {
    let exportData = this.selectedPurchase ? [this.selectedPurchase] : this.purchases;

    if (exportData.length === 0) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'No data available to export!',
      });
      return;
    }

    // Define the columns to be exported
    let columns = [
      { key: 'purchaseVno', value: 'Purchase V No' },
      { key: 'manualVno', value: 'Manual V No' },
      { key: 'supplierCompanyName', value: 'Company Name' },
      { key: 'supplierName', value: 'Supplier Name' },
      { key: 'purchaseDate', value: 'Purchase Date' },
      { key: 'totalAmount', value: 'Total Amount' },
      { key: 'discountAmount', value: 'Discount Amount' },
      { key: 'netAmount', value: 'Net Amount' },
      { key: 'payAmount', value: 'Pay Amount' },
      { key: 'leftAmount', value: 'Left Amount' },
      { key: 'paymentType', value: 'Payment Type' },
      { key: 'paidDate', value: 'Paid Date' },
      { key: 'leftAmount', value: 'leftAmount' },
      { key: 'createdOn', value: 'Created On' },
      { key: 'createdBy', value: 'Created By' },
      { key: 'updatedOn', value: 'Updated On' },
      { key: 'updatedBy', value: 'Updated By' },
    ];

    // Use exportSelectColsWithDynamicHeader for exporting data
    this.exportService.exportSelectColsWithDynamicHeader(exportData, columns, 'Purchase');
  }

  submit(): void {
    if (!this.purchaseForm.valid) {
      Object.keys(this.purchaseForm.controls).forEach((field) => {
        let control = this.purchaseForm.get(field);
        control?.markAsDirty({ onlySelf: true });
      });
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Please fill out all required fields correctly.',
      });
      return;
    }

    let payAmount = this.purchaseForm.get('payAmount')?.value;
    let leftAmount = this.purchaseForm.get('leftAmount')?.value;

    if (payAmount <= 0) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Pay amount must be greater than zero.',
      });
      return;
    }

    if (payAmount > leftAmount) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Pay amount cannot exceed the left amount.',
      });
      return;
    }

    ['purchaseVno', 'totalAmount', 'discountAmount', 'netAmount', 'leftAmount'].forEach(field =>
      this.purchaseForm.get(field)?.enable()
    );

    let model = this.purchaseForm.value as UpdatePurchaseModel;

    this.isSubmitting = true;
    this.loggerService.info(model);

    this.purchaseService.update(this.purchaseForm.value).subscribe({
      next: (res) => {
        this.PaymentVisible = false;
        this.loadData();
        this.isSubmitting = false;
        this.messageService.add({
          key: 'globalMessage',
          severity: 'success',
          summary: 'Success',
          detail: res.message.en,
        });
      },
      error: () => {
        this.isSubmitting = false;
        this.messageService.add({
          key: 'globalMessage',
          severity: 'warn',
          summary: 'Error',
          detail: 'Failed to update purchase payment.',
        });
      },
      complete: () => {
        this.selectedPurchase = null as any;
        this.isSubmitting = false;
      },
    });
  }

  clearSelection() {
    this.selectedPurchase = null as any;
  }

  handlePurchaseSubmitted(success: boolean) {
    if (success) {
      this.modalVisible = false;
      this.loadData();
    }
  }

  preventNegativeInput($event: KeyboardEvent) {
    let inputChar = $event.key;
    if (inputChar === '-' || inputChar === 'e') {
      $event.preventDefault();
    }
  }

  getSortedDetails(details: any[]): any[] {
    if (!details) return [];
    return details.slice().sort((a, b) => new Date(a.expireDate).getTime() - new Date(b.expireDate).getTime());
  }

  isExpiringSoon(expireDate: string | Date): boolean {
    const now = new Date();
    const exp = new Date(expireDate);

    // Check if the year and month match the current year and month
    return exp.getFullYear() === now.getFullYear() && exp.getMonth() === now.getMonth();
  }

  isExpired(expireDate: string | Date): boolean {
    const exp = new Date(expireDate);
    const now = new Date();
    return exp < now;
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'success';
      case 'credit':
        return 'danger';
      case 'partial':
        return 'warn';
      default:
        return 'info';
    }
  }

  getStatusIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'pi pi-check-circle';
      case 'credit':
        return 'pi pi-exclamation-circle';
      case 'partial':
        return 'pi pi-clock';
      default:
        return 'pi pi-question-circle';
    }
  }
}