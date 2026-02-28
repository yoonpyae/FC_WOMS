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
    ImageModule
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


  attachModal: boolean = false;
  constructor(
    private doctorService: DoctorService,
    private messageService: MessageService,
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

    this.doctorId = parseInt(this.route.snapshot.paramMap.get('id') ?? '');
    this.doctorService.getById(this.doctorId, branchId).subscribe({
      next: (res) => {
        this.doctor = res.data;
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

 //#region Profile Photo

  onSelectedPhotos(event: any) {
    this.files = event.currentFiles.filter((file: File) => {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        this.messageService.add({
          key: 'globalMessage',
          severity: 'error',
          summary: 'Error',
          detail: `File ${file.name} exceeds the 2MB limit.`,
        });
        return false;
      }
      return true;
    });

    if (this.files && this.files.length > 0) {
      this.isFileSelected = true;
      this.files.forEach((file: File) => {
        this.loggerService.info(this.files);
      });
    }
  }

  choose(event: any, callback: Function) {
    callback();
  }

  importPhoto(clearCallback: Function): void {
    if (!this.selectedDoctor || this.files.length === 0) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a photo before uploading.',
      });
      return;
    }
    this.loading = true;
    const selectedFile = this.files[0]; // Get the first selected file

    this.doctorService.uploadPhoto(this.selectedDoctor.doctorId, selectedFile).subscribe({
      next: () => {
        this.messageService.add({
          key: 'globalMessage',
          severity: 'success',
          summary: 'Success',
          detail: 'File uploaded successfully.',
        });
        this.uploadVisible = false;
        this.loadData();
        this.loading = false;
        clearCallback(); // Call clearCallback after successful upload
      },
      error: (err) => {
        this.messageService.add({
          key: 'globalMessage',
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'File upload failed.',
        });
        this.loading = false;
      },
    });
  }

  upload(rowData: any): void {
    this.selectedDoctor = rowData;
    this.loggerService.info(rowData);
    this.uploadVisible = true;
  }

  // #endregion

  openScheduleDialog(): void {
    this.scheduleDialogVisible = true;
    this.newSchedule = {
      scheduleId: 0,
      doctorId: this.doctorId,
      branchId: Number.parseInt(this.sharedService.getDefaultBranchId() ?? "0"),
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      maxPatient: 10,
      status: true
    };
  }

  saveSchedule(): void {
    const branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');
    this.isSubmitting = true;

    // First get an auto-generated schedule id from the server
    this.doctorService.getScheduleAutoId(branchId).subscribe({
      next: (res: any) => {
        if (res && res.success) {
          // server may return an object or a plain value in data
          const autoId = (res.data && res.data.scheduleId) ? res.data.scheduleId : (res.data ?? 0);
          this.newSchedule.scheduleId = autoId;

          // now create the schedule
          this.doctorService.createSchedule(this.newSchedule).subscribe({
            next: (createRes: any) => {
              this.isSubmitting = false;
              if (createRes && createRes.success) {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Schedule added successfully' });
                this.scheduleDialogVisible = false;
                this.loadSchedules();
              } else {
                const detailMsg = createRes?.message ?? createRes?.data ?? 'Unable to create schedule.';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: detailMsg });
              }
            },
            error: (err: any) => {
              this.isSubmitting = false;
              const msg = err?.error?.message ?? err?.message ?? 'An error occurred while creating schedule.';
              this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
            }
          });

        } else {
          this.isSubmitting = false;
          const errMsg = res?.message ?? 'Unable to obtain schedule id.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: errMsg });
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        const msg = err?.error?.message ?? err?.message ?? 'An error occurred while obtaining schedule id.';
        this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }

  loadSchedules(): void {
    const branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? "0");

    // getByDoctor expects (doctorId, branchId)
    this.doctorService.getByDoctor(this.doctorId, branchId).subscribe({
      next: (res) => {
        const data = res?.data ?? [];
        // Defensive: backend may return schedules for whole branch; ensure only this doctor's schedules are shown
        this.schedules = Array.isArray(data) ? data.filter((s: any) => (s.doctorId == this.doctorId || s.doctorId == Number(this.doctorId))) : [];
      }
    });
  }

  goBack() {
    this.location.back();
  }

}
