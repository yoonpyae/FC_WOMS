import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ViOPDVoucherModel } from '@core_models/master/opd-voucher.model';
import { OPDVoucherService } from '@core_services/master/opd-voucher.service';
import { ExportService } from '@shared_services/export.service';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { OPDVoucherEntryComponent } from './entry/entry.component';

@Component({
  selector: 'app-opd-voucher',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    DatePickerModule,
    SelectModule,
    // OPDVoucherEntryComponent
  ],
  standalone: true,
  providers: [ConfirmationService, ExportService, DatePipe],
  templateUrl: './opd-voucher.component.html',
  styleUrl: './opd-voucher.component.scss'
})
export class OpdVoucherComponent implements OnInit {
  opdVouchers: ViOPDVoucherModel[] = [];
  selectedOPDVoucher!: ViOPDVoucherModel;

  items!: MenuItem[] | undefined;

  loading: boolean = false;
  detailLoading: boolean = false;
  isSubmitting: boolean = false;
  modalVisible: boolean = false;

  startDate: Date = new Date();
  endDate: Date = new Date();

  @ViewChild(OPDVoucherEntryComponent) entryComponent!: OPDVoucherEntryComponent;


  constructor(
    private opdVoucherService: OPDVoucherService,
    private messageService: MessageService,
    private exportService: ExportService,
    private confirmationService: ConfirmationService,
    private loggerService: LoggerService,
    private sharedService: SharedService,
    private datePipe: DatePipe,
  ) {
    this.items = [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.edit(),
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

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    const branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    this.loading = true;

    const start = this.startDate ?? new Date();
    const end = this.endDate ?? new Date();

    const sdate = this.datePipe.transform(start, 'yyyy-MM-dd') ?? '';
    const edate = this.datePipe.transform(end, 'yyyy-MM-dd') ?? '';


    this.opdVoucherService.getByDateRange(branchId, sdate, edate).subscribe({
      next: (res) => {
        this.opdVouchers = res.data as ViOPDVoucherModel[];
        this.loading = false;
        this.loggerService.info(this.opdVouchers);
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

  //#region CRUD Operations

  create(): void {
    this.selectedOPDVoucher = null as any;
    this.modalVisible = true;
  }

  edit(): void { }

  delete(): void {
    if (this.selectedOPDVoucher != null) {
      this.confirmationService.confirm({
        message: 'Are You Sure Want To Delete?',
        header: 'Delete Confirmation',
        icon: 'pi pi-info-circle',
        accept: () => {
          this.loading = true;
          this.opdVoucherService.delete(this.selectedOPDVoucher.opdvno).subscribe({
            next: (res) => {
              this.messageService.add({ key: 'globalMessage', severity: 'success', summary: 'Success', detail: res.message.en, });
              this.loadData();
              this.selectedOPDVoucher = null as any;
            },
            error: (err) => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error.message });
            },
            complete: () => {
              this.loading = false;
            }
          });
        },
        key: 'OPDDeleteDialog',
      });
    } else {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please choose OPD Voucher.',
      });
    }
  }

  //#endregion

  //#region Export

  excel(): void {
    let exportData = this.selectedOPDVoucher ? [this.selectedOPDVoucher] : this.opdVouchers;

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
      { key: 'opdvno', value: 'Voucher No' },
      { key: 'vdate', value: 'Voucher Date' },
      { key: 'patientId', value: 'Patient Id' },
      { key: 'patientName', value: 'Patient Name' },
      { key: 'doctorId', value: 'Doctor Id' },
      { key: 'doctorName', value: 'Doctor Name' },
      { key: 'totalAmount', value: 'Total Amount' },
      { key: 'discountAmount', value: 'Discount Amount' },
      { key: 'leftAmount', value: 'leftAmount' },
      { key: 'paymentType', value: 'Payment Type' },
      { key: 'remark', value: 'Remark' },
      { key: 'createdOn', value: 'Created On' },
      { key: 'createdBy', value: 'Created By' },
      { key: 'updatedOn', value: 'Updated On' },
      { key: 'updatedBy', value: 'Updated By' },
    ];

    this.exportService.exportSelectColsWithDynamicHeader(exportData, columns, 'OPD Voucher');
  }

  //#endregion
}
