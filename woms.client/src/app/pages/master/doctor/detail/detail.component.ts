import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DoctorModel } from '@core_models/master/doctor.model';
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
  imgBase64String: string | undefined;
  imgSrc: string | undefined = undefined;
  imgName: string = 'None';
  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImgBase64: any[]=[];

  paramValue!: string | '';
  doctorId: number = 0;
  doctor: DoctorModel = {
    doctorId: 0,
    branchId: 0,
    name: "",
    degree: null,
    spalized: null,
    photo: null,
    sign: null,
    referFee: null,
    opdreferFee: null,
    consultantFee: null,
    ecgfee: null,
    xrayFee: null,
    ultrasoundFee: null,
    roundFee: null,
    monTime: "",
    tueTime: "",
    wedTime: "",
    thuTime: "",
    friTime: "",
    satTime: "",
    sunTime: "",
    createdOn: '',
    createdBy: '',
    updatedOn: '',
    updatedBy: '',
    deletedOn: null,
    deletedBy: null,
    status: null,
    remark: null
  };
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
    this.doctorService.getById(this.doctorId,branchId).subscribe({
      next: (res) => {
        this.doctor = res.data;
        this.loggerService.info(this.doctorId)


        this.loading = false;

      },
      error: err => { },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onImportImg(): void {
    this.img.nativeElement.click();
  }

  onImgChange(event: any): void {
    if (this.img.nativeElement.value === '') {
      this.imgName = 'None';
      return;
    }

    const file: File = event.target.files[0];
    if (file) {
      this.imgName = file.name; // Update image name

      const reader = new FileReader();

      // Convert file to base64 and log it
      this.sharedService.convertBase64(file).subscribe((base64) => {
        this.imgBase64String = base64;
        this.loggerService.info(this.imgBase64String); // Log the base64 string
      });

      // Show image preview
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgSrc = reader.result as string; // Set the image source for preview
      };
    }
  }

  onUploadImg(): void {
    if (!this.imgBase64String) {
      this.messgaeService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select an image to upload.' });
      return;
    }

    // Create the model object to send to the API
    this.loading = true;

    // Call the API to upload the image
    this.doctorService.uploadSign(this.doctorId, this.imgBase64String).subscribe({
      next: (res) => {
        if (res.success) {
          this.messgaeService.add({ key: 'globalMessage', severity: 'info', summary: 'Success', detail: res.message.toString() });
          this.loadData();  // Optionally reload data after success
        }
        this.loading = false;
      },
      error: (_) => {
      },
    });
  }

  OnUploadProfile():void{
    if (!this.imgBase64String) {
      this.messgaeService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select an image to upload.' });
      return;
    }

    // Create the model object to send to the API
    this.loading = true;

    // Call the API to upload the image
    this.doctorService.uploadPhoto(this.doctorId, this.imgBase64String).subscribe({
      next: (res) => {
        if (res.success) {
          this.messgaeService.add({ key: 'globalMessage', severity: 'info', summary: 'Success', detail: res.message.toString() });
          this.loadData();  // Optionally reload data after success
        }
        this.loading = false;
      },
      error: (_) => {
      },
    });
  }

}
