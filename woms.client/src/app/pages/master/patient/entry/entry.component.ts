import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientModel } from '@core_models/master/patient.model';
import { StateModel } from '@core_models/master/state.model';
import { TownshipModel } from '@core_models/master/townsip.model';
import { DoctorService } from '@core_services/master/doctor.service';
import { PatientService } from '@core_services/master/patient.service';
import { StateService } from '@core_services/master/state.service';
import { TownshipService } from '@core_services/master/township.service';
import { DoctorDropDownComponent } from '@shared_component/drop-down/doctor-drop-down/doctor-drop-down.component';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
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
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-patient-entry',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // PrimeNG Modules
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
    SelectModule,
    DatePickerModule,
    DividerModule
  ],
  templateUrl: './entry.component.html'
})
export class EntryComponent implements OnInit {
  selectedPatient!: PatientModel;

  states: StateModel[] = [];
  SelectedState: StateModel | null = null;

  townships: TownshipModel[] = [];
  SelectedTownship: TownshipModel | null = null;

  loading: boolean = false;
  isSubmitting: boolean = false;
  formSubmitted: boolean = false;

  maxDate: Date = new Date();

  @Input() isEdit: boolean = false;
  @Output() onSubmitted = new EventEmitter<string>();

  genders = [{ label: 'Male' }, { label: 'Female' }];

  private formBuilder = inject(FormBuilder);
  public patientForm: FormGroup = this.formBuilder.group({
    patientId: [''],
    branchId: [0, Validators.required],
    name: ['', Validators.required],
    dob: [new Date(), Validators.required],
    age: [{ value: '', disabled: true }],
    stateId: [0, Validators.required],
    townshipId: [0, Validators.required],
    addressDetail: [''],
    phone: new FormControl('', {
      validators: [Validators.required, Validators.pattern("^(0(1|9)[0-9]{7,9})$")]
    }),
    gender: ['', Validators.required],
    doctorId: [0, Validators.required],
    status: true,
  });

  constructor(
    private stateService: StateService,
    private townshipService: TownshipService,
    private doctorService: DoctorService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private loggerService: LoggerService,
    private patientService: PatientService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.handleDobValueChanges();
    this.getStates();
  }

  getStates(): void {
    this.loading = true;
    this.stateService.get().subscribe({
      next: (res) => {
        this.states = res.data as StateModel[];
        if (this.isEdit) {
          let stateId = this.patientForm.get('stateId')?.value;
          this.SelectedState = this.states.find(state => state.stateId === stateId) ?? null;
          if (this.SelectedState) {
            this.getTownships(this.SelectedState.stateId);
          }
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.showMessage('warn', 'Warning', err?.message?.en ?? 'Failed to load states.');
      }
    });
  }

  onStateChange(): void {
    if (this.SelectedState) {
      this.patientForm.get('stateId')?.setValue(this.SelectedState.stateId);
      this.getTownships(this.SelectedState.stateId);
      this.SelectedTownship = null;
      this.townships = [];
      this.patientForm.get('townshipId')?.setValue(0);
    }
  }

  getTownships(stateId: number): void {
    this.loading = true;
    this.townshipService.getByStateId(stateId).subscribe({
      next: (res) => {
        this.townships = res.data as TownshipModel[];
        if (this.isEdit) {
          let townshipId = this.patientForm.get('townshipId')?.value;
          this.SelectedTownship = this.townships.find(township => township.townshipId === townshipId) ?? null;
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.showMessage('warn', 'Warning', err?.message?.en ?? 'Failed to load townships.');
      },
    });
  }

  onTownshipChange(): void {
    if (this.SelectedTownship) {
      this.patientForm.get('townshipId')?.setValue(this.SelectedTownship.townshipId);
    }
  }

  // #endregion

  submit(): void {
    this.formSubmitted = true;

    this.patientForm.get('age')?.enable();

    let dobControl = this.patientForm.get('dob');
    let dobValue = dobControl?.value;
    let dobValid = true;

    // Check if dob is provided
    if (!dobValue) {
      dobValid = false;
      dobControl?.setErrors({ required: true });
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please add Date of Birth.',
      });
    } else if (typeof dobValue !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dobValue) || isNaN(Date.parse(dobValue))) {
      dobValid = false;
      dobControl?.setErrors({ invalid: true });
    }

    if (
      this.patientForm.valid &&
      this.SelectedState &&
      this.SelectedTownship &&
      dobValid
    ) {
      let model = this.patientForm.value as PatientModel;
      model.branchId = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));

      this.isSubmitting = true;
      this.loggerService.info(model);

      if (this.isEdit) {
        this.patientService.update(model).subscribe({
          next: (res) => {
            this.isSubmitting = false;
            this.messageService.add({
              key: 'globalMessage',
              severity: 'success',
              summary: 'Success',
              detail: res.message.en,
            });
            this.onSubmitted.emit(res.data?.patientId || 'success');
            this.loggerService.success(res.data?.patientId);
          },
          error: (err) => {
            this.isSubmitting = false;
            this.messageService.add({
              key: 'globalMessage',
              severity: 'warn',
              summary: 'Warning',
              detail: err.message.en,
            });
          },
          complete: () => {
            this.selectedPatient = null as any;
            this.isSubmitting = false;
          },
        });
      } else {
        this.patientService.create(model).subscribe({
          next: (res) => {
            this.isSubmitting = false;
            this.messageService.add({
              key: 'globalMessage',
              severity: 'success',
              summary: 'Success',
              detail: res.message.en,
            });
            this.onSubmitted.emit(res.data);
            this.loggerService.success(res.data);
          },
          error: (err) => {
            this.isSubmitting = false;
            this.messageService.add({
              key: 'globalMessage',
              severity: 'warn',
              summary: 'Warning',
              detail: err.message.en,
            });
          },
          complete: () => {
            this.isSubmitting = false;
          },
        });
      }
    } else {
      Object.keys(this.patientForm.controls).forEach((field) => {
        let control = this.patientForm.get(field);
        control?.markAsDirty({ onlySelf: true });
      });
    }
  }

  resetForm(): void {
    this.patientForm.reset({
      patientId: '',
      branchId: Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0'),
      name: '',
      dob: new Date(),
      addressDetail: '',
      phone: '',
      gender: '',
      stateId: 0,
      townshipId: 0,
      status: true,
    });

    this.SelectedState = null;
    this.SelectedTownship = null;
    this.selectedPatient = null as any;
    this.isEdit = false;
  }

  // #endregion

  // #region Utility Methods

  preventNegativeInput($event: KeyboardEvent): void {
    if (['-', 'e'].includes($event.key)) {
      $event.preventDefault();
    }
  }

  transformToUppercase(controlName: string): void {
    let control = this.patientForm.get(controlName);
    if (control) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }

  private handleDobValueChanges(): void {
    this.patientForm.get('dob')?.valueChanges.subscribe((dob) => {
      if (dob instanceof Date) {
        let formattedDob = this.datePipe.transform(dob, 'yyyy-MM-dd');
        this.patientForm.get('dob')?.setValue(formattedDob, { emitEvent: false });
      } else if (typeof dob === 'string') {
        let isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(dob);
        if (!isValidDate) {
          this.patientForm.get('dob')?.setValue('', { emitEvent: false });
        }
      }

      // Calculate and set age in years and months
      if (dob) {
        let birthDate = new Date(dob);
        let today = new Date();
        let ageDetails = this.calculateAge(birthDate, today);
        this.patientForm.get('age')?.setValue(`${ageDetails.years} years, ${ageDetails.months} months`, { emitEvent: false });
      }
    });
  }

  private calculateAge(birthDate: Date, today: Date): { years: number; months: number } {
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (today.getDate() < birthDate.getDate()) {
      months--;
      if (months < 0) {
        years--;
        months += 12;
      }
    }

    return { years, months };
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({
      key: 'globalMessage',
      severity,
      summary,
      detail,
    });
  }


  // #endregion
}
