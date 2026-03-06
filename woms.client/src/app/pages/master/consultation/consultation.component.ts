import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ViConsultationModel } from '@core_models/master/consultation.model';
import { ConsultationService } from '@core_services/master/consultation.service';
import { ExportService } from '@shared_services/export.service';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { SplitButton } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { ViPatientModel } from '@core_models/master/patient.model';
import { StockItemModel } from '@core_models/stock/stock-item.model';
import { PatientDropDownComponent } from '@shared_component/drop-down/patient-drop-down/patient-drop-down.component';
import { DropdownStateService } from '@shared_services/state-management/dropdown-state.service';
import { ItemCodeDropdownComponent } from '@shared_component/drop-down/item-code-dropdown/item-code-dropdown.component';
import { DatePickerModule } from 'primeng/datepicker';
import { ConsultationEntryModel } from '@core_models/master/prescription.model';

@Component({
  selector: 'app-consultation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // PrimeNG
    ToastModule,
    ButtonModule,
    SplitButton,
    InputTextModule,
    TextareaModule,
    InputIconModule,
    IconFieldModule,
    TagModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    SelectModule,
    PatientDropDownComponent,
    ItemCodeDropdownComponent,
    DatePickerModule
  ],
  providers: [ConfirmationService, DropdownStateService, DatePipe, DecimalPipe, ExportService],
  templateUrl: './consultation.component.html',
  styleUrl: './consultation.component.scss'
})
export class ConsultationComponent implements OnInit {
  patientInfo: any = null;
  appointmentInfo: any = null;
  fetchingPatientInfo: boolean = false;

  consultations: ViConsultationModel[] = [];
  selectedConsultation!: ViConsultationModel;

  items!: MenuItem[] | undefined;
  loading: boolean = false;
  isSubmitting: boolean = false;

  // UI State toggles
  showForm: boolean = false;
  isEdit: boolean = false;

  // cached id of currently logged in doctor (derived from user cookie)
  private get currentDoctorId(): number {
    const id = this.sharedService.getUserId();
    return id ? Number.parseInt(id) : 0;
  }

  // Mock data for dropdowns (Replace with real service calls)
  patients: ViPatientModel[] = [];
  selectedPatient!: ViPatientModel;
  stockItems: StockItemModel[] = [];
  selectedStockItems: any[] = [];
  dosages: string[] = ['Select dosage', '10mg', '20mg', '500mg'];
  frequencies: string[] = ['Select frequency', 'Once daily', 'Twice daily', 'Once daily at bedtime'];
  patientId = '';
  name = '';
  itemCode = '';
  itemName = '';

  private formBuilder = inject(FormBuilder);
  public consultationForm: FormGroup = this.formBuilder.group({
    consultationId: ['TEMP_ID'],
    branchId: [0, Validators.required],
    patientId: ['', Validators.required],
    doctorId: [0, Validators.required],
    visitDate: [new Date(), Validators.required],
    ano: [0],
    symptoms: [''],
    diagnosis: [''],
    notes: [''],
    status: ['Active'],
    // FormArray to hold multiple prescription items
    prescriptions: this.formBuilder.array([])
  });

  constructor(
    private consultationService: ConsultationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private loggerService: LoggerService,
    private sharedService: SharedService,
    private exportService: ExportService,
  ) {
    this.items = [
      { label: 'Edit', icon: 'pi pi-pen-to-square', command: () => this.update() },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.delete() },
      { label: 'Excel', icon: 'pi pi-file-excel', command: () => this.excel() }
    ];
  }

  ngOnInit(): void {
    this.loadData();
  }

  // --- Form Array Getters and Setters ---
  get prescriptionsArray(): FormArray {
    return this.consultationForm.get('prescriptions') as FormArray;
  }

  addMedication() {
    const medGroup = this.formBuilder.group({
      consultationId: ['TEMP_ID'],
      itemCode: ['', Validators.required],
      dosage: ['Select dosage'],
      frequency: ['Select frequency'],
      duration: [3],
      instruction: [''],
      quantity: [1]
    });
    this.prescriptionsArray.push(medGroup);

    this.selectedStockItems.push(null);
  }

  removeMedication(index: number) {
    this.prescriptionsArray.removeAt(index);
    this.selectedStockItems.splice(index, 1);
  }

  // --- Data Operations ---
  loadData(): void {
    let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    let doctorId = Number.parseInt((this.sharedService.getUserId() ?? "0"));
    this.loading = true;
    this.consultationService.get(branchId, doctorId).subscribe({
      next: res => {
        this.consultations = res.data as ViConsultationModel[];
      },
      error: err => { this.loggerService.error(err); },
      complete: () => { this.loading = false; }
    });
  }

  create(): void {
    this.isEdit = false;
    this.showForm = true;

    this.consultationForm.get('visitDate')?.enable();
    this.consultationForm.get('patientId')?.enable();

    // reset form and seed branch/doctor default values
    this.consultationForm.reset({ consultationId: 'TEMP_ID', visitDate: new Date(), status: 'Active' });
    this.consultationForm.patchValue({
      branchId: Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0'),
      doctorId: this.currentDoctorId
    });

    this.selectedPatient = {} as ViPatientModel;
    this.patientId = '';
    this.name = '';
    this.selectedStockItems = [];

    this.patientInfo = null;
    this.appointmentInfo = null;

    this.prescriptionsArray.clear();
    this.addMedication();
  }

  cancelForm(): void {
    this.showForm = false;
    this.consultationForm.reset();

    this.patientInfo = null;
    this.appointmentInfo = null;
  }

  saveConsultation(): void {
    const branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');
    this.consultationForm.patchValue({ branchId, doctorId: this.currentDoctorId });

    if (this.consultationForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields.' });
      return;
    }

    this.isSubmitting = true;

    // 1. Get the raw form value
    const formValue = this.consultationForm.getRawValue();

    // 2. Separate the prescriptions array from the rest of the consultation data
    const { prescriptions, ...consultationData } = formValue;

    // 3. Structure the payload to match your C# ConsultationCreationDto
    const payload: ConsultationEntryModel = {
      consultation: consultationData,
      prescriptions: prescriptions
    };

    // 4. Send the correctly structured payload
    const request$ = this.isEdit
      ? this.consultationService.update(payload)
      : this.consultationService.create(payload);

    request$.subscribe({
      next: res => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: res.message?.en ?? 'Saved successfully.' });
        this.loadData();
        this.cancelForm();
      },
      error: err => {
        this.loggerService.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred while saving.' });
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  update(): void {
    if (!this.selectedConsultation) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a record to update.' });
      return;
    }

    this.isEdit = true;
    this.showForm = true;
    this.consultationForm.reset();

    const branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');
    const visitDateObj = this.selectedConsultation.visitDate ? new Date(this.selectedConsultation.visitDate) : new Date();

    this.consultationForm.patchValue({
      ...this.selectedConsultation,
      visitDate: visitDateObj,
      branchId,
      doctorId: this.currentDoctorId
    });

    this.consultationForm.get('visitDate')?.disable();
    this.consultationForm.get('patientId')?.disable();

    this.selectedPatient = {
      patientId: this.selectedConsultation.patientId,
      name: (this.selectedConsultation as any).patientName || ''
    } as ViPatientModel;

    this.prescriptionsArray.clear();

    this.consultationService.getPrescriptionByConsultationId(this.selectedConsultation.consultationId).subscribe({
      next: (res: any) => {
        const prescriptions: any[] = res.data?.prescriptions || [];
        if (prescriptions.length > 0) {
          prescriptions.forEach((p, i) => {

            this.selectedStockItems[i] = {
              itemCode: p.itemCode,
              itemName: p.itemName || p.itemCode
            };

            const medGroup = this.formBuilder.group({
              consultationId: [this.selectedConsultation.consultationId],
              itemCode: [p.itemCode, Validators.required],
              dosage: [p.dosage],
              frequency: [p.frequency],
              duration: [p.duration || 3],
              instruction: [p.instruction || ''],
              quantity: [p.quantity || 1]
            });
            this.prescriptionsArray.push(medGroup);
          });
        } else {
          this.addMedication();
        }
      },
      error: (err: any) => this.loggerService.error("Failed to load prescriptions")
    });
  }

  delete(): void {
    // 1. Check if a row is actually selected in the table
    if (!this.selectedConsultation) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a record to delete.' });
      return;
    }

    // 2. Show the PrimeNG confirmation dialog
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the consultation record for ${this.selectedConsultation.patientName}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',

      // 3. If the user clicks "Yes" (Accept)
      accept: () => {
        this.loading = true;

        // Call your backend delete API passing the string ID
        this.consultationService.delete(this.selectedConsultation.consultationId).subscribe({
          next: (res: any) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: res.message?.en ?? 'Consultation deleted successfully.'
            });

            // @ts-ignore (If TypeScript complains about nulling the strict type)
            this.selectedConsultation = null;
            this.loadData();
          },
          error: (err: any) => {
            this.loggerService.error("Delete Error");
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'An error occurred while deleting the record.'
            });
            this.loading = false;
          }
        });
      }
    });
  }

  excel(): void { }

  //#region Patient

  onPatientSelected(patient: ViPatientModel): void {
    this.selectedPatient = patient;

    if (patient) {
      this.name = patient.name;
      this.patientId = patient.patientId;
      this.consultationForm.patchValue({ patientId: patient.patientId });

      // Trigger the new API call
      this.fetchPatientExtraInfo(patient.patientId);
    } else {
      this.name = '';
      this.patientId = '';
      this.consultationForm.patchValue({ patientId: '', ano: null });
      this.patientInfo = null;
      this.appointmentInfo = null;
    }
  }

  fetchPatientExtraInfo(patientId: string) {
    const branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');
    const doctorId = this.currentDoctorId;

    this.fetchingPatientInfo = true;

    this.consultationService.getPatientInfo(patientId, branchId, doctorId).subscribe({
      next: (res: any) => {
        this.patientInfo = res.data?.patient;
        this.appointmentInfo = res.data?.appointment;

        if (!this.isEdit) {
          if (this.appointmentInfo) {
            this.consultationForm.patchValue({ ano: this.appointmentInfo.ano });
          } else {
            this.consultationForm.patchValue({ ano: null });
          }
        }
      },
      error: (err: any) => {
        this.loggerService.error(err);
        this.fetchingPatientInfo = false;
      },
      complete: () => {
        this.fetchingPatientInfo = false;
      }
    });
  }
  //#

  // #region Stock Item
  onStockItemChange(medicine: StockItemModel, index: number): void {
    this.loggerService.info("Stock Item Change");

    // Get the specific form group for this row
    const medGroup = this.prescriptionsArray.at(index) as FormGroup;

    if (medicine) {
      this.itemCode = medicine.itemCode;
      this.itemName = medicine.itemName;
      medGroup.patchValue({ itemCode: medicine.itemCode });
    } else {
      this.itemCode = '';
      this.itemName = '';
      medGroup.patchValue({ itemCode: '' });
    }
  }
  // #endregion
}