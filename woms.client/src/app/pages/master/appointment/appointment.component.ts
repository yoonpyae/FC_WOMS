import { CommonModule, DatePipe } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { AppointmentModel } from '@core_models/master/appointment.model';
import { DoctorModel } from '@core_models/master/doctor.model';
import { AppointmentService } from '@core_services/master/appointment.service';
import { DoctorService } from '@core_services/master/doctor.service';
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
    ConfirmDialogModule,
    DatePickerModule,
    SelectModule
  ],
  templateUrl: './appointment.component.html',
  providers: [ConfirmationService, ExportService, DatePipe],
})
export class AppointmentComponent implements OnInit {
  appointments: AppointmentModel[] = [];
  selectedAppointment!: AppointmentModel;

  doctors: DoctorModel[] = [];
  selectedDoctor: DoctorModel | null = null;
  selectedAppointmentDate: Date | null = null;

  items!: MenuItem[] | undefined;

  loadingDoctors: boolean = false;
  loading: boolean = false;
  isSubmitting: boolean = false;
  modalVisible: boolean = false;

  @ViewChild('nameInput') nameInput!: ElementRef;

  today!: any;
  minAppointmentDate: Date = new Date();

  private formBuilder = inject(FormBuilder);
  public appointmentForm: FormGroup = this.formBuilder.group({
    ano: [0, Validators.required],
    doctorId: [0, Validators.required],
    branchId: [0, Validators.required],
    appointmentDate: [new Date()],
    patientId: [''],
    name: ['', Validators.required],
    phoneNo: new FormControl('', {
      validators: [Validators.required, Validators.pattern("^(0(1|9)[0-9]{7,9})$")]
    }),
    status: [true],
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

    if (!this.selectedAppointmentDate || !this.selectedDoctor) {
      this.appointments = [];
      return;
    }

    let branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? "0");
    let doctorId = this.selectedDoctor.doctorId;
    let appointmentDate = this.datePipe.transform(this.selectedAppointmentDate, 'yyyy-MM-dd') ?? '';

    this.loading = true;

    this.appointmentService.getDoctorAppointments(
      branchId,
      doctorId,
      appointmentDate
    ).subscribe({
      next: (res) => {
        this.appointments = res.data as AppointmentModel[];
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

  getDoctors(): void {
    let branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');
    this.loadingDoctors = true;

    this.doctorService.get(branchId).subscribe({
      next: (res) => {
        this.doctors = res.data as DoctorModel[];
        this.selectedDoctor = this.doctors.find(
          x => x.doctorId == this.appointmentForm.controls['doctorId'].value
        )!;
        this.onDoctorChange();
      },
      error: () => {
        this.loadingDoctors = false;
      },
      complete: () => {
        this.loadingDoctors = false;
      }
    });
  }
  // #endregion

  // #region CRUD Operations
  create(): void {
    if (!this.selectedAppointmentDate || !this.selectedDoctor) {
      this.modalVisible = false;
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select both a date and a doctor before creating an appointment.',
      });
      return;
    }

    this.appointmentForm.reset();
    this.appointmentForm.controls['doctorId'].setValue(this.selectedDoctor?.doctorId ?? 0);
    this.appointmentForm.controls['appointmentDate'].setValue(this.datePipe.transform(this.selectedAppointmentDate, 'yyyy-MM-dd'));

    let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));

    this.appointmentService.getAutoId(branchId).subscribe({
      next: (res) => {
        this.appointmentForm.controls['ano'].setValue(res.data as number);
        this.appointmentForm.controls['branchId'].setValue(branchId);
        this.appointmentForm.controls['status'].setValue(true);
        this.modalVisible = true;
      },
    });
  }

  submit(): void {
    if (this.appointmentForm.valid) {
      this.isSubmitting = true;
      this.loggerService.info(this.selectedAppointment);
      let model = this.appointmentForm.value as AppointmentModel;
      model.appointmentDate = this.datePipe.transform(this.appointmentForm.controls['appointmentDate'].value, 'yyyy-MM-dd') ?? "";
      model.doctorId = this.selectedDoctor?.doctorId ?? 0;
      this.appointmentService.create(model).subscribe({
        next: res => {
          this.modalVisible = false;
          this.loadData();
          this.messageService.add({ key: 'globalMessage', severity: 'success', summary: 'Success', detail: res.message.en });
        },
        error: err => {
          this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: err.message.en });
          this.isSubmitting = false;
        },
        complete: () => {
          this.isSubmitting = false;
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
          this.appointmentService.delete(this.selectedAppointment.ano).subscribe({
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
    let exportData = this.selectedAppointment ? [this.selectedAppointment] : this.appointments;

    if (exportData.length === 0) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'No data available to export!',
      });
      return;
    }

    let columns = [
      { key: 'ano', value: 'Appointment Number' },
      { key: 'name', value: 'Name' },
      { key: 'phoneNo', value: 'Phone Number' },
      { key: 'appointmentDate', value: 'Appointment Date' },
      { key: 'doctorId', value: 'Doctor ID' },
      { key: 'doctorName', value: 'DoctorName' },
      { key: 'createdOn', value: 'Created On' },
      { key: 'createdBy', value: 'Created By' },
      { key: 'updatedOn', value: 'Updated On' },
      { key: 'updatedBy', value: 'Updated By' },
      { key: 'status', value: 'Status' },
      { key: 'remark', value: 'Remark' },
    ];

    this.exportService.exportSelectColsWithDynamicHeader(exportData, columns, 'Appointment');
  }
  // #endregion

   // #region UI & Event Handlers
  onAppointmentDateChange(event: any): void {
    let selectedDate: Date | null = null;

    if (event instanceof Date && !isNaN(event.getTime())) {
      selectedDate = event;
    } else if (typeof event === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(event)) {
      selectedDate = new Date(event);
    }

    this.selectedAppointmentDate = selectedDate;

    if (!selectedDate) {
      this.doctors = [];
      this.selectedDoctor = null;
      this.appointmentForm.get('doctorId')?.setValue(null);
      this.appointments = [];
      return;
    }

    this.appointmentForm.get('appointmentDate')?.setValue(this.datePipe.transform(selectedDate, 'yyyy-MM-dd'));

    let branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? "0");
    let dayOfWeek = new Date(selectedDate).getDay();
    this.appointmentService.getDoctorsOnDuty(branchId, dayOfWeek).subscribe({
      next: (res) => {
        this.doctors = res.data as DoctorModel[];
        this.selectedDoctor = null;
        this.appointments = [];
      },
      error: () => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onDoctorChange(): void {
    if (this.selectedDoctor) {
      this.appointmentForm.get('doctorId')?.setValue(this.selectedDoctor.doctorId);
    }

    if (this.selectedDoctor && this.selectedAppointmentDate) {
    } else {
      this.appointments = [];
    }
  }

  onViewClick(): void {
    if (!this.selectedAppointmentDate && !this.selectedDoctor) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select both a date and a doctor before viewing Appointments.',
      });
    }
    else if (!this.selectedAppointmentDate) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a date before viewing Appointments.',
      });
    }
    else if (!this.selectedDoctor) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a doctor before viewing Appointments.',
      });
    }
    else {
      this.loadData();
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
    if (inputChar === '-' || inputChar === 'e') {
      $event.preventDefault();
    }
  }
  // #endregion

  // #region Helpers
  getDoctorDutyTime(doctor: DoctorModel): string {
    if (!this.selectedAppointmentDate) return '';

    let date = new Date(this.selectedAppointmentDate);
    let dayOfWeek = date.getDay(); // 0 (Sunday) to 6 (Saturday)

    switch (dayOfWeek) {
      case 0: return doctor.sunTime || '';
      case 1: return doctor.monTime || '';
      case 2: return doctor.tueTime || '';
      case 3: return doctor.wedTime || '';
      case 4: return doctor.thuTime || '';
      case 5: return doctor.friTime || '';
      case 6: return doctor.satTime || '';
      default: return '';
    }
  }
  // #endregion
}
