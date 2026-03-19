import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedService } from '@shared_services/shared.service';
import { LoggerService } from '@shared_services/logger.service';
import { ExportService } from '@shared_services/export.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MainStockService } from '@core_services/stock/main-stock.service';

@Component({
  selector: 'app-stock-report',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, TableModule, TagModule,
    ChartModule, IconFieldModule, InputIconModule, InputTextModule, ToastModule
  ],
  providers: [DatePipe, CurrencyPipe, MessageService, ExportService],
  templateUrl: './stock-report.component.html'
})
export class StockReportComponent implements OnInit {
  inventory: any[] = [];
  loading: boolean = false;
  branchId: number = 0;

  // KPIs
  totalUniqueItems: number = 0;
  totalInventoryValue: number = 0;
  lowStockItems: number = 0;
  outOfStockItems: number = 0;

  // Chart
  chartData: any;
  chartOptions: any;

  // Threshold for "Low Stock" Warning
  readonly LOW_STOCK_THRESHOLD = 100;

  constructor(
    private stockReportService: MainStockService,
    private sharedService: SharedService,
    private loggerService: LoggerService,
    private exportService: ExportService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');
    this.initChartOptions();
    this.loadReport();
  }

  loadReport(): void {
    this.loading = true;

    this.stockReportService.getInventoryReport(this.branchId).subscribe({
      next: (res: any) => {
        this.inventory = res.data || [];
        this.calculateMetrics();
        this.generateChartData();
      },
      error: (err) => {
        this.loggerService.error('Failed to load stock report');
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load inventory data.' });
      },
      complete: () => this.loading = false
    });
  }

  calculateMetrics(): void {
    this.totalUniqueItems = this.inventory.length;

    // Calculate total value based on Ground Balance * Average Price
    this.totalInventoryValue = this.inventory.reduce((sum, item) => sum + (item.groundBalance * (item.avgPrice || item.purchasePrice || 0)), 0);

    this.outOfStockItems = this.inventory.filter(item => item.groundBalance <= 0).length;
    this.lowStockItems = this.inventory.filter(item => item.groundBalance > 0 && item.groundBalance <= this.LOW_STOCK_THRESHOLD).length;
  }

  generateChartData(): void {
    // Sort by Highest Volume first, take top 10 for the chart
    const sortedByVolume = [...this.inventory].sort((a, b) => b.groundBalance - a.groundBalance).slice(0, 10);

    const labels = sortedByVolume.map(item => item.itemName);
    const data = sortedByVolume.map(item => item.groundBalance);

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'In Stock (Qty)',
          backgroundColor: '#6366f1', // Indigo color
          data: data,
          borderRadius: 4
        }
      ]
    };
  }

  initChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

    this.chartOptions = {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColor, maxRotation: 45, minRotation: 45 }, grid: { display: false } },
        y: { ticks: { color: textColor }, grid: { color: surfaceBorder } }
      }
    };
  }

  excel(): void {
    if (!this.inventory || this.inventory.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'No data available to export!' });
      return;
    }

    // Create a deeply cloned array so we can calculate 'Total Value' on the fly for the export
    const exportData = this.inventory.map(item => ({
      ...item,
      totalValue: (item.groundBalance * (item.avgPrice || item.purchasePrice || 0)).toFixed(2)
    }));

    let columns = [
      { key: 'itemCode', value: 'Item Code' },
      { key: 'itemName', value: 'Item Name' },
      { key: 'chemicalName', value: 'Chemical Name' },
      { key: 'typeName', value: 'Packet Type' },
      { key: 'groundBalance', value: 'In Stock (Qty)' },
      { key: 'avgPrice', value: 'Avg Cost Price' },
      { key: 'purchasePrice', value: 'Last Purchase Price' },
      { key: 'salePrice', value: 'Sale Price' },
      { key: 'totalValue', value: 'Total Est. Value' },
      { key: 'status', value: 'Active Status' },
      { key: 'updatedOn', value: 'Last Updated' }
    ];

    this.exportService.exportSelectColsWithDynamicHeader(exportData, columns, 'Inventory_Stock_Report');
  }
}