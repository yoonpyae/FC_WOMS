import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DoctorModel } from '@core_models/master/doctor.model';
import { DoctorService } from '@core_services/master/doctor.service';
import { LoggerService } from '@shared_services/logger.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CalendarModule } from 'primeng/calendar';
import { SharedService } from '@shared_services/shared.service';
import { TimeFormatPipe } from 'src/app/shared/pipes/time-format.pipe';
import { ExportService } from '@shared_services/export.service';
import { AvatarModule } from 'primeng/avatar';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-doctor',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,


    //primeNg
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
    CalendarModule,
    AvatarModule,

  ],
  templateUrl: './doctor.component.html',
  providers: [
    ConfirmationService,
    DatePipe,
    TimeFormatPipe,
    ExportService,
  ],
})
export class DoctorComponent implements OnInit {
  doctor: DoctorModel[] = [];
  selectedDoctor!: DoctorModel;

  items!: MenuItem[] | undefined;
  time: Date[] | undefined;

  loading = false;
  isEdit = false;
  modalVisible = false;
  isSubmitting: boolean = false;

  constructor(
    private doctorService: DoctorService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private loggerService: LoggerService,
    private sharedService: SharedService,
    private exportService: ExportService,
  ) {
    this.items = [
      {
        label: 'Edit',
        icon: 'pi pi-pen-to-square',
        command: () => this.update()
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.delete()
      },
      {
        label: 'Excel',
        icon: 'pi pi-file-excel',
        command: () => this.excel()
      }
    ];
  }

  private formBuilder = inject(FormBuilder);
  public doctorForm: FormGroup = this.formBuilder.group({
    doctorId: [0],
    branchId: [0],
    id: [''],
    name: ['', Validators.required],
    degree: ['', Validators.required],
    specialized: ['', Validators.required],
    photo: [''],
    sign: [''],
    consultantFee: [0, [Validators.required, Validators.min(0)]],
    ecgfee: [0, [Validators.required, Validators.min(0)]],
    xrayFee: [0, [Validators.required, Validators.min(0)]],
    ultrasoundFee: [0, [Validators.required, Validators.min(0)]],
    createdOn: [''],
    createdBy: [''],
    updatedOn: [''],
    updatedBy: [''],
    deletedOn: [''],
    deletedBy: [''],
    status: [false],
    remark: [''],
  });


  get f() { return this.doctorForm.controls; }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    if (!branchId) {
      this.messageService.add({ key: 'globalMessage', severity: 'error', summary: 'Error', detail: 'Invalid Branch Selected.' });
      return;
    }

    this.loading = true;
    this.doctorService.get(branchId).subscribe({
      next: (res) => {
        this.doctor = res.data as DoctorModel[];
      },
      error: err => {
        this.loggerService.error(err);
        this.messageService.add({ key: 'globalMessage', severity: 'error', summary: 'Error', detail: 'Failed to load doctors.' });
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  create(): void {
    let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));

    this.isEdit = false;
    this.modalVisible = true;

    // Fully reset form state and validations
    this.doctorForm.reset({
      doctorId: 0,
      id: '',
      branchId: branchId,
      status: true,
      consultantFee: 0,
      ecgfee: 0,
      xrayFee: 0,
      ultrasoundFee: 0
    });
    this.doctorForm.markAsUntouched();
    this.doctorForm.markAsPristine();
  }

  update(): void {
    if (this.selectedDoctor) {
      this.isEdit = true;
      this.doctorForm.reset();
      this.doctorForm.patchValue(this.selectedDoctor);
      this.modalVisible = true;
    } else {
      this.modalVisible = false;
      this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: "Please choose a Doctor from the table first." });
    }
  }

  delete(): void {
    if (this.selectedDoctor != null) {
      this.confirmationService.confirm({
        message: 'Are You Sure Want To Delete?',
        header: 'Delete Confirmation',
        icon: 'pi pi-info-circle',
        accept: () => {
          this.doctorService.delete(this.selectedDoctor.doctorId).subscribe({
            next: res => {
              this.messageService.add({ key: 'globalMessage', severity: 'success', summary: 'Confirmed', detail: res.message.en });
              this.loadData();
              this.selectedDoctor = null as any;
            },
            complete: () => {
              this.loading = false;
            }
          });
        },
        reject: () => {
          this.selectedDoctor = null as any;
        },
        key: 'doctorDeleteDialog'
      });
    } else {
      this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: 'Please choose Doctor.' });
    }
  }

  excel(): void {
    let exportData = this.selectedDoctor ? [this.selectedDoctor] : this.doctor;

    if (exportData.length === 0) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'No data available to export!',
      });
      return;
    }

    // Define the columns to be exported
    const columns = [
      { key: 'doctorId', value: 'Doctor ID' },
      { key: 'branchId', value: 'Hospital ID' },
      { key: 'name', value: 'Doctor Name' },
      { key: 'degree', value: 'Degree' },
      { key: 'specialized', value: 'Specialized' },
      { key: 'ecgfee', value: 'ECG Fee' },
      { key: 'xrayFee', value: 'X-Ray Fee' },
      { key: 'ultrasoundFee', value: 'Ultrasound Fee' },
      { key: 'status', value: 'Status' },
      { key: 'createdOn', value: 'Created On' },
      { key: 'createdBy', value: 'Created By' },
      { key: 'updatedOn', value: 'Updated On' },
      { key: 'updatedBy', value: 'Updated By' },
    ];

    // Use exportSelectColsWithDynamicHeader for exporting data
    this.exportService.exportSelectColsWithDynamicHeader(exportData, columns, 'Doctor');
  }

  clearSection(): void {
    this.selectedDoctor = null as any;
  }

  submit(): void {
    if (this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched(); // Trigger all UI red text
      this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Validation Error', detail: 'Please fill all required fields correctly.' });
      return;
    }

    const model = this.doctorForm.value as DoctorModel;
    const branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    model.branchId = branchId;

    this.isSubmitting = true;

    const request$ = this.isEdit
      ? this.doctorService.update(model)
      : this.doctorService.create(model);

    request$.subscribe({
      next: res => {
        this.modalVisible = false;
        this.loadData();
        this.messageService.add({ key: 'globalMessage', severity: 'success', summary: 'Success', detail: res.message.en });
      },
      error: err => {
        this.loggerService.error(err);

        // Bulletproof error extraction
        let errorMsg = 'Operation failed.';
        if (err.error.message.en) errorMsg = err.error.message.en;
        else if (err.message.en) errorMsg = err.message.en;
        else if (typeof err.error.message === 'string') errorMsg = err.error.message;
        else if (typeof err.error === 'string') errorMsg = err.error;

        this.messageService.add({ key: 'globalMessage', severity: 'error', summary: 'Error', detail: errorMsg });
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
        this.selectedDoctor = null as any;
      }
    });
  }

  //#region Event Method

  preventNegativeInput($event: KeyboardEvent) {
    const inputChar = $event.key;
    if (inputChar === '-' || inputChar === 'e') {
      $event.preventDefault();
    }
  }

  onCancel() {
    this.doctorForm.reset();
    this.modalVisible = false;
    this.isSubmitting = false;
  }

  onFileChange(event: any, field: 'photo' | 'sign') {
    const file = event.target.files[0];
    if (file) {
      this.doctorForm.patchValue({
        [field]: file
      });
    }
  }

  //#endregion
}  
