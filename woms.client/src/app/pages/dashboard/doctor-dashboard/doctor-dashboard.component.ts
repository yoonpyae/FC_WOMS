import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SharedService } from '@shared_services/shared.service';
import { LoggerService } from '@shared_services/logger.service';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { AppointmentService } from '@core_services/master/appointment.service';
import { PatientService } from '@core_services/master/patient.service';
import { ConsultationService } from '@core_services/master/consultation.service'; // <-- Import ConsultationService
import { CookieService } from 'ngx-cookie-service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, AvatarModule, RouterModule],
  providers: [DatePipe],
  templateUrl: './doctor-dashboard.component.html',
  styleUrl: './doctor-dashboard.component.scss'
})
export class DoctorDashboardComponent implements OnInit {
  doctorName: string = '';
  doctorId: number = 0;
  branchId: number = 0;

  // KPI Stats
  todayAppointmentCount: number = 0;
  completedTodayCount: number = 0;
  activePatientsCount: number = 0;
  thisWeekCount: number = 0;

  // Lists
  todayAppointments: any[] = [];
  upcomingAppointments: any[] = [];
  todayPatients: any[] = [];
  recentNotes: any[] = [];

  // UI State
  activeTab: string = 'Schedule';
  tabs = ['Schedule', 'Patients', 'Tasks', 'Stats'];

  loading: boolean = false;

  constructor(
    private sharedService: SharedService,
    private loggerService: LoggerService,
    private datePipe: DatePipe,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private consultationService: ConsultationService, // <-- Inject here
    private cookieService: CookieService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');
    this.doctorId = Number.parseInt(this.cookieService.get('doctorId') ?? '0');

    const storedName = this.cookieService.get('doctorName');
    this.doctorName = storedName ? storedName : 'Doctor';

    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = this.datePipe.transform(today, 'yyyy-MM-dd') ?? '';

    this.appointmentService.getDoctorAppointments(this.branchId, todayStr).subscribe({
      next: (res: any) => {
        const allToday = res.data || [];
        const myTodayApps = allToday.filter((a: any) => a.doctorId === this.doctorId);

        this.todayAppointmentCount = myTodayApps.length;

        // Map Status instead of hardcoded 'Consultation'
        this.todayAppointments = myTodayApps.map((appt: any) => ({
          patientId: appt.patientId,
          patientName: appt.patientName || 'Unknown Patient',
          time: this.formatTime(appt.appointmentTime) || 'TBD',
          duration: '30 min',
          status: appt.appointmentStatus,
          urgent: false
        }));

        this.todayPatients = myTodayApps.map((appt: any) => ({
          patientId: appt.patientId,
          patientName: appt.patientName || 'Unknown Patient',
          gender: appt.gender || 'Unknown',
          status: appt.status || 'Pending'
        }));
      },
      error: (err) => this.loggerService.error("Failed to load today's appointments")
    });

    this.consultationService.get(this.branchId, this.doctorId).subscribe({
      next: (res: any) => {
        const allConsultations = res.data || [];

        this.completedTodayCount = allConsultations.filter((c: any) => {
          if (!c.visitDate) return false;
          const cDate = new Date(c.visitDate);
          cDate.setHours(0, 0, 0, 0);

          // Match today's date AND Completed status
          return cDate.getTime() === today.getTime() && c.status === 'Completed';
        }).length;

        this.recentNotes = allConsultations
          .filter((c: any) => c.notes && c.notes.trim() !== '') // Only get records with notes
          .sort((a: any, b: any) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()) // Newest first
          .slice(0, 5) // Get Top 5
          .map((c: any) => {
            const vDate = new Date(c.visitDate);
            return {
              consultationId: c.consultationId,
              patientId: c.patientId,
              patientName: c.patientName,
              relativeTime: this.getRelativeTimeText(vDate),
              note: c.notes
            };
          });
      },
      error: (err) => this.loggerService.error("Failed to load consultations")
    });

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

    this.patientService.get(this.branchId).subscribe({
      next: (res: any) => {
        const patients = res.data || [];
        this.activePatientsCount = patients.length;
      },
      error: (err) => this.loggerService.error("Failed to load patients"),
      complete: () => this.loading = false
    });
  }

  goToConsultation(patientId: string, status: string) {
    if (!patientId) return;

    if (status === 'Completed') {
      this.router.navigate(['/consultation'], {
      });
    } else {
      this.router.navigate(['/consultation'], {
        queryParams: { patientId: patientId }
      });
    }
  }

  goToPatientHistory(patientId: string) {
    if (patientId) {
      this.router.navigate(['/patient/detail', patientId]);
    }
  }

  editNote(consultationId: string, patientId: string) {
    // Route directly to edit mode
    this.router.navigate(['/consultation'], { queryParams: { patientId: patientId, action: 'edit' } });
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '';
    if (timeStr.includes('T')) {
      return this.datePipe.transform(timeStr, 'shortTime') || timeStr;
    }
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
}