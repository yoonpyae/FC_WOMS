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
    private timeFormatPipe: TimeFormatPipe,
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
    name: ['', Validators.required],
    degree: ['', Validators.required],
    spalized: ['', Validators.required],
    photo: [''],
    sign: [''],

    referFee: [0, [Validators.required, Validators.min(0)]],
    opdreferFee: [0, [Validators.required, Validators.min(0)]],
    consultantFee: [0, [Validators.required, Validators.min(0)]],
    ecgfee: [0, [Validators.required, Validators.min(0)]],
    xrayFee: [0, [Validators.required, Validators.min(0)]],
    ultrasoundFee: [0, [Validators.required, Validators.min(0)]],
    roundFee: [0, [Validators.required, Validators.min(0)]],

    isMonday: [false],
    _1MonDayStartHour: [{ value: '', disabled: true }, Validators.required],
    _1MonDayEndHour: [{ value: '', disabled: true }, Validators.required],

    isTuesday: [false],
    _2TueDayStartHour: [{ value: '', disabled: true }, Validators.required],
    _2TueDayEndHour: [{ value: '', disabled: true }, Validators.required],

    isWednesday: [false],
    _3WedDayStartHour: [{ value: '', disabled: true }, Validators.required],
    _3WedDayEndHour: [{ value: '', disabled: true }, Validators.required],

    isThursday: [false],
    _4ThuDayStartHour: [{ value: '', disabled: true }, Validators.required],
    _4ThuDayEndHour: [{ value: '', disabled: true }, Validators.required],

    isFriday: [false],
    _5FriDayStartHour: [{ value: '', disabled: true }, Validators.required],
    _5FriDayEndHour: [{ value: '', disabled: true }, Validators.required],

    isSaturday: [false],
    _6SatDayStartHour: [{ value: '', disabled: true }, Validators.required],
    _6SatDayEndHour: [{ value: '', disabled: true }, Validators.required],

    isSunday: [false],
    _7SunDayStartHour: [{ value: '', disabled: true }, Validators.required],
    _7SunDayEndHour: [{ value: '', disabled: true }, Validators.required],

    createdOn: [''],
    createdBy: [''],
    updatedOn: [''],
    updatedBy: [''],
    deletedOn: [''],
    deletedBy: [''],
    status: [false],
    remark: [''],
  });


  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    this.loading = true;
    this.doctorService.get(branchId).subscribe({
      next: (res) => {
        this.doctor = res.data as DoctorModel[];
        this.loading = false;

        this.loggerService.info(this.doctor)
      },
      error: err => { },
      complete: () => {
        this.loading = false;
      }
    });
  }

  create(): void {
    let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    this.doctorService.getAutoId(branchId).subscribe({
      next: (res) => {
        this.doctorForm.reset();
        this.doctorForm.controls['referFee'].setValue(0);
        this.doctorForm.controls['opdreferFee'].setValue(0);
        this.doctorForm.controls['consultantFee'].setValue(0);
        this.doctorForm.controls['ecgfee'].setValue(0);
        this.doctorForm.controls['xrayFee'].setValue(0);
        this.doctorForm.controls['roundFee'].setValue(0);
        this.doctorForm.controls['ultrasoundFee'].setValue(0);
        this.doctorForm.controls['ultrasoundFee'].setValue(0);
        this.doctorForm.controls['doctorId'].setValue(res.data as number);
        this.doctorForm.controls['branchId'].setValue(branchId);
        this.doctorForm.controls['status'].setValue(false);

        this.doctorForm.controls['isMonday'].setValue(false);
        this.doctorForm.controls['isTuesday'].setValue(false);
        this.doctorForm.controls['isWednesday'].setValue(false);
        this.doctorForm.controls['isThursday'].setValue(false);
        this.doctorForm.controls['isFriday'].setValue(false);
        this.doctorForm.controls['isSaturday'].setValue(false);
        this.doctorForm.controls['isSunday'].setValue(false);

        this.doctorForm.controls['_1MonDayStartHour'].disable();
        this.doctorForm.controls['_1MonDayEndHour'].disable();
        this.doctorForm.controls['_2TueDayStartHour'].disable();
        this.doctorForm.controls['_2TueDayEndHour'].disable();
        this.doctorForm.controls['_3WedDayStartHour'].disable();
        this.doctorForm.controls['_3WedDayEndHour'].disable();
        this.doctorForm.controls['_4ThuDayStartHour'].disable();
        this.doctorForm.controls['_4ThuDayEndHour'].disable();
        this.doctorForm.controls['_5FriDayStartHour'].disable();
        this.doctorForm.controls['_5FriDayEndHour'].disable();
        this.doctorForm.controls['_6SatDayStartHour'].disable();
        this.doctorForm.controls['_6SatDayEndHour'].disable();
        this.doctorForm.controls['_7SunDayStartHour'].disable();
        this.doctorForm.controls['_7SunDayEndHour'].disable();


        this.isEdit = false;
        this.modalVisible = true;
      }
    });

  }

  update(): void {
    this.isEdit = true;
    this.doctorForm.reset();
    if (this.selectedDoctor) {
      this.loggerService.info(this.selectedDoctor);

      this.doctorForm.controls['doctorId'].setValue(this.selectedDoctor.doctorId);
      this.doctorForm.controls['branchId'].setValue(this.selectedDoctor.branchId);
      this.doctorForm.controls['name'].setValue(this.selectedDoctor.name);
      this.doctorForm.controls['degree'].setValue(this.selectedDoctor.degree);
      this.doctorForm.controls['spalized'].setValue(this.selectedDoctor.spalized);
      this.doctorForm.controls['photo'].setValue(this.selectedDoctor.photo);
      this.doctorForm.controls['sign'].setValue(this.selectedDoctor.sign);
      this.doctorForm.controls['referFee'].setValue(this.selectedDoctor.referFee);
      this.doctorForm.controls['opdreferFee'].setValue(this.selectedDoctor.opdreferFee);
      this.doctorForm.controls['consultantFee'].setValue(this.selectedDoctor.consultantFee);
      this.doctorForm.controls['ecgfee'].setValue(this.selectedDoctor.ecgfee);
      this.doctorForm.controls['xrayFee'].setValue(this.selectedDoctor.xrayFee);
      this.doctorForm.controls['ultrasoundFee'].setValue(this.selectedDoctor.ultrasoundFee);
      this.doctorForm.controls['roundFee'].setValue(this.selectedDoctor.roundFee);

      if (this.selectedDoctor.monTime != null && this.selectedDoctor.monTime !== '') {
        this.doctorForm.controls['isMonday'].setValue(true);

        let monTimeArray: string[] = this.selectedDoctor.monTime?.split('to') ?? [];

        this.doctorForm.controls['_1MonDayStartHour'].setValue(this.timeFormatPipe.transformToDate(monTimeArray[0].trim()));
        this.doctorForm.controls['_1MonDayStartHour'].enable();

        this.doctorForm.controls['_1MonDayEndHour'].setValue(this.timeFormatPipe.transformToDate(monTimeArray[1].trim()));
        this.doctorForm.controls['_1MonDayEndHour'].enable();
      }

      // Tuesday
      if (this.selectedDoctor.tueTime != null && this.selectedDoctor.tueTime !== '') {
        this.doctorForm.controls['isTuesday'].setValue(true);

        let tueTimeArray: string[] = this.selectedDoctor.tueTime?.split('to') ?? [];

        this.doctorForm.controls['_2TueDayStartHour'].setValue(this.timeFormatPipe.transformToDate(tueTimeArray[0].trim()));
        this.doctorForm.controls['_2TueDayStartHour'].enable();

        this.doctorForm.controls['_2TueDayEndHour'].setValue(this.timeFormatPipe.transformToDate(tueTimeArray[1].trim()));
        this.doctorForm.controls['_2TueDayEndHour'].enable();
      }

      // Wednesday
      if (this.selectedDoctor.wedTime != null && this.selectedDoctor.wedTime !== '') {
        this.doctorForm.controls['isWednesday'].setValue(true);

        let wedTimeArray: string[] = this.selectedDoctor.wedTime?.split('to') ?? [];

        this.doctorForm.controls['_3WedDayStartHour'].setValue(this.timeFormatPipe.transformToDate(wedTimeArray[0].trim()));
        this.doctorForm.controls['_3WedDayStartHour'].enable();

        this.doctorForm.controls['_3WedDayEndHour'].setValue(this.timeFormatPipe.transformToDate(wedTimeArray[1].trim()));
        this.doctorForm.controls['_3WedDayEndHour'].enable();
      }

      // Thursday
      if (this.selectedDoctor.thuTime != null && this.selectedDoctor.thuTime !== '') {
        this.doctorForm.controls['isThursday'].setValue(true);

        let thuTimeArray: string[] = this.selectedDoctor.thuTime?.split('to') ?? [];

        this.doctorForm.controls['_4ThuDayStartHour'].setValue(this.timeFormatPipe.transformToDate(thuTimeArray[0].trim()));
        this.doctorForm.controls['_4ThuDayStartHour'].enable();

        this.doctorForm.controls['_4ThuDayEndHour'].setValue(this.timeFormatPipe.transformToDate(thuTimeArray[1].trim()));
        this.doctorForm.controls['_4ThuDayEndHour'].enable();
      }

      // Friday
      if (this.selectedDoctor.friTime != null && this.selectedDoctor.friTime !== '') {
        this.doctorForm.controls['isFriday'].setValue(true);

        let friTimeArray: string[] = this.selectedDoctor.friTime?.split('to') ?? [];

        this.doctorForm.controls['_5FriDayStartHour'].setValue(this.timeFormatPipe.transformToDate(friTimeArray[0].trim()));
        this.doctorForm.controls['_5FriDayStartHour'].enable();

        this.doctorForm.controls['_5FriDayEndHour'].setValue(this.timeFormatPipe.transformToDate(friTimeArray[1].trim()));
        this.doctorForm.controls['_5FriDayEndHour'].enable();
      }

      // Saturday
      if (this.selectedDoctor.satTime != null && this.selectedDoctor.satTime !== '') {
        this.doctorForm.controls['isSaturday'].setValue(true);

        let satTimeArray: string[] = this.selectedDoctor.satTime?.split('to') ?? [];

        this.doctorForm.controls['_6SatDayStartHour'].setValue(this.timeFormatPipe.transformToDate(satTimeArray[0].trim()));
        this.doctorForm.controls['_6SatDayStartHour'].enable();

        this.doctorForm.controls['_6SatDayEndHour'].setValue(this.timeFormatPipe.transformToDate(satTimeArray[1].trim()));
        this.doctorForm.controls['_6SatDayEndHour'].enable();
      }

      // Sunday
      if (this.selectedDoctor.sunTime != null && this.selectedDoctor.sunTime !== '') {
        this.doctorForm.controls['isSunday'].setValue(true);

        let sunTimeArray: string[] = this.selectedDoctor.sunTime?.split('to') ?? [];

        this.doctorForm.controls['_7SunDayStartHour'].setValue(this.timeFormatPipe.transformToDate(sunTimeArray[0].trim()));
        this.doctorForm.controls['_7SunDayStartHour'].enable();

        this.doctorForm.controls['_7SunDayEndHour'].setValue(this.timeFormatPipe.transformToDate(sunTimeArray[1].trim()));
        this.doctorForm.controls['_7SunDayEndHour'].enable();
      }


      this.doctorForm.controls['status'].setValue(this.selectedDoctor.status);
      this.modalVisible = true;
    } else {
      this.modalVisible = false;
      this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: "Please choose Doctor." });
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
      { key: 'spalized', value: 'Specialized' },
      { key: 'referFee', value: 'Refer Fee' },
      { key: 'opdreferFee', value: 'OPD-Refer Fee' },
      { key: 'ecgfee', value: 'ECG Fee' },
      { key: 'xrayFee', value: 'X-Ray Fee' },
      { key: 'ultrasoundFee', value: 'Ultrasound Fee' },
      { key: 'roundFee', value: 'Round Fee' },
      { key: 'monTime', value: 'Monday' },
      { key: 'tueTime', value: 'Tuesday' },
      { key: 'wedTime', value: 'Wednesday' },
      { key: 'thuTime', value: 'Thursday' },
      { key: 'friTime', value: 'Friday' },
      { key: 'satTime', value: 'Saturday' },
      { key: 'sunTime', value: 'Sunday' },
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
    let model = this.doctorForm.value as DoctorModel;

    let _monTime: string | null =
      this.doctorForm.controls['isMonday'].value ?
        this.timeFormatPipe.transformFromDate(this.doctorForm.controls['_1MonDayStartHour'].value, 'hh:mm a')
        + " to "
        + this.timeFormatPipe.transformFromDate(this.doctorForm.controls['_1MonDayEndHour'].value, 'hh:mm a')
        : null;

    let _tueTime: string | null =
      this.doctorForm.controls['isTuesday'].value ?
        this.timeFormatPipe.transformFromDate(this.doctorForm.controls['_2TueDayStartHour'].value, 'hh:mm a')
        + " to "
        + this.timeFormatPipe.transformFromDate(this.doctorForm.controls['_2TueDayEndHour'].value, 'hh:mm a')
        : null;

    let _wedTime: string | null =
      this.doctorForm.controls['isWednesday'].value ?
        this.timeFormatPipe.transformFromDate(this.doctorForm.controls['_3WedDayStartHour'].value, 'hh:mm a')
        + " to "
        + this.timeFormatPipe.transformFromDate(this.doctorForm.controls['_3WedDayEndHour'].value, 'hh:mm a')
        : null;

    let _thuTime: string | null =
      this.doctorForm.controls['isThursday'].value ?
        this.timeFormatPipe.transformFromDate(this.doctorForm.controls['_4ThuDayStartHour'].value, 'hh:mm a')
        + " to "
        + this.timeFormatPipe.transformFromDate(this.doctorForm.controls['_4ThuDayEndHour'].value, 'hh:mm a')
        : null;

    let _friTime: string | null =
      this.doctorForm.controls['isFriday'].value ?
        this.timeFormatPipe.transformFromDate(this.doctorForm.controls['_5FriDayStartHour'].value, 'hh:mm a')
        + " to "
        + this.timeFormatPipe.transformFromDate(this.doctorForm.controls['_5FriDayEndHour'].value, 'hh:mm a')
        : null;

    let _satTime: string | null =
      this.doctorForm.controls['isSaturday'].value ?
        this.timeFormatPipe.transformFromDate(this.doctorForm.controls['_6SatDayStartHour'].value, 'hh:mm a')
        + " to "
        + this.timeFormatPipe.transformFromDate(this.doctorForm.controls['_6SatDayEndHour'].value, 'hh:mm a')
        : null;

    let _sunTime: string | null =
      this.doctorForm.controls['isSunday'].value ?
        this.timeFormatPipe.transformFromDate(this.doctorForm.controls['_7SunDayStartHour'].value, 'hh:mm a')
        + " to "
        + this.timeFormatPipe.transformFromDate(this.doctorForm.controls['_7SunDayEndHour'].value, 'hh:mm a')
        : null;

    model.monTime = _monTime;
    model.tueTime = _tueTime;
    model.wedTime = _wedTime;
    model.thuTime = _thuTime;
    model.friTime = _friTime;
    model.satTime = _satTime;
    model.sunTime = _sunTime;

    this.loggerService.info(model);
    if (this.doctorForm.valid) {
      let model = this.doctorForm.value as DoctorModel;
      model.branchId = 1;

      this.isSubmitting = true;
      this.loggerService.info(model);
      if (!this.isEdit) {
        this.doctorService.create(this.doctorForm.value).subscribe(
          {
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
          }
        );
      } else {
        this.doctorService.update(this.doctorForm.value).subscribe(
          {
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
              this.selectedDoctor = null as any;
            }
          }
        );
      }
    } else {
      Object.keys(this.doctorForm.controls).forEach(field => {
        const control = this.doctorForm.get(field);
        control?.markAsDirty({ onlySelf: true });
      });
    }
  }

  //#region Event Method

  preventNegativeInput($event: KeyboardEvent) {
    const inputChar = $event.key;
    if (inputChar === '-' || inputChar === 'e') {
      $event.preventDefault();
    }
  }

  monDayChange(): void {
    if (this.doctorForm.controls['isMonday'].value) {
      this.doctorForm.controls['_1MonDayStartHour'].enable();
      this.doctorForm.controls['_1MonDayEndHour'].enable();
      this.doctorForm.controls['_1MonDayStartHour'].setValue(new Date("2000-01-01T09:00:00"));
      this.doctorForm.controls['_1MonDayEndHour'].setValue(new Date("2000-01-01T17:00:00"));
    }
    else {
      this.doctorForm.controls['_1MonDayStartHour'].disable();
      this.doctorForm.controls['_1MonDayEndHour'].disable();
      this.doctorForm.controls['_1MonDayStartHour'].setValue(false);
      this.doctorForm.controls['_1MonDayEndHour'].setValue(false);
    }
  }

  tueDayChange(): void {
    if (this.doctorForm.controls['isTuesday'].value) {
      this.doctorForm.controls['_2TueDayStartHour'].enable();
      this.doctorForm.controls['_2TueDayEndHour'].enable();
      this.doctorForm.controls['_2TueDayStartHour'].setValue(new Date("2000-01-01T09:00:00"));
      this.doctorForm.controls['_2TueDayEndHour'].setValue(new Date("2000-01-01T17:00:00"));
    }
    else {
      this.doctorForm.controls['_2TueDayStartHour'].disable();
      this.doctorForm.controls['_2TueDayEndHour'].disable();
      this.doctorForm.controls['_2TueDayStartHour'].setValue(false);
      this.doctorForm.controls['_2TueDayEndHour'].setValue(false);
    }
  }

  wedDayChange(): void {
    if (this.doctorForm.controls['isWednesday'].value) {
      this.doctorForm.controls['_3WedDayStartHour'].enable();
      this.doctorForm.controls['_3WedDayEndHour'].enable();
      this.doctorForm.controls['_3WedDayStartHour'].setValue(new Date("2000-01-01T09:00:00"));
      this.doctorForm.controls['_3WedDayEndHour'].setValue(new Date("2000-01-01T17:00:00"));
    }
    else {
      this.doctorForm.controls['_3WedDayStartHour'].disable();
      this.doctorForm.controls['_3WedDayEndHour'].disable();
      this.doctorForm.controls['_3WedDayStartHour'].setValue(false);
      this.doctorForm.controls['_3WedDayEndHour'].setValue(false);
    }
  }

  thuDayChange(): void {
    if (this.doctorForm.controls['isThursday'].value) {
      this.doctorForm.controls['_4ThuDayStartHour'].enable();
      this.doctorForm.controls['_4ThuDayEndHour'].enable();
      this.doctorForm.controls['_4ThuDayStartHour'].setValue(new Date("2000-01-01T09:00:00"));
      this.doctorForm.controls['_4ThuDayEndHour'].setValue(new Date("2000-01-01T17:00:00"));
    }
    else {
      this.doctorForm.controls['_4ThuDayStartHour'].disable();
      this.doctorForm.controls['_4ThuDayEndHour'].disable();
      this.doctorForm.controls['_4ThuDayStartHour'].setValue(false);
      this.doctorForm.controls['_4ThuDayEndHour'].setValue(false);
    }
  }

  friDayChange(): void {
    if (this.doctorForm.controls['isFriday'].value) {
      this.doctorForm.controls['_5FriDayStartHour'].enable();
      this.doctorForm.controls['_5FriDayEndHour'].enable();
      this.doctorForm.controls['_5FriDayStartHour'].setValue(new Date("2000-01-01T09:00:00"));
      this.doctorForm.controls['_5FriDayEndHour'].setValue(new Date("2000-01-01T17:00:00"));
    }
    else {
      this.doctorForm.controls['_5FriDayStartHour'].disable();
      this.doctorForm.controls['_5FriDayEndHour'].disable();
      this.doctorForm.controls['_5FriDayStartHour'].setValue(false);
      this.doctorForm.controls['_5FriDayEndHour'].setValue(false);
    }
  }

  satDayChange(): void {
    if (this.doctorForm.controls['isSaturday'].value) {
      this.doctorForm.controls['_6SatDayStartHour'].enable();
      this.doctorForm.controls['_6SatDayEndHour'].enable();
      this.doctorForm.controls['_6SatDayStartHour'].setValue(new Date("2000-01-01T09:00:00"));
      this.doctorForm.controls['_6SatDayEndHour'].setValue(new Date("2000-01-01T17:00:00"));
    }
    else {
      this.doctorForm.controls['_6SatDayStartHour'].disable();
      this.doctorForm.controls['_6SatDayEndHour'].disable();
      this.doctorForm.controls['_6SatDayStartHour'].setValue(false);
      this.doctorForm.controls['_6SatDayEndHour'].setValue(false);
    }
  }

  sunDayChange(): void {
    if (this.doctorForm.controls['isSunday'].value) {
      this.doctorForm.controls['_7SunDayStartHour'].enable();
      this.doctorForm.controls['_7SunDayEndHour'].enable();
      this.doctorForm.controls['_7SunDayStartHour'].setValue(new Date("2000-01-01T09:00:00"));
      this.doctorForm.controls['_7SunDayEndHour'].setValue(new Date("2000-01-01T17:00:00"));
    }
    else {
      this.doctorForm.controls['_7SunDayStartHour'].disable();
      this.doctorForm.controls['_7SunDayEndHour'].disable();
      this.doctorForm.controls['_7SunDayStartHour'].setValue(false);
      this.doctorForm.controls['_7SunDayEndHour'].setValue(false);
    }
  }

  //#endregion

}  
