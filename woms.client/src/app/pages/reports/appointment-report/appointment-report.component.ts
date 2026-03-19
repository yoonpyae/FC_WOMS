import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '@core_services/master/appointment.service';
import { SharedService } from '@shared_services/shared.service';
import { LoggerService } from '@shared_services/logger.service';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { DatePickerModule } from 'primeng/datepicker';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ExportService } from '@shared_services/export.service'; 
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-appointment-report',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, TableModule, TagModule,
    ChartModule, DatePickerModule, IconFieldModule, InputIconModule, InputTextModule
  ],
  providers: [DatePipe, MessageService, ExportService],
  templateUrl: './appointment-report.component.html'
})
export class AppointmentReportComponent implements OnInit {
  appointments: any[] = [];
  loading: boolean = false;
  branchId: number = 0;

  // Filters
  startDate: Date | null = null;
  endDate: Date | null = null;

  // KPIs
  totalAppointments: number = 0;
  completedAppointments: number = 0;
  cancelledAppointments: number = 0;
  confirmedAppointments: number = 0;

  // Chart
  chartData: any;
  chartOptions: any;

  constructor(
    private appointmentService: AppointmentService,
    private sharedService: SharedService,
    private loggerService: LoggerService,
    private datePipe: DatePipe,
    private exportService: ExportService,   
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');

    // Default to current month
    const today = new Date();
    this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    this.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.initChartOptions();
    this.loadReport();
  }

  loadReport(): void {
    this.loading = true;

    const startStr = this.startDate ? this.datePipe.transform(this.startDate, 'yyyy-MM-dd') : undefined;
    const endStr = this.endDate ? this.datePipe.transform(this.endDate, 'yyyy-MM-dd') : undefined;

    this.appointmentService.getReport(this.branchId, startStr ?? undefined, endStr ?? undefined).subscribe({
      next: (res: any) => {
        this.appointments = res.data || [];
        this.calculateMetrics();
        this.generateChartData();
      },
      error: (err) => this.loggerService.error('Failed to load report'),
      complete: () => this.loading = false
    });
  }

  calculateMetrics(): void {
    this.totalAppointments = this.appointments.length;
    this.completedAppointments = this.appointments.filter(a => a.appointmentStatus === 'Completed').length;
    this.cancelledAppointments = this.appointments.filter(a => a.appointmentStatus === 'Cancelled').length;
    this.confirmedAppointments = this.appointments.filter(a => a.appointmentStatus === 'Confirmed').length;
  }

  generateChartData(): void {
    // Group appointments by date
    const dateCounts: { [key: string]: { completed: number, cancelled: number, confirmed: number } } = {};

    // Sort ascending for the chart timeline
    const sortedForChart = [...this.appointments].sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

    sortedForChart.forEach(appt => {
      const dateStr = this.datePipe.transform(appt.appointmentDate, 'MMM dd') || 'Unknown';
      if (!dateCounts[dateStr]) {
        dateCounts[dateStr] = { completed: 0, cancelled: 0, confirmed: 0 };
      }

      if (appt.appointmentStatus === 'Completed') dateCounts[dateStr].completed++;
      else if (appt.appointmentStatus === 'Cancelled') dateCounts[dateStr].cancelled++;
      else if (appt.appointmentStatus === 'Confirmed') dateCounts[dateStr].confirmed++;
    });

    const labels = Object.keys(dateCounts);
    const completedData = labels.map(l => dateCounts[l].completed);
    const cancelledData = labels.map(l => dateCounts[l].cancelled);
    const confirmedData = labels.map(l => dateCounts[l].confirmed);

    this.chartData = {
      labels: labels,
      datasets: [
        { label: 'Completed', backgroundColor: '#10b981', data: completedData, borderRadius: 4 },
        { label: 'Confirmed', backgroundColor: '#3b82f6', data: confirmedData, borderRadius: 4 },
        { label: 'Cancelled', backgroundColor: '#ef4444', data: cancelledData, borderRadius: 4 }
      ]
    };
  }

  initChartOptions(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

    this.chartOptions = {
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: textColor } } },
      scales: {
        x: { stacked: true, ticks: { color: textColor }, grid: { display: false } },
        y: { stacked: true, ticks: { color: textColor }, grid: { color: surfaceBorder } }
      }
    };
  }

excel(): void {
    let exportData = this.appointments; // Report uses the full filtered list

    if (!exportData || exportData.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No data available to export!',
      });
      return;
    }

    // Keys perfectly mapped to your provided API Response
    let columns = [
      { key: 'ano', value: 'Appt No.' },
      { key: 'appointmentDate', value: 'Date' },
      { key: 'dayOfWeek', value: 'Day' },
      { key: 'startTime', value: 'Start Time' },
      { key: 'endTime', value: 'End Time' },
      { key: 'patientName', value: 'Patient Name' },
      { key: 'patientPhone', value: 'Phone Number' },
      { key: 'gender', value: 'Gender' },
      { key: 'dob', value: 'DOB' },
      { key: 'doctorName', value: 'Doctor Name' },
      { key: 'specialized', value: 'Specialty' },
      { key: 'appointmentStatus', value: 'Status' },
      { key: 'appointmentRemark', value: 'Remark' },
      { key: 'createdOn', value: 'Created On' },
      { key: 'createdBy', value: 'Created By' }
    ];

    this.exportService.exportSelectColsWithDynamicHeader(exportData, columns, 'Appointment_Report');
  }

}