import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SharedService } from '@shared_services/shared.service';
import { LoggerService } from '@shared_services/logger.service';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { AppointmentService } from '@core_services/master/appointment.service';
import { PatientService } from '@core_services/master/patient.service';
import { ConsultationService } from '@core_services/master/consultation.service';
import { CookieService } from 'ngx-cookie-service';
import { Router, RouterModule } from '@angular/router';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, AvatarModule, RouterModule, ChartModule],
  providers: [DatePipe],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.scss'
})
export class DoctorDashboardComponent implements OnInit {

  // Context
  doctorName: string = '';
  doctorId: number = 0;
  branchId: number = 0;

  // KPI Stats
  todayAppointmentCount: number = 0;
  completedTodayCount: number = 0;
  activePatientsCount: number = 0;
  thisWeekCount: number = 0;

  // Data Lists
  todayAppointments: any[] = [];
  upcomingAppointments: any[] = [];
  todayPatients: any[] = [];
  recentNotes: any[] = [];

  // UI State
  activeTab: string = 'Schedule';
  tabs = ['Schedule', 'Patients', 'Stats'];
  activeStatTab: string = 'Patient Visits';
  loading: boolean = false;

  // Chart Configuration
  chartData: any;
  chartOptions: any;

  constructor(
    private sharedService: SharedService,
    private loggerService: LoggerService,
    private datePipe: DatePipe,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private consultationService: ConsultationService,
    private cookieService: CookieService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 1. Initialize Context
    this.branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');
    this.doctorId = Number.parseInt(this.cookieService.get('doctorId') ?? '0');
    const storedName = this.cookieService.get('doctorName');
    this.doctorName = storedName ? storedName : 'Doctor';

    // 2. Load Data & UI
    this.initChart();
    this.loadDashboardData();
  }

  // --- Data Loading ---

  loadDashboardData() {
    this.loading = true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = this.datePipe.transform(today, 'yyyy-MM-dd') ?? '';

    // Fetch Appointments
    this.appointmentService.getDoctorAppointments(this.branchId, todayStr).subscribe({
      next: (res: any) => {
        const allToday = res.data || [];
        const myTodayApps = allToday.filter((a: any) => a.doctorId === this.doctorId);

        this.todayAppointmentCount = myTodayApps.length;

        const uniquePatients = new Set(myTodayApps.map((a: any) => a.patientId));
        this.activePatientsCount = uniquePatients.size;

        this.todayAppointments = myTodayApps.map((appt: any) => ({
          patientId: appt.patientId,
          patientName: appt.patientName || 'Unknown Patient',
          time: this.formatTime(appt.startTime) || 'TBD',
          duration: '30 min',
          status: appt.appointmentStatus || 'Pending',
          urgent: false
        }));

        this.todayPatients = myTodayApps.map((appt: any) => ({
          patientId: appt.patientId,
          patientName: appt.patientName || 'Unknown Patient',
          gender: appt.gender || 'Unknown',
          age: this.calculateAge(appt.dob),
          type: 'Regular',
          status: appt.appointmentStatus || 'Pending'
        }));
      },
      error: (err) => this.loggerService.error("Failed to load today's appointments")
    });

    // Fetch Consultations
    this.consultationService.get(this.branchId, this.doctorId).subscribe({
      next: (res: any) => {
        const allConsultations = res.data || [];

        this.completedTodayCount = allConsultations.filter((c: any) => {
          if (!c.visitDate) return false;
          const cDate = new Date(c.visitDate);
          cDate.setHours(0, 0, 0, 0);
          return cDate.getTime() === today.getTime() && c.status === 'Completed';
        }).length;

        this.recentNotes = allConsultations
          .filter((c: any) => c.notes && c.notes.trim() !== '')
          .sort((a: any, b: any) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
          .slice(0, 5)
          .map((c: any) => ({
            consultationId: c.consultationId,
            patientId: c.patientId,
            patientName: c.patientName,
            relativeTime: this.getRelativeTimeText(new Date(c.visitDate)),
            note: c.notes
          }));
      },
      error: (err) => this.loggerService.error("Failed to load consultations")
    });

    // Fetch Upcoming Appointments
    this.appointmentService.get(this.branchId).subscribe({
      next: (res: any) => {
        const allApps = res.data || [];
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const myUpcoming = allApps.filter((a: any) => {
          if (a.doctorId !== this.doctorId) return false;
          const appDate = new Date(a.appointmentDate);
          appDate.setHours(0, 0, 0, 0);
          return appDate > today;
        });

        this.thisWeekCount = myUpcoming.filter((a: any) => {
          const appDate = new Date(a.appointmentDate);
          appDate.setHours(0, 0, 0, 0);
          return appDate <= nextWeek;
        }).length;

        myUpcoming.sort((a: any, b: any) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

        this.upcomingAppointments = myUpcoming.slice(0, 5).map((appt: any) => ({
          patientName: appt.patientName || 'Unknown Patient',
          date: `${this.datePipe.transform(appt.appointmentDate, 'EEEE, MMMM d')} at ${this.formatTime(appt.appointmentTime) || 'TBD'}`,
          status: appt.status || 'Confirmed',
          type: 'Consultation'
        }));
      },
      error: (err) => this.loggerService.error("Failed to load upcoming appointments")
    });

    // Fetch Chart Metrics
    const currentYear = today.getFullYear();
    this.consultationService.getMonthlyVisits(this.branchId, this.doctorId, currentYear).subscribe({
      next: (res: any) => {
        const monthlyData: number[] = res.data || Array(12).fill(0);
        this.chartData = {
          ...this.chartData,
          datasets: [{
            label: 'Patient Visits',
            backgroundColor: '#6366f1',
            data: monthlyData,
            borderRadius: 4
          }]
        };
      },
      error: (err) => this.loggerService.error("Failed to load monthly metrics")
    });
  }

  // --- Routing Actions ---

  goToConsultation(patientId: string, status: string) {
    if (!patientId) return;

    if (status === 'Completed') {
      this.router.navigate(['/consultation'], {
        queryParams: { patientId: patientId, action: 'edit' } // Fixed this logic block
      });
    } else {
      this.router.navigate(['/consultation'], {
        queryParams: { patientId: patientId }
      });
    }
  }

  goToPatientHistory(patientId: string) {
    if (patientId) this.router.navigate(['/patient/detail', patientId]);
  }

  editNote(consultationId: string, patientId: string) {
    this.router.navigate(['/consultation'], { queryParams: { patientId: patientId, action: 'edit' } });
  }

  // --- Formatters & Helpers ---

  formatTime(timeStr: string): string {
    if (!timeStr) return '';
    if (timeStr.includes('T')) return this.datePipe.transform(timeStr, 'shortTime') || timeStr;
    const [hours, minutes] = timeStr.split(':');
    if (hours && minutes) {
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
      return this.datePipe.transform(date, 'shortTime') || timeStr;
    }
    return timeStr;
  }

  getInitials(name: string): string {
    if (!name) return 'PT';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  getRelativeTimeText(dateObj: Date): string {
    const today = new Date();
    const isToday = dateObj.getDate() === today.getDate() && dateObj.getMonth() === today.getMonth() && dateObj.getFullYear() === today.getFullYear();
    const timeStr = this.datePipe.transform(dateObj, 'hh:mm a');

    if (isToday) return `Today, ${timeStr}`;

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = dateObj.getDate() === yesterday.getDate() && dateObj.getMonth() === yesterday.getMonth() && dateObj.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return `Yesterday, ${timeStr}`;
    return `${this.datePipe.transform(dateObj, 'MMM d, yyyy')}, ${timeStr}`;
  }

  calculateAge(dobString: string | null): string {
    if (!dobString) return 'N/A';
    const dob = new Date(dobString);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    return `${Math.abs(ageDate.getUTCFullYear() - 1970)} yrs`;
  }

  initChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#6c757d';
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border') || '#dfe7ef';

    this.chartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Patient Visits',
        backgroundColor: '#6366f1',
        data: [45, 52, 48, 61, 55, 68, 71, 63, 59, 69, 73, 65], // Fallback UI data
        borderRadius: 4
      }]
    };

    this.chartOptions = {
      plugins: { legend: { display: false } },
      scales: {
        x: {
          ticks: { color: textColorSecondary },
          grid: { color: 'transparent', drawBorder: false }
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        }
      }
    };
  }
}