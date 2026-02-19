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

import { ImageModule } from 'primeng/image';
import { SharedService } from '@shared_services/shared.service';

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
    private messgaeService: MessageService,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private loggerService: LoggerService,
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

  triggerPhotoInput(): void {
    this.photoInput.nativeElement.click();
  }

  triggerSignInput(): void {
    this.signInput.nativeElement.click();
  }

  onPhotoSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    // preview
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => this.imgSrc = reader.result as string;

    this.loading = true;
    const formData = new FormData();
    formData.append('photo', file);

    this.doctorService.uploadPhoto(this.doctorId, formData).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.success) {
          this.messgaeService.add({ key: 'globalMessage', severity: 'info', summary: 'Success', detail: res.message?.toString() });
          this.loadData();
        } else {
          const msg = res?.message ?? 'Unable to upload photo.';
          this.messgaeService.add({ severity: 'error', summary: 'Error', detail: msg });
        }
      },
      error: (err: any) => {
        this.loading = false;
        const msg = err?.error?.message ?? err?.message ?? 'An error occurred while uploading photo.';
        this.messgaeService.add({ severity: 'error', summary: 'Error', detail: msg });
      }
    });
  }


  onSignSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;

    this.loading = true;
    this.sharedService.convertBase64(file).subscribe((base64) => {
      this.signBase64String = base64;
      this.doctorService.uploadSign(this.doctorId, base64).subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res?.success) {
            this.messgaeService.add({ key: 'globalMessage', severity: 'info', summary: 'Success', detail: res.message?.toString() });
            this.loadData();
          } else {
            const msg = res?.message ?? 'Unable to upload sign.';
            this.messgaeService.add({ severity: 'error', summary: 'Error', detail: msg });
          }
        },
        error: (err: any) => {
          this.loading = false;
          const msg = err?.error?.message ?? err?.message ?? 'An error occurred while uploading sign.';
          this.messgaeService.add({ severity: 'error', summary: 'Error', detail: msg });
        }
      });
    });
  }

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
                this.messgaeService.add({ severity: 'success', summary: 'Success', detail: 'Schedule added successfully' });
                this.scheduleDialogVisible = false;
                this.loadSchedules();
              } else {
                const detailMsg = createRes?.message ?? createRes?.data ?? 'Unable to create schedule.';
                this.messgaeService.add({ severity: 'error', summary: 'Error', detail: detailMsg });
              }
            },
            error: (err: any) => {
              this.isSubmitting = false;
              const msg = err?.error?.message ?? err?.message ?? 'An error occurred while creating schedule.';
              this.messgaeService.add({ severity: 'error', summary: 'Error', detail: msg });
            }
          });

        } else {
          this.isSubmitting = false;
          const errMsg = res?.message ?? 'Unable to obtain schedule id.';
          this.messgaeService.add({ severity: 'error', summary: 'Error', detail: errMsg });
        }
      },
      error: (err: any) => {
        this.isSubmitting = false;
        const msg = err?.error?.message ?? err?.message ?? 'An error occurred while obtaining schedule id.';
        this.messgaeService.add({ severity: 'error', summary: 'Error', detail: msg });
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



}
