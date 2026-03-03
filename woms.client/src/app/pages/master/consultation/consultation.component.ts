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
    ToggleSwitch,
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
  ],
  providers: [ConfirmationService, DropdownStateService, DatePipe, DecimalPipe, ExportService],
  templateUrl: './consultation.component.html',
  styleUrl: './consultation.component.scss'
})
export class ConsultationComponent implements OnInit {
  consultations: ViConsultationModel[] = [];
  selectedConsultation!: ViConsultationModel;

  items!: MenuItem[] | undefined;
  loading: boolean = false;
  isSubmitting: boolean = false;

  // UI State toggles
  showForm: boolean = false;
  isEdit: boolean = false;

  // Mock data for dropdowns (Replace with real service calls)
  patients: ViPatientModel[] = [];
  selectedPatient!: ViPatientModel;
  stockItems: StockItemModel[] = [];
  selectedStockItem: StockItemModel | null = null;
  dosages: string[] = ['Select dosage', '10mg', '20mg', '500mg'];
  frequencies: string[] = ['Select frequency', 'Once daily', 'Twice daily', 'Once daily at bedtime'];
  patientId = '';
  name = '';
  itemCode = '';
  itemName = '';

  private formBuilder = inject(FormBuilder);
  public consultationForm: FormGroup = this.formBuilder.group({
    consultationId: [''],
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
      itemCode: ['', Validators.required],
      dosage: ['Select dosage'],
      frequency: ['Select frequency'],
      duration: [30],
      instruction: [''],
      quantity: [1]
    });
    this.prescriptionsArray.push(medGroup);
  }

  removeMedication(index: number) {
    this.prescriptionsArray.removeAt(index);
  }

  // --- Data Operations ---
  loadData(): void {
    let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    this.loading = true;
    this.consultationService.get(branchId).subscribe({
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
    this.consultationForm.reset({ visitDate: new Date(), status: 'Active' });
    this.prescriptionsArray.clear();
    this.addMedication(); // Add one default blank medication row
  }

  cancelForm(): void {
    this.showForm = false;
    this.consultationForm.reset();
  }

  saveConsultation(): void {
    if (this.consultationForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields.' });
      return;
    }

    // Here you will send this.consultationForm.value to your backend API.
    // Ensure your backend endpoint can accept both the Consultation details AND the array of Prescriptions.
    console.log("Submitting Payload:", this.consultationForm.value);
  }

  update(): void { /* Bind selected record to form and set showForm = true */ }
  delete(): void { }
  excel(): void { }

  //#region Patient

  onPatientSelected(patient: ViPatientModel): void {
    this.selectedPatient = patient;

    if (patient) {
      this.name = patient.name;
      this.patientId = patient.patientId;
    } else {
      this.name = '';
      this.patientId = '';
    }
  }
  //#

  // #region Stock Item
  onStockItemChange(medicine: StockItemModel): void {
    this.loggerService.info("Stock Item Change");
    if (medicine) {
      this.itemCode = medicine.itemCode;
      this.itemName = medicine.itemName;
    } else {
      this.itemCode = '';
      this.itemName = '';
    }
  }
  // #endregion
}