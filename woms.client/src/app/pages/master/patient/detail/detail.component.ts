import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';

// Models & Services
import { ViPatientModel } from '@core_models/master/patient.model';
import { ViAppointmentModel } from '@core_models/master/appointment.model';
import { ViConsultationModel } from '@core_models/master/consultation.model';
import { PatientService } from '@core_services/master/patient.service';
import { ConsultationService } from '@core_services/master/consultation.service';
import { AppointmentService } from '@core_services/master/appointment.service';
import { SharedService } from '@shared_services/shared.service';
import { LoggerService } from '@shared_services/logger.service';
import { MessageService } from 'primeng/api';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    TagModule,
    TabViewModule,
    DividerModule,
    ProgressSpinnerModule,
    TableModule,
    DialogModule
  ],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss'
})
export class PatientDetailComponent implements OnInit {
  patientId: string | null = null;
  patient: ViPatientModel | null = null;
  loading: boolean = true;

  appointments: ViAppointmentModel[] = [];
  consultations: ViConsultationModel[] = [];

  consultationPrescriptions: { [key: string]: any[] } = {};
  displayDetails: boolean = false;
  selectedConsult: ViConsultationModel | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private consultationService: ConsultationService,
    private appointmentService: AppointmentService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private loggerService: LoggerService
  ) { }

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id');

    if (this.patientId) {
      this.loadDashboardData(this.patientId);
    } else {
      this.messageService.add({ key: 'globalMessage', severity: 'error', summary: 'Error', detail: 'Invalid Patient ID' });
      this.router.navigate(['/patient']);
    }
  }

  loadDashboardData(id: string): void {
    this.loading = true;
    const branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');
    let doctorId = Number.parseInt((this.sharedService.getDoctorId() ?? "0"));
    forkJoin({
      patientReq: this.patientService.getById(id, branchId),
      appointmentReq: this.appointmentService.getByPatientId(id, branchId, doctorId),
      consultationReq: this.consultationService.getByPatientId(id, branchId, doctorId)
    }).subscribe({
      next: (res: any) => {
        // 1. Assign Patient Data
        this.patient = res.patientReq.data as ViPatientModel;

        // 2. Assign Appointments
        const appts = (res.appointmentReq.data || []) as ViAppointmentModel[];
        this.appointments = appts.sort((a, b) =>
          new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime()
        );

        // 3. Assign Consultations
        this.consultations = (res.consultationReq.data || []) as ViConsultationModel[];

        // 4. PRE-FETCH ALL PRESCRIPTIONS!
        // If there are consultations, map over them and fetch all their prescriptions at once
        if (this.consultations.length > 0) {
          const prescriptionRequests = this.consultations.map(c =>
            this.consultationService.getPrescriptionByConsultationId(c.consultationId)
          );

          forkJoin(prescriptionRequests).subscribe({
            next: (responses: any[]) => {
              // Map the responses back to their specific consultation IDs
              responses.forEach((pRes, index) => {
                const cId = this.consultations[index].consultationId;
                this.consultationPrescriptions[cId] = pRes.data?.prescriptions || [];
              });
            },
            error: () => this.loggerService.error('Failed to pre-load prescriptions.')
          });
        }
      },
      error: (err: any) => {
        this.loggerService.error(err);
        this.messageService.add({ key: 'globalMessage', severity: 'error', summary: 'Error', detail: 'Failed to load dashboard data.' });
        this.router.navigate(['/patient']);
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  viewDetails(consult: ViConsultationModel) {
    this.selectedConsult = consult;
    this.displayDetails = true;
  }

  get age(): number | null {
    if (!this.patient?.dob) return null;
    const birthDate = new Date(this.patient.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  getSeverity(status: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'confirmed':
      case 'active':
        return 'success';
      case 'scheduled':
      case 'pending':
        return 'info';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}