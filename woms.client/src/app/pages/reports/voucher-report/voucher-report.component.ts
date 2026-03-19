import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedService } from '@shared_services/shared.service';
import { LoggerService } from '@shared_services/logger.service';
import { ExportService } from '@shared_services/export.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs'; // PrimeNG V18 Tabs
import { VoucherReportService } from '@core_services/voucher-report.service';


@Component({
  selector: 'app-voucher-report',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, TableModule, TagModule,
    DatePickerModule, IconFieldModule, InputIconModule, InputTextModule, ToastModule, TabsModule
  ],
  providers: [DatePipe, MessageService, ExportService],
  templateUrl: './voucher-report.component.html'
})
export class VoucherReportComponent implements OnInit {

  branchId: number = 0;
  loading: boolean = false;

  // Dates
  startDate: Date | null = null;
  endDate: Date | null = null;

  // Data Arrays
  purchases: any[] = [];
  pharmacyVouchers: any[] = [];
  opdVouchers: any[] = [];

  // Financial KPIs
  totalIncome: number = 0;     // OPD + Pharmacy Paid Amounts
  totalExpense: number = 0;    // Purchase Paid Amounts
  totalReceivables: number = 0;// Money patients owe (OPD + Pharmacy Left Amounts)
  totalPayables: number = 0;   // Money clinic owes (Purchase Left Amounts)

  constructor(
    private voucherReportService: VoucherReportService,
    private sharedService: SharedService,
    private loggerService: LoggerService,
    private datePipe: DatePipe,
    private exportService: ExportService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');

    // Default to Current Month
    const today = new Date();
    this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.loadReports();
  }

  loadReports(): void {
    if (!this.startDate || !this.endDate) return;

    this.loading = true;
    const startStr = this.datePipe.transform(this.startDate, 'yyyy-MM-dd')!;
    const endStr = this.datePipe.transform(this.endDate, 'yyyy-MM-dd')!;

    this.voucherReportService.getAggregatedReports(this.branchId, startStr, endStr).subscribe({
      next: ([purchaseRes, pharmacyRes, opdRes]) => {
        this.purchases = purchaseRes.data || [];
        this.pharmacyVouchers = pharmacyRes.data || [];
        this.opdVouchers = opdRes.data || [];

        this.calculateFinancials();
      },
      error: (err) => {
        this.loggerService.error('Failed to load voucher reports');
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load financial data.' });
      },
      complete: () => this.loading = false
    });
  }

  calculateFinancials(): void {
    // Income (Money received from patients)
    const opdIncome = this.opdVouchers.reduce((sum, v) => sum + (v.paidAmount || 0), 0);
    const pharmIncome = this.pharmacyVouchers.reduce((sum, v) => sum + (v.paidAmount || 0), 0);
    this.totalIncome = opdIncome + pharmIncome;

    // Expenses (Money paid to suppliers)
    this.totalExpense = this.purchases.reduce((sum, p) => sum + (p.payAmount || 0), 0);

    // Receivables (Money patients still owe us)
    const opdDebt = this.opdVouchers.reduce((sum, v) => sum + (v.leftAmount || 0), 0);
    const pharmDebt = this.pharmacyVouchers.reduce((sum, v) => sum + (v.leftAmount || 0), 0);
    this.totalReceivables = opdDebt + pharmDebt;

    // Payables (Money clinic still owes suppliers)
    this.totalPayables = this.purchases.reduce((sum, p) => sum + (p.leftAmount || 0), 0);
  }

  // --- Exports ---

  exportOPD(): void {
    if (this.opdVouchers.length === 0) { this.showWarn(); return; }
    const columns = [
      { key: 'opdvno', value: 'Voucher No' }, { key: 'vdate', value: 'Date' },
      { key: 'patientName', value: 'Patient' }, { key: 'doctorName', value: 'Doctor' },
      { key: 'totalAmount', value: 'Total Amt' }, { key: 'paidAmount', value: 'Paid Amt' },
      { key: 'leftAmount', value: 'Balance Due' }, { key: 'status', value: 'Status' }
    ];
    this.exportService.exportSelectColsWithDynamicHeader(this.opdVouchers, columns, 'OPD_Voucher_Report');
  }

  exportPharmacy(): void {
    if (this.pharmacyVouchers.length === 0) { this.showWarn(); return; }
    const columns = [
      { key: 'vno', value: 'Voucher No' }, { key: 'vdate', value: 'Date' },
      { key: 'patientName', value: 'Patient' }, { key: 'referDoctorName', value: 'Refer Doctor' },
      { key: 'totalAmount', value: 'Total Amt' }, { key: 'paidAmount', value: 'Paid Amt' },
      { key: 'leftAmount', value: 'Balance Due' }, { key: 'issuePerson', value: 'Cashier' }
    ];
    this.exportService.exportSelectColsWithDynamicHeader(this.pharmacyVouchers, columns, 'Pharmacy_Voucher_Report');
  }

  exportPurchase(): void {
    if (this.purchases.length === 0) { this.showWarn(); return; }
    const columns = [
      { key: 'purchaseVno', value: 'PO Number' }, { key: 'purchaseDate', value: 'Date' },
      { key: 'supplierName', value: 'Supplier' }, { key: 'supplierCompanyName', value: 'Company' },
      { key: 'netAmount', value: 'Net Amount' }, { key: 'payAmount', value: 'Amount Paid' },
      { key: 'leftAmount', value: 'Amount Owed' }, { key: 'status', value: 'Status' }
    ];
    this.exportService.exportSelectColsWithDynamicHeader(this.purchases, columns, 'Purchase_Order_Report');
  }

  private showWarn() {
    this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No data to export!' });
  }
}