import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AppointmentModel, ViAppointmentModel } from '@core_models/master/appointment.model';
import { DoctorWithSchedules, ScheduleModel } from '@core_models/master/doctor.model';
import { ViPatientModel } from '@core_models/master/patient.model';
import { AppointmentService } from '@core_services/master/appointment.service';
import { DoctorService } from '@core_services/master/doctor.service';
import { PatientDropDownComponent } from '../../../shared/components/drop-down/patient-drop-down/patient-drop-down.component';
import { ExportService } from '@shared_services/export.service';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { DoctorDropDownComponent } from '@shared_component/drop-down/doctor-drop-down/doctor-drop-down.component';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-appointment',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
    DropdownModule,
    ConfirmDialogModule,
    DatePickerModule,
    SelectModule,
    PatientDropDownComponent,
    DoctorDropDownComponent,
    CalendarModule
  ],
  templateUrl: './appointment.component.html',
  providers: [ConfirmationService, ExportService, DatePipe],
})
export class AppointmentComponent implements OnInit {
  appointments: ViAppointmentModel[] = [];
  selectedAppointment!: AppointmentModel;

  schedules: ScheduleModel[] = [];
  selectedSchedule!: ScheduleModel;

  doctors: DoctorWithSchedules[] = [];
  selectedDoctor: DoctorWithSchedules | null = null;
  selectedAppointmentDate: Date = new Date();

  selectedPatient: ViPatientModel | null = null;

  items!: MenuItem[] | undefined;

  loadingDoctors: boolean = false;
  loading: boolean = false;
  isSubmitting: boolean = false;
  modalVisible: boolean = false;

  @ViewChild('nameInput') nameInput!: ElementRef;

  today: Date = new Date();

  private formBuilder = inject(FormBuilder);
  public appointmentForm: FormGroup = this.formBuilder.group({
    ano: [0, Validators.required],
    doctorId: [0, Validators.required],
    branchId: [0, Validators.required],
    appointmentDate: [new Date()],
    scheduleId: [null, Validators.required],
    patientId: [''],
    name: ['', Validators.required],
    phoneNo: new FormControl('', {
      validators: [Validators.required, Validators.pattern("^(0(1|9)[0-9]{7,9})$")]
    }),
    remark: [null as string | null],
  });

  constructor(
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private messageService: MessageService,
    private exportService: ExportService,
    private datePipe: DatePipe,
    private confirmationService: ConfirmationService,
    private loggerService: LoggerService,
    private sharedService: SharedService,
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

  ngOnInit(): void {
    this.loadData();
  }

  // #region Data Loading
  loadData(): void {
    if (this.loading) return;

    let branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? "0");
    let appointmentDate = this.datePipe.transform(this.selectedAppointmentDate, 'yyyy-MM-dd') ?? '';

    this.loading = true;

    this.appointmentService.getDoctorAppointments(
      branchId,
      appointmentDate
    ).subscribe({
      next: (res) => {
        this.appointments = res.data as ViAppointmentModel[];
        console.log('Loaded appointments:', this.appointments);
      },
      error: () => {
        this.loading = false;
        this.loggerService.error('Error fetching doctor appointments:');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // #endregion

  // #region CRUD Operations
  create(): void {
    this.appointmentForm.reset();
    this.selectedPatient = null;
    this.appointmentForm.controls['appointmentDate'].setValue(this.datePipe.transform(this.selectedAppointmentDate, 'yyyy-MM-dd'));

    let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));

    this.appointmentService.getAutoId(branchId).subscribe({
      next: (res) => {
        this.appointmentForm.controls['ano'].setValue(res.data as number);
        this.appointmentForm.controls['branchId'].setValue(branchId);
        this.modalVisible = true;
      },
    });
  }

  submit(): void {
    if (this.appointmentForm.valid && this.selectedSchedule) {
      this.isSubmitting = true;
      let model = this.appointmentForm.value as AppointmentModel;

      model.appointmentDate = this.datePipe.transform(this.selectedAppointmentDate, 'yyyy-MM-dd') ?? "";
      model.scheduleId = this.selectedSchedule.scheduleId;
      model.status = "Confirmed";
      this.appointmentService.create(model).subscribe({
        next: res => {
          this.modalVisible = false;
          this.loadData();
          this.messageService.add({ key: 'globalMessage', severity: 'success', summary: 'Success', detail: res.message.en });
        },
        error: err => {
          this.messageService.add({
            key: 'globalMessage',
            severity: 'warn',
            summary: 'Booking Failed',
            detail: err.error.message.en || "Could not complete booking."
          });
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
          this.loadData();
        }
      })
    } else {
      Object.keys(this.appointmentForm.controls).forEach(field => {
        let control = this.appointmentForm.get(field);
        control?.markAsDirty({ onlySelf: true })
      });
    }
  }

  delete(): void {
    if (this.selectedAppointment != null) {
      this.confirmationService.confirm({
        message: 'Are You Sure Want To Delete?',
        header: 'Delete Confirmation',
        icon: 'pi pi-info-circle',
        accept: () => {
          const ano = this.selectedAppointment.ano;
          const branchId = this.selectedAppointment.branchId;

          this.appointmentService.delete(ano, branchId).subscribe({
            next: (res) => {
              this.messageService.add({
                key: 'globalMessage',
                severity: 'success',
                summary: 'Confirmed',
                detail: res.message.en,
              });
              this.loadData();
              this.selectedAppointment = null as any;
            },
            error: () => {
              this.loading = false;
            },
            complete: () => {
              this.loading = false;
            },
          });
        },
        reject: () => {
          this.selectedAppointment = null as any;
        },
        key: 'AppointmentDeleteDialog',
      });
    } else {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please choose Appointment.',
      });
    }
  }
  // #endregion

  // #region Export
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
// #endregion

// #region UI & Event Handlers

onPatientChange(): void {
  if(this.selectedPatient) {
  this.appointmentForm.get('patientId')?.setValue(this.selectedPatient.patientId);
  this.appointmentForm.get('name')?.setValue(this.selectedPatient.name);
  this.appointmentForm.get('phoneNo')?.setValue(this.selectedPatient.phone);
} else {
  this.appointmentForm.get('patientId')?.setValue('');
  this.appointmentForm.get('name')?.setValue('');
  this.appointmentForm.get('phoneNo')?.setValue('');
}
  }

clearSelection(): void {
  this.selectedAppointment = null as any;
}

setAutoFocus() {
  setTimeout(() => {
    this.nameInput?.nativeElement?.focus();
  }, 0);
}

preventNegativeInput($event: KeyboardEvent): void {
  let inputChar = $event.key;
  if(inputChar === '-' || inputChar === 'e') {
  $event.preventDefault();
}
  }
// #endregion

// #region Helpers

OnDoctorChange(event: any): void {
  this.schedules = [];
  this.loggerService.info("Doctor changed");
  this.selectedSchedule = null as any;
  if(this.selectedDoctor) {
  this.appointmentForm.get('doctorId')?.setValue(this.selectedDoctor.doctorId);
  this.GetDutytime(this.selectedAppointmentDate);
} else {
  this.appointmentForm.get('doctorId')?.setValue(null);
}
  }

selectSchedule(slot: any) {
  this.selectedSchedule = slot;
  // If you want to store the scheduleId in your Reactive Form:
  this.appointmentForm.patchValue({ scheduleId: slot.scheduleId });
}

GetDutytime(selectedDate: Date): void {
  if(!selectedDate || !this.selectedDoctor) return;

// Ensure we have a clean string for day of week
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const dayOfWeek = days[selectedDate.getDay()];

const branchId = Number(this.sharedService.getDefaultBranchId() ?? 0);
const doctorId = Number(this.selectedDoctor.doctorId);

this.doctorService.getScheduleByDoctorDay(doctorId, dayOfWeek, branchId).subscribe({
  next: (res) => {
    const data = res?.data ?? [];
    this.schedules = Array.isArray(data)
      ? data.filter((s: any) => s.doctorId == doctorId)
      : [];
  }
});
  }

getSeverity(status: string) {
  if (!status) return 'secondary';

  switch (status.toLowerCase()) {
    case 'confirmed': return 'info';
    case 'completed': return 'success';
    case 'cancelled': return 'danger';
    default: return 'secondary';
  }
}

getIcon(status: string) {
  if (!status) return 'pi pi-question-circle';

  switch (status.toLowerCase()) {
    case 'confirmed': return 'pi pi-clock';
    case 'completed': return 'pi pi-check-circle';
    case 'cancelled': return 'pi pi-times-circle';
    default: return 'pi pi-question-circle';
  }
}
  // #endregion
}
