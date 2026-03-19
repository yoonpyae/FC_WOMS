import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SharedService } from '@shared_services/shared.service';
import { LoggerService } from '@shared_services/logger.service';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { DashboardService } from '@core_services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, ChartModule, RouterModule],
  providers: [CurrencyPipe],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  branchId: number = 0;
  userName: string = 'Admin';
  loading: boolean = false;

  // KPIs
  appointmentsCount: number = 0;
  todayIncome: number = 0;
  todayExpense: number = 0;
  lowStockCount: number = 0;

  // Chart
  chartData: any;
  chartOptions: any;

  constructor(
    private sharedService: SharedService,
    private dashboardService: DashboardService,
    private loggerService: LoggerService,
    private cookieService: CookieService
  ) { }

  ngOnInit(): void {
    this.branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');

    // Attempt to grab user's name from cookie/local storage
    const storedName = this.cookieService.get('userName');
    if (storedName) this.userName = storedName;

    this.initChartOptions();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    this.dashboardService.getKpis(this.branchId).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.appointmentsCount = res.data.appointmentsCount;
          this.todayIncome = res.data.todayIncome;
          this.todayExpense = res.data.todayExpense;
          this.lowStockCount = res.data.lowStockCount;
        }
      },
      error: (err) => this.loggerService.error('Failed to load KPIs')
    });

    this.dashboardService.getRevenueChart(this.branchId).subscribe({
      next: (res: any) => {
        const dataList = res.data || [];
        const labels = dataList.map((d: any) => d.date);
        const incomes = dataList.map((d: any) => d.income);

        this.chartData = {
          labels: labels,
          datasets: [
            {
              label: 'Daily Revenue (MMK)',
              data: incomes,
              fill: true,
              borderColor: '#10b981', // Emerald green line
              backgroundColor: 'rgba(16, 185, 129, 0.1)', // Soft green fill
              tension: 0.4,
              pointBackgroundColor: '#10b981',
              pointBorderColor: '#ffffff',
              pointHoverBackgroundColor: '#ffffff',
              pointHoverBorderColor: '#10b981'
            }
          ]
        };
      },
      error: (err) => this.loggerService.error('Failed to load chart data'),
      complete: () => this.loading = false
    });
  }

  initChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

    this.chartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false } // Hide legend for a cleaner look
      },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { display: false, drawBorder: false }
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false },
          beginAtZero: true
        }
      }
    };
  }
}