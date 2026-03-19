import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SharedService } from '@shared_services/shared.service';
import { LoggerService } from '@shared_services/logger.service';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { PharmacistDashboardService } from '@core_services/pharmacist-dashboard.service';

@Component({
  selector: 'app-pharmacist-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, ChartModule, RouterModule],
  providers: [CurrencyPipe],
  templateUrl: './pharmacist-dashboard.component.html'
})
export class PharmacistDashboardComponent implements OnInit {
  
  branchId: number = 0;
  userName: string = 'Pharmacist';
  loading: boolean = false;

  // KPIs
  todaySales: number = 0;
  todayPurchases: number = 0;
  lowStockCount: number = 0;
  outOfStockCount: number = 0;

  // Chart
  chartData: any;
  chartOptions: any;

  constructor(
    private sharedService: SharedService,
    private dashboardService: PharmacistDashboardService,
    private loggerService: LoggerService,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    this.branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');
    
    const storedName = this.cookieService.get('userName');
    if(storedName) this.userName = storedName;

    this.initChartOptions();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Load KPIs
    this.dashboardService.getKpis(this.branchId).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.todaySales = res.data.todaySales;
          this.todayPurchases = res.data.todayPurchases;
          this.lowStockCount = res.data.lowStockCount;
          this.outOfStockCount = res.data.outOfStockCount;
        }
      },
      error: (err) => this.loggerService.error('Failed to load pharmacy KPIs')
    });

    // Load Chart Data
    this.dashboardService.getSalesChart(this.branchId).subscribe({
      next: (res: any) => {
        const dataList = res.data || [];
        const labels = dataList.map((d: any) => d.date);
        const sales = dataList.map((d: any) => d.sales);

        this.chartData = {
          labels: labels,
          datasets: [
            {
              label: 'Pharmacy Sales (MMK)',
              data: sales,
              fill: true,
              borderColor: '#3b82f6', // Blue line
              backgroundColor: 'rgba(59, 130, 246, 0.1)', // Soft blue fill
              tension: 0.4,
              pointBackgroundColor: '#3b82f6',
              pointBorderColor: '#ffffff',
              pointHoverBackgroundColor: '#ffffff',
              pointHoverBorderColor: '#3b82f6'
            }
          ]
        };
      },
      error: (err) => this.loggerService.error('Failed to load pharmacy chart data'),
      complete: () => this.loading = false
    });
  }

  initChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

    this.chartOptions = {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: textColorSecondary }, grid: { display: false, drawBorder: false } },
        y: { ticks: { color: textColorSecondary }, grid: { color: surfaceBorder, drawBorder: false }, beginAtZero: true }
      }
    };
  }
}