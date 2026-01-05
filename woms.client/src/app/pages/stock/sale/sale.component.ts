import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Detail, ViSaleModel } from '@core_models/stock/sale/sale.model';
import { SaleService } from '@core_services/stock/sale.service';
import { ExportService } from '@shared_services/export.service';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePicker } from 'primeng/datepicker';
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

@Component({
  selector: 'app-sale',
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
  templateUrl: './sale.component.html'
})
export class SaleComponent implements OnInit {

  sales: ViSaleModel[] = [];
  selectedSale!: ViSaleModel;

  saleDetails: Detail[] = [];
  selectedSaleDetail!: Detail;

  items!: MenuItem[] | undefined;
  loading: boolean = false;
  isSubmitting: boolean = false;
  modalVisible: boolean = false;
  showDeleteDialog: boolean = false;
  remark: string = '';

  expandedRows = {};
  startDate: Date = new Date();
  endDate: Date = new Date();

  constructor(
    private saleService: SaleService,
    private messageService: MessageService,
    private loggerService: LoggerService,
    private shareService: SharedService,
    private exportService: ExportService,
    private route: Router,
    private datePipe: DatePipe,
  ) {
    this.items = [
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
  public saleForm: FormGroup = this.formBuilder.group({
    saleVno: [{ value: '', disabled: true }],
    totalAmount: [{ value: 0, disabled: true }],
    discountAmount: [{ value: 0, disabled: true }],
    netAmount: [{ value: 0, disabled: true }],
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

    this.saleService.get(branchId, sdate, edate).subscribe({
      next: (res) => {
        this.sales = res.data as ViSaleModel[];
        this.loading = false;
        this.loggerService.info(this.sales);
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
    this.route.navigate(['/stock/sales/entry']);
  }

  delete(): void {
    if (this.selectedSale != null) {
      this.showDeleteDialog = true;
    } else {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please choose a sale to delete.',
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
    this.saleService
      .delete(this.selectedSale.saleVno.toString(), this.remark)
      .subscribe({
        next: (res) => {
          this.messageService.add({
            key: 'globalMessage',
            severity: 'success',
            summary: 'Deleted',
            detail: res.message.en,
          });
          this.loadData();
          this.selectedSale = null as any;
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
    let exportData = this.selectedSale ? [this.selectedSale] : this.sales;

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
      { key: 'saleVno', value: 'Sale V No' },
      { key: 'manualVno', value: 'Manual V No' },
      { key: 'patientName', value: 'Patient Name' },
      { key: 'saleDate', value: 'Sale Date' },
      { key: 'totalAmount', value: 'Total Amount' },
      { key: 'discountAmount', value: 'Discount Amount' },
      { key: 'netAmount', value: 'Net Amount' },
      { key: 'paymentType', value: 'Payment Type' },
      { key: 'paidDate', value: 'Paid Date' },
      { key: 'leftAmount', value: 'leftAmount' },
      { key: 'createdOn', value: 'Created On' },
      { key: 'createdBy', value: 'Created By' },
      { key: 'updatedOn', value: 'Updated On' },
      { key: 'updatedBy', value: 'Updated By' },
    ];

    // Use exportSelectColsWithDynamicHeader for exporting data
    this.exportService.exportSelectColsWithDynamicHeader(exportData, columns, 'sale');
  }

  clearSelection() {
    this.selectedSale = null as any;
  }


  handleSaleSubmitted(success: boolean) {
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
}