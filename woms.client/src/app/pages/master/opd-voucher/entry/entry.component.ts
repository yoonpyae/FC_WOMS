import { CommonModule } from "@angular/common";
import { Component, OnInit, Output, inject } from "@angular/core";
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { ViConsultationModel } from "@core_models/master/consultation.model";
import { DoctorModel } from "@core_models/master/doctor.model";
import { OPDVoucherEntryModel } from "@core_models/master/opd-voucher.model";
import { ViPatientModel } from "@core_models/master/patient.model";
import { ServiceModel } from "@core_models/master/service.model";
import { OPDVoucherService } from "@core_services/master/opd-voucher.service";
import { PatientService } from "@core_services/master/patient.service";
import { DoctorDropDownComponent } from "@shared_component/drop-down/doctor-drop-down/doctor-drop-down.component";
import { PatientDropDownComponent } from "@shared_component/drop-down/patient-drop-down/patient-drop-down.component";
import { LoggerService } from "@shared_services/logger.service";
import { SharedService } from "@shared_services/shared.service";
import { DropdownStateService } from "@shared_services/state-management/dropdown-state.service";
import EventEmitter from "events";
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
    ToastModule,
    // DoctorDropDownComponent,
    // PatientDropDownComponent
  ],
  standalone: true,
  templateUrl: './entry.component.html',
  providers: [DropdownStateService, ConfirmationService]
})
export class OPDVoucherEntryComponent implements OnInit {
  opdVouchers: OPDVoucherEntryModel[] = [];
  patients: ViPatientModel[] = [];
  services: ServiceModel[] = [];
  consultations: ViConsultationModel[] = [];



  selectedOPDVoucher!: OPDVoucherEntryModel;
  selectedDoctor: DoctorModel | null = null;
  selectedPatient!: ViPatientModel;
  selectedService!: ServiceModel;
  selectedConsultation!: ViConsultationModel;

  loading: boolean = false;
  isSubmitting: boolean = false;
  OPDModelvisible: boolean = false;
  creatOPDModelvisible: boolean = false;
  selectedPayMentType: any = null;

  paymentTypes = [
    { label: 'Cash' },
    { label: 'KBZPay' },
    { label: 'AYA Pay' },
    { label: 'Wave Money' },
    { label: 'Bank Transfer' }
  ];

  constructor(
    private patientService: PatientService,
    private opdVoucherService: OPDVoucherService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private loggerService: LoggerService,
    private confirmationService: ConfirmationService,
    private cookieService: CookieService
  ) { }

  private formBuilder = inject(FormBuilder);
  public opdVoucherForm: FormGroup = inject(FormBuilder).group({
    opdvno: [''],
    branchId: [0, Validators.required],
    patientId: [''],
    vdate: [new Date(), Validators.required],
    patientName: ['', Validators.required],
    doctorId: [null, Validators.required],
    totalAmount: [0, Validators.required],
    discountAmount: [0, Validators.required],
    paidAmount: [0, Validators.required],
    leftAmount: [0, Validators.required],
    paymentType: ['', Validators.required],
    status: true,

    serviceId: [0, Validators.required],
    consultationId: ['', Validators.required],
    result: [''],
    resultDate: [''],
    quality: [0],
    unitPrice: [0],
    amount: [0]
  });

  ngOnInit(): void {
  //   this.loadItemsFromCookie();
  //   this.getConsultations();
  //   this.getServices();
  }

  // addItem() {
  //   const quantity = this.opdVoucherForm.value;
  //   const newItem = {
  //     serviceId: this.selectedService.serviceId,
  //     consultationId: this.selectedConsultation.consultationId,
  //     quantity: quantity,
  //     unitPrice:this.selectedConsultation.fee,
  //     amount: form.tempQty * form.tempPrice
  //   };

  //   this.itemList.push(newItem);
  //   this.calculateTotals();
  // }
}
