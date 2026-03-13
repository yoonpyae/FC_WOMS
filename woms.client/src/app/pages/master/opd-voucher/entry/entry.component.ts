import { CommonModule, DatePipe } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ViConsultationModel } from "@core_models/master/consultation.model";
import { DoctorModel } from "@core_models/master/doctor.model";
import { OPDVoucherEntryModel, OPDVoucherItemModel } from "@core_models/master/opd-voucher.model";
import { ViPatientModel } from "@core_models/master/patient.model";
import { ServiceModel } from "@core_models/master/service.model";
import { OPDVoucherService } from "@core_services/master/opd-voucher.service";
import { ServiceService } from "@core_services/master/service.service";
import { ConsultationService } from "@core_services/master/consultation.service";
import { DoctorDropDownComponent } from "@shared_component/drop-down/doctor-drop-down/doctor-drop-down.component";
import { PatientDropDownComponent } from "@shared_component/drop-down/patient-drop-down/patient-drop-down.component";
import { LoggerService } from "@shared_services/logger.service";
import { SharedService } from "@shared_services/shared.service";
import { DropdownStateService } from "@shared_services/state-management/dropdown-state.service";
import { CookieService } from "ngx-cookie-service";
import { ConfirmationService, MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmPopupModule } from "primeng/confirmpopup";
import { DatePickerModule } from "primeng/datepicker";
import { DialogModule } from "primeng/dialog";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { SelectButtonModule } from "primeng/selectbutton";
import { TableModule } from "primeng/table";
import { TextareaModule } from "primeng/textarea";
import { ToastModule } from "primeng/toast";

interface OPDItemCookieData extends OPDVoucherItemModel {
  itemType: 'Service' | 'Consultation';
  itemName: string;
}

@Component({
  selector: 'app-opd-voucher-entry',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
    ButtonModule,
    TableModule,
    ToastModule,
    TextareaModule,
    DialogModule,
    ConfirmPopupModule,
    IconFieldModule,
    InputIconModule,
    DatePickerModule,
    SelectButtonModule,
    ConfirmDialogModule,
    DoctorDropDownComponent,
    PatientDropDownComponent
  ],
  standalone: true,
  templateUrl: './entry.component.html',
  providers: [DropdownStateService, ConfirmationService, DatePipe]
})
export class OPDVoucherEntryComponent implements OnInit {

  services: ServiceModel[] = [];
  consultations: ViConsultationModel[] = [];

  cookieData: OPDItemCookieData[] = [];

  // Toggle State for UI
  entryTypes = [
    { label: 'Service', value: 'Service' },
    { label: 'Consultation', value: 'Consultation' }
  ];
  selectedEntryType: 'Service' | 'Consultation' = 'Service';

  selectedDoctor!: DoctorModel;
  selectedPatient!: ViPatientModel;
  selectedService!: ServiceModel;
  selectedConsultation!: ViConsultationModel;

  loading: boolean = false;
  isSubmitting: boolean = false;

  patientId = '';
  patientName = '';

  private readonly OPD_COOKIE_NAME = 'opd-voucher-details';

  paymentTypes = [
    { label: 'Cash', value: 'Cash' },
    { label: 'KBZPay', value: 'KBZPay' },
    { label: 'AYA Pay', value: 'AYA Pay' },
    { label: 'Wave Money', value: 'Wave Money' },
    { label: 'Bank Transfer', value: 'Bank Transfer' }
  ];

  private formBuilder = inject(FormBuilder);

  public opdVoucherForm: FormGroup = this.formBuilder.group({
    opdvno: [''],
    branchId: [0, Validators.required],
    patientId: [''],
    vdate: [new Date(), Validators.required],
    patientName: ['', Validators.required],
    doctorId: [null, Validators.required],
    totalAmount: [0, Validators.required],
    discountAmount: [0],
    paidAmount: [0, Validators.required],
    leftAmount: [0, Validators.required],
    paymentType: ['Cash', Validators.required],
    status: true,
    remark: [''],

    serviceId: [0],
    consultationId: [''],
    quantity: [1],
    unitPrice: [0],
    amount: [0]
  });

  constructor(
    private opdVoucherService: OPDVoucherService,
    private serviceService: ServiceService,
    private consultationService: ConsultationService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private loggerService: LoggerService,
    private confirmationService: ConfirmationService,
    private cookieService: CookieService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    const branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');
    this.opdVoucherForm.patchValue({ branchId });

    this.loadItemsFromCookie();
    this.getServices(branchId);

    this.opdVoucherForm.get('discountAmount')?.valueChanges.subscribe(() => this.onAmountChange());
    this.opdVoucherForm.get('paidAmount')?.valueChanges.subscribe(() => this.onAmountChange());
    this.opdVoucherForm.get('quantity')?.valueChanges.subscribe(() => this.calculateTempItemAmount());
    this.opdVoucherForm.get('unitPrice')?.valueChanges.subscribe(() => this.calculateTempItemAmount());
  }

  getServices(branchId: number) {
    this.loading = true;
    this.serviceService.get(branchId).subscribe({
      next: (res) => { this.services = res.data as ServiceModel[]; },
      error: (err) => this.loggerService.error("Error fetching services"),
      complete: () => this.loading = false
    });
  }

  fetchConsultations() {
    const branchId = this.opdVoucherForm.get('branchId')?.value;
    const doctorId = this.selectedDoctor?.doctorId;

    if (!doctorId) {
      this.consultations = [];
      return;
    }

    this.loading = true;

    if (this.patientId) {
      this.consultationService.getByPatientId(this.patientId, branchId, doctorId).subscribe({
        next: (res: any) => {
          this.consultations = res.data.map((item: any) => item.consultation ? item.consultation : item) as ViConsultationModel[];
        },
        error: (err) => this.loggerService.error("Error fetching patient consultations"),
        complete: () => this.loading = false
      });
    } else {
      this.consultationService.get(branchId, doctorId).subscribe({
        next: (res: any) => {
          this.consultations = res.data.map((item: any) => item.consultation ? item.consultation : item) as ViConsultationModel[];
        },
        error: (err) => this.loggerService.error("Error fetching doctor consultations"),
        complete: () => this.loading = false
      });
    }
  }

  onDoctorChange(doctor: DoctorModel): void {
    this.selectedDoctor = doctor;
    this.opdVoucherForm.patchValue({ doctorId: doctor ? doctor.doctorId : null });
    this.fetchConsultations();
  }

  onPatientSelected(patient: ViPatientModel): void {
    this.selectedPatient = patient;
    if (patient) {
      this.patientName = patient.name;
      this.patientId = patient.patientId;
      this.opdVoucherForm.patchValue({ patientId: this.patientId, patientName: this.patientName });
    } else {
      this.patientName = '';
      this.patientId = '';
      this.opdVoucherForm.patchValue({ patientId: '', patientName: '' });
    }
    if (this.selectedDoctor) {
      this.fetchConsultations();
    }
  }

  onEntryTypeChange() {
    this.resetItemFields();
  }

  onServiceChange(): void {
    if (this.selectedService) {
      this.opdVoucherForm.patchValue({
        serviceId: this.selectedService.serviceId,
        unitPrice: this.selectedService.fee || 0
      });
      this.calculateTempItemAmount();
    }
  }

  onConsultationChange(): void {
    if (this.selectedConsultation) {
      this.opdVoucherForm.patchValue({
        consultationId: this.selectedConsultation.consultationId,
        unitPrice: this.selectedConsultation.consultantFee || 0
      });
      this.calculateTempItemAmount();
    }
  }

  calculateTempItemAmount(): void {
    const qty = this.opdVoucherForm.get('quantity')?.value || 0;
    const price = this.opdVoucherForm.get('unitPrice')?.value || 0;
    this.opdVoucherForm.patchValue({ amount: qty * price }, { emitEvent: false });
  }

  addItemToCookie(): void {
    const formVals = this.opdVoucherForm.value;

    if (this.selectedEntryType === 'Service' && !formVals.serviceId) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Data', detail: 'Please select a service.' });
      return;
    }

    if (this.selectedEntryType === 'Consultation' && !formVals.consultationId) {
      this.messageService.add({ severity: 'warn', summary: 'Missing Data', detail: 'Please select a consultation.' });
      return;
    }

    if (!formVals.quantity || formVals.quantity <= 0) {
      this.messageService.add({ severity: 'error', summary: 'Invalid Quantity', detail: 'Please enter a valid quantity.' });
      return;
    }

    let displayItemName = '';

    if (this.selectedEntryType === 'Service') {
      displayItemName = this.selectedService?.serviceName || 'Unknown Service';
    } else {
      const formattedDate = this.datePipe.transform(this.selectedConsultation.visitDate, 'dd/MM/yyyy h:mm a');
      displayItemName = `Consultation - Dr. ${this.selectedConsultation.doctorName} (${formattedDate})`;
    }

    const newItem: OPDItemCookieData = {
      opdvno: "",
      serviceId: formVals.serviceId || 0,
      consultationId: formVals.consultationId || '',
      itemType: this.selectedEntryType,
      itemName: displayItemName,
      quantity: formVals.quantity,
      unitPrice: formVals.unitPrice,
      amount: formVals.amount
    };

    const existingItems = this.getItemsFromCookie();
    existingItems.push(newItem);

    this.saveItemsToCookie(existingItems);
    this.cookieData = existingItems;
    this.onAmountChange();
    this.resetItemFields();

    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Item added to voucher' });
  }

  resetItemFields(): void {
    this.opdVoucherForm.patchValue({
      serviceId: 0,
      consultationId: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0
    });
    this.selectedService = null as any;
    this.selectedConsultation = null as any;
  }

  getItemsFromCookie(): OPDItemCookieData[] {
    const cookieData = this.cookieService.get(this.OPD_COOKIE_NAME);
    try { return cookieData ? JSON.parse(cookieData) : []; } catch { return []; }
  }

  saveItemsToCookie(items: OPDItemCookieData[]): void {
    this.cookieService.set(this.OPD_COOKIE_NAME, JSON.stringify(items), 1);
  }

  loadItemsFromCookie(): void {
    this.cookieData = this.getItemsFromCookie();
    this.onAmountChange();
  }

  removeItemFromCookie(index: number): void {
    const items = this.getItemsFromCookie();
    if (index >= 0 && index < items.length) {
      items.splice(index, 1);
      this.saveItemsToCookie(items);
      this.loadItemsFromCookie();
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Item removed' });
    }
  }

  clearAllItemsFromCookie(): void {
    this.cookieService.delete(this.OPD_COOKIE_NAME);
    this.cookieData = [];
    this.onAmountChange();
  }

  onAmountChange(): void {
    const totalAmount = this.cookieData.reduce((sum, item) => sum + (item.amount || 0), 0);
    const discountAmount = Number(this.opdVoucherForm.get('discountAmount')?.value) || 0;
    const paidAmount = Number(this.opdVoucherForm.get('paidAmount')?.value) || 0;

    const leftAmount = totalAmount - discountAmount - paidAmount;

    this.opdVoucherForm.patchValue({
      totalAmount: totalAmount,
      leftAmount: Math.max(leftAmount, 0)
    }, { emitEvent: false });
  }

  preventNegativeInput($event: KeyboardEvent): void {
    if (['-', 'e'].includes($event.key)) { $event.preventDefault(); }
  }

  submit() {
    this.opdVoucherForm.markAllAsTouched();

    if (this.opdVoucherForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill all required fields.' });
      return;
    }

    if (!this.cookieData.length) {
      this.messageService.add({ severity: 'error', summary: 'No Items', detail: 'Please add at least one item.' });
      return;
    }

    const totalAmount = this.opdVoucherForm.get('totalAmount')?.value;
    const discountAmount = this.opdVoucherForm.get('discountAmount')?.value;

    if (discountAmount > totalAmount) {
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Discount cannot exceed total amount.' });
      return;
    }

    this.isSubmitting = true;
    const formVals = this.opdVoucherForm.getRawValue();

    const payload: OPDVoucherEntryModel = {
      opdvno: formVals.opdvno || '',
      branchId: formVals.branchId,
      patientId: formVals.patientId,
      vdate: formVals.vdate,
      doctorId: formVals.doctorId,
      totalAmount: formVals.totalAmount,
      discountAmount: formVals.discountAmount,
      paidAmount: formVals.paidAmount,
      leftAmount: formVals.leftAmount,
      paymentType: formVals.paymentType,
      remark: formVals.remark,
      items: this.cookieData.map(item => ({
        opdvno: "",
        serviceId: item.serviceId,
        consultationId: item.consultationId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount
      })) as OPDVoucherItemModel[]
    };

    this.opdVoucherService.create(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'OPD Voucher saved successfully.' });
        this.clear();
      },
      error: (err) => {
        this.loggerService.error("Error saving OPD voucher");
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save voucher.' });
      },
      complete: () => this.isSubmitting = false
    });
  }

  clear(): void {
    const defaultBranchId = this.opdVoucherForm.get('branchId')?.value;

    this.opdVoucherForm.reset();
    this.opdVoucherForm.patchValue({
      branchId: defaultBranchId,
      vdate: new Date(),
      totalAmount: 0,
      discountAmount: 0,
      paidAmount: 0,
      leftAmount: 0,
      quantity: 1,
      unitPrice: 0,
      amount: 0,
      paymentType: 'Cash'
    });

    this.clearAllItemsFromCookie();
    this.selectedEntryType = 'Service';
    this.selectedDoctor = null as any;
    this.selectedPatient = null as any;
    this.selectedService = null as any;
    this.selectedConsultation = null as any;
    this.patientId = '';
    this.patientName = '';
    this.consultations = [];
  }
}