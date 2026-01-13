import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ViPharmacyVoucherModel } from '@core_models/pharmacy-voucher/pharmacy-vocher-list.model';
import { PharmacyVoucherService } from '@core_services/pharmacy-voucher/pharmacy-voucher.service';
import { ExportService } from '@shared_services/export.service';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePicker } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-pharmacy-voucher-history',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    TableModule,
    ToastModule,

    DatePicker,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    DialogModule,
    DrawerModule,
    ConfirmDialogModule
  ],
  templateUrl: './history.component.html',
  providers: [ExportService, DatePipe, ConfirmationService],
})
export class PharmacyVoHistoryComponent implements OnInit {
  pharmacyVoucherHistories: ViPharmacyVoucherModel[] = [];
  selectedPharmacyVoucherHistory!: ViPharmacyVoucherModel;
  AllLists: any[] = [];
  expandedRowKeys: { [key: string]: boolean } = {};
  loading: boolean = false;
  detailLoading: boolean = false;
  isSubmitting: boolean = false;
  modalVisible: boolean = false;
  PaymentVisible: boolean = false;
  startDate: Date = new Date();
  endDate: Date = new Date();

  constructor(
    private sharedService: SharedService,
    private pharmacyVoucherService: PharmacyVoucherService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private exportService: ExportService,
    private loggerService: LoggerService,
    private datePipe: DatePipe,
  ) { }

  private formBuilder = inject(FormBuilder);
  public pharmacyVoucherForm: FormGroup = this.formBuilder.group({
    vno: [''],
    patientId: [''],
    vdate: [new Date()],
    patientName: [''],
    age: [''],
    sex: [''],
    referDoctorId: [0],
    referDoctorName: [''],
    totalAmount: [0],
    discountAmount: [0],
    leftAmount: [0],
    paidAmount: [0],
    fee: [0],
    paymentType: [''],
    processStatus: [''],
    credit: [0],
    checked: [false],
    remark: [''],
    createdBy: [''],
  });

  ngOnInit(): void {
    this.loadData();
  }

  //#region Data Loading Methods
  loadData(): void {
    let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    this.loading = true;

    const start = this.startDate ?? new Date();
    const end = this.endDate ?? new Date();

    const sDate = this.datePipe.transform(start, 'yyyy-MM-dd') ?? '';
    const eDate = this.datePipe.transform(end, 'yyyy-MM-dd') ?? '';

    this.pharmacyVoucherService.getByDate(branchId, sDate, eDate).subscribe({
      next: (res) => {
        this.pharmacyVoucherHistories = res.data as ViPharmacyVoucherModel[];
        this.loading = false;
        this.loggerService.info(this.pharmacyVoucherHistories);
      },
      error: () => {
        this.loggerService.error('Error loading pharmacy voucher history');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onEndDateChange(date: Date): void {
    this.endDate = date;

    if (!this.startDate || this.startDate > this.endDate) {
      this.startDate = new Date(this.endDate);
    }
  }

  loadCreditData(): void {
    let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    this.loading = true;

    this.pharmacyVoucherService.getByCredit(branchId).subscribe({
      next: (res) => {
        this.pharmacyVoucherHistories = res.data as ViPharmacyVoucherModel[];
        this.loading = false;
        this.loggerService.info(this.pharmacyVoucherHistories);
      },
      error: () => {
        this.loggerService.error('Error loading pharmacy voucher history');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  //#endregion

  //#region Update
  creditPayment(): void {
    this.pharmacyVoucherForm.reset();

    if (this.selectedPharmacyVoucherHistory.leftAmount === 0) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'info',
        summary: 'Info',
        detail: 'This voucher is already fully paid.',
      });
      this.PaymentVisible = false;
      return;
    }

    this.loggerService.info(this.selectedPharmacyVoucherHistory);

    this.pharmacyVoucherForm.controls['vno'].setValue(
      this.selectedPharmacyVoucherHistory.vno,
    );
    this.pharmacyVoucherForm.controls['leftAmount'].setValue(
      this.selectedPharmacyVoucherHistory.leftAmount
    );

    this.PaymentVisible = true;
  }
  update(): void {
    if (!this.pharmacyVoucherForm.valid) {
      Object.keys(this.pharmacyVoucherForm.controls).forEach((field) => {
        let control = this.pharmacyVoucherForm.get(field);
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

    let payAmount = this.pharmacyVoucherForm.get('paidAmount')?.value;
    let leftAmount = this.pharmacyVoucherForm.get('leftAmount')?.value;

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
        detail: 'Pay amount cannot exceed the credit amount.',
      });
      return;
    }

    ['vno', 'leftAmount'].forEach(field =>
      this.pharmacyVoucherForm.get(field)?.enable()
    );

    // Construct PharmacyVoucherModel with all required properties
    const formValues = this.pharmacyVoucherForm.value;
    const selected = this.selectedPharmacyVoucherHistory;
    const model = {
      ...selected,
      ...formValues,
      vno: selected.vno,
      leftAmount: formValues.leftAmount,
      paidAmount: formValues.paidAmount,
      remark: formValues.remark,
    };

    this.isSubmitting = true;
    this.loggerService.info(model);

    this.pharmacyVoucherService.update(model).subscribe({
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
          detail: 'Failed to update credit payment.',
        });
      },
      complete: () => {
        this.selectedPharmacyVoucherHistory = null as any;
        this.isSubmitting = false;
      },
    });
  }
  //#endregion

  //#region Excel
  Excel(): void {
    let exportData = this.selectedPharmacyVoucherHistory ? [this.selectedPharmacyVoucherHistory] : this.pharmacyVoucherHistories;

    if (exportData.length === 0) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'No data available to export!',
      });
      return;
    }

    let columns = [
      { key: 'vno', value: 'Voucher No' },
      { key: 'vdate', value: 'Voucher Date' },
      { key: 'patientId', value: 'Patient Id' },
      { key: 'patientName', value: 'Patient Name' },
      { key: 'referDoctorId', value: 'Refer Doctor Id' },
      { key: 'referDoctorName', value: 'Refer Doctor Name' },
      { key: 'totalAmount', value: 'Total Amount' },
      { key: 'discountAmount', value: 'Discount Amount' },
      { key: 'paidDate', value: 'Paid Date' },
      { key: 'leftAmount', value: 'leftAmount' },
      { key: 'paymentType', value: 'Payment Type' },
      { key: 'paymentNo', value: 'Payment No' },
      { key: 'processStatus', value: 'Process Status' },
      { key: 'queueNo', value: 'Queue No' },
      { key: 'issuePerson', value: 'Issue Person' },
      { key: 'issueDate', value: 'Issue Date' },
      { key: 'remark', value: 'Remark' },
      { key: 'createdOn', value: 'Created On' },
      { key: 'createdBy', value: 'Created By' },
      { key: 'updatedOn', value: 'Updated On' },
      { key: 'updatedBy', value: 'Updated By' },
    ];

    this.exportService.exportSelectColsWithDynamicHeader(exportData, columns, 'Pharmacy Voucher');
  }

  //#endregion

  //#region Delete
  delete(voucher: ViPharmacyVoucherModel): void {
    if (this.selectedPharmacyVoucherHistory != null) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete this voucher?',
        header: 'Delete Confirmation',
        icon: 'pi pi-info-circle',
        accept: () => {
          this.loading = true;
          this.pharmacyVoucherService.delete(this.selectedPharmacyVoucherHistory.vno).subscribe({
            next: (res) => {
              this.messageService.add({ key: 'globalMessage', severity: 'success', summary: 'Success', detail: res.message.en, });
              this.loadData();
              this.selectedPharmacyVoucherHistory = null as any;
            },
            error: (err) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message });
            },
            complete: () => {
              this.loading = false;
            }
          });
        },
        key: 'PharmacyVoucherDeleteDialog',
      });
    } else {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please choose Pharmacy Voucher.',
      });
    }
  }
  //#endregion

  //#region Submit
  submit(): void { }
  //#endregion

  //#region Utility Methods
  clearSelection() {
    this.selectedPharmacyVoucherHistory = null as any;
  }

  cancel(): void {
    this.modalVisible = false;
    this.clearSelection();
  }

  preventNegativeInput($event: KeyboardEvent) {
    const inputChar = $event.key;
    if (inputChar === '-' || inputChar === 'e') {
      $event.preventDefault();
    }
  }

  getPaymentStatus(): string {
    const credit = this.pharmacyVoucherForm.get('leftAmount')?.value;
    const paidAmount = this.pharmacyVoucherForm.get('paidAmount')?.value;

    if (credit == 0) {
      return 'Full Payment';
    } else if (paidAmount == 0) {
      return 'Credit';
    } else if (credit > 0 && paidAmount > 0) {
      return 'Partial Payment';
    }
    return '';
  }
  //#endregion
}
