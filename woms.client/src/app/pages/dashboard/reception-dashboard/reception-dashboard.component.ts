import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SharedService } from '@shared_services/shared.service';
import { LoggerService } from '@shared_services/logger.service';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ReceptionDashboardService } from '@core_services/reception-dashboard.service';

@Component({
  selector: 'app-reception-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, TableModule, TagModule, RouterModule],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './reception-dashboard.component.html'
})
export class ReceptionDashboardComponent implements OnInit {
  
  branchId: number = 0;
  userName: string = 'Receptionist';
  loading: boolean = false;

  // KPIs
  todayAppointments: number = 0;
  newPatients: number = 0;
  collectedAmount: number = 0;
  pendingAmount: number = 0;

  // Upcoming Appointments List
  upcomingAppointments: any[] = [];

  constructor(
    private sharedService: SharedService,
    private dashboardService: ReceptionDashboardService,
    private loggerService: LoggerService,
    private cookieService: CookieService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');
    
    const storedName = this.cookieService.get('userName');
    if(storedName) this.userName = storedName;

    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    // Load KPIs
    this.dashboardService.getKpis(this.branchId).subscribe({
      next: (res: any) => {
        if (res.data) {
          this.todayAppointments = res.data.todayAppointments;
          this.newPatients = res.data.newPatients;
          this.collectedAmount = res.data.collectedAmount;
          this.pendingAmount = res.data.pendingAmount;
        }
      },
      error: (err) => this.loggerService.error('Failed to load reception KPIs')
    });

    // Load Upcoming Appointments
    this.dashboardService.getUpcomingAppointments(this.branchId).subscribe({
      next: (res: any) => {
        this.upcomingAppointments = res.data || [];
      },
      error: (err) => this.loggerService.error('Failed to load upcoming appointments'),
      complete: () => this.loading = false
    });
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '';
    // Format "14:30:00" to a readable format
    const [hours, minutes] = timeStr.split(':');
    if (hours && minutes) {
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
      return this.datePipe.transform(date, 'shortTime') || timeStr;
    }
    return timeStr;
  }
}