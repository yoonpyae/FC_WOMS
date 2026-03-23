import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DoctorModel, ScheduleModel } from '@core_models/master/doctor.model';
import { DoctorService } from '@core_services/master/doctor.service';
import { LoggerService } from '@shared_services/logger.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { ExportService } from '@shared_services/export.service';
import { Location } from '@angular/common';
import { ImageModule } from 'primeng/image';
import { SharedService } from '@shared_services/shared.service';
import { environment } from '@env/environment';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-detail',
  imports: [
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    //primeNg
    ToastModule,
    ButtonModule,
    InputTextModule,
    InputIconModule,
    ToggleSwitchModule,
    IconFieldModule,
    TagModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    DatePickerModule,
    AvatarModule,
    FieldsetModule,
    FileUploadModule,
    ImageModule,
    SelectModule
  ],
  templateUrl: './detail.component.html',
  providers: [
    MessageService,
    ConfirmationService,
    LoggerService,
    ExportService
  ]
})
export class DetailComponent implements OnInit {
  @ViewChild('img') img!: ElementRef<HTMLInputElement>;
  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;
  @ViewChild('signInput') signInput!: ElementRef<HTMLInputElement>;
  imgBase64String: string | undefined;
  photoBase64String: string | undefined;
  signBase64String: string | undefined;
  imgSrc: string | undefined = undefined;
  imgName: string = 'None';
  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImgBase64: any[] = [];
  apiUrl = environment.web_url;
  paramValue!: string | '';
  doctor!: DoctorModel;
  doctorId: number = 0;

  @Output() submitEvent = new EventEmitter();
  activateStatus: boolean = false;
  loading = false;
  isSubmitting: boolean = false;
  files: any[] = [];
  fileBase64String: any;
  isFileSelected: boolean = false;
  photo: string = '';
  imageVisible: boolean = false;
  readonly DEFAULT_IMAGE_URL: string = 'images/thumbnail.jpg';
  selectedDoctor!: DoctorModel;
  uploadVisible: boolean = false;

  photoFile: any;

  schedules: ScheduleModel[] = [];
  scheduleDialogVisible = false;

  newSchedule: ScheduleModel = {
    scheduleId: 0,
    doctorId: 0,
    branchId: 0,
    dayOfWeek: '',
    startTime: '',
    endTime: '',
    maxPatient: 10,
    status: true
  };

  days = [
    { label: 'Monday', value: 'Monday' },
    { label: 'Tuesday', value: 'Tuesday' },
    { label: 'Wednesday', value: 'Wednesday' },
    { label: 'Thursday', value: 'Thursday' },
    { label: 'Friday', value: 'Friday' },
    { label: 'Saturday', value: 'Saturday' },
    { label: 'Sunday', value: 'Sunday' }
  ];

  startTimeUI: Date | null = null;
  endTimeUI: Date | null = null;
  isEditSchedule: boolean = false;

  attachModal: boolean = false;
  constructor(
    private doctorService: DoctorService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private loggerService: LoggerService,
    private location: Location
  ) {
  }

  ngOnInit(): void {

    this.loadData()
  }
  loadData(): void {
    let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    this.loading = true;

    const routeId = this.route.snapshot.paramMap.get('id');
    this.doctorId = routeId ? parseInt(routeId) : 0;
    this.doctorService.getById(this.doctorId, branchId).subscribe({
      next: (res) => {
        this.doctor = res.data as DoctorModel;
        this.loading = false;
      },
      error: err => { },
      complete: () => {
        this.loading = false;
        // load schedules after doctor is loaded
        this.loadSchedules();
      }
    });
  }


  openScheduleDialog(): void {
    this.scheduleDialogVisible = true;
    this.isEditSchedule = false;

    this.startTimeUI = null;
    this.endTimeUI = null;

    this.newSchedule = {
      scheduleId: 0,
      doctorId: this.doctorId,
      branchId: Number.parseInt(this.sharedService.getDefaultBranchId() ?? "0"),
      dayOfWeek: 'Monday', // Default to Monday
      startTime: '',
      endTime: '',
      maxPatient: 10,
      status: true
    };
  }

  parseTime(timeStr: string): Date | null {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':');
    const d = new Date();
    d.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    return d;
  }

  saveSchedule(): void {
    if (!this.newSchedule.dayOfWeek) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please select a Day.' });
      return;
    }
    if (!this.startTimeUI || !this.endTimeUI) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please provide both Start and End times.' });
      return;
    }
    if (this.startTimeUI >= this.endTimeUI) {
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Start time must be before End time.' });
      return;
    }

    this.isSubmitting = true;

    const formatTime = (date: Date) => {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    };

    // Update the row directly
    this.newSchedule.startTime = formatTime(this.startTimeUI);
    this.newSchedule.endTime = formatTime(this.endTimeUI);

    // Send the raw object back to the server
    const request$ = this.isEditSchedule
      ? this.doctorService.updateSchedule(this.newSchedule) 
      : this.doctorService.createSchedule(this.newSchedule);

    request$.subscribe({
      next: (res: any) => {
        const msg = this.isEditSchedule ? 'Schedule updated successfully.' : 'Schedule added successfully.';
        this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
        this.scheduleDialogVisible = false;
        this.loadSchedules();
      },
      error: (err: any) => {
        // This will display the EXACT string error from C#
        let errorMsg = 'Unable to save schedule.';
        if (err.error.message.en) errorMsg = err.error.message.en;
        else if (err.error.message) errorMsg = err.error.message;
        else if (typeof err.error === 'string') errorMsg = err.error;

        this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMsg });
        this.isSubmitting = false; 
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  formatTo12Hour(timeString: string): string {
    if (!timeString) return '';
    const parts = timeString.split(':');
    if (parts.length < 2) return timeString;

    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${hours}:${minutes} ${ampm}`;
  }

  // Hook up the delete button!
  deleteSchedule(schedule: ScheduleModel): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the schedule for ${schedule.dayOfWeek}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? "0");
        this.doctorService.deleteSchedule(schedule.scheduleId, branchId).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Schedule removed.' });
            this.loadSchedules();
          },
          error: (err) => {
            let errorMsg = err.error.message.en || 'Failed to delete schedule.';
            this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMsg });
          }
        });
      }
    });
  }

  loadSchedules(): void {
    const branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? "0");
    this.doctorService.getByDoctor(this.doctorId, branchId).subscribe({
      next: (res) => {
        const data = res?.data ?? [];
        this.schedules = Array.isArray(data) ? data.filter((s: any) => (s.doctorId == this.doctorId)) : [];
      }
    });
  }

  goBack() {
    this.location.back();
  }

}
