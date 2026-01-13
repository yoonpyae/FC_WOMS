import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DoctorDropDownComponent } from '@shared_component/drop-down/doctor-drop-down/doctor-drop-down.component';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { DropdownStateService } from '@shared_services/state-management/dropdown-state.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DoctorModel } from '@core_models/master/doctor.model';
import { Detail, PharmacyVoucherModel } from '@core_models/pharmacy-voucher/pharmacy-voucher.model';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { CookieService } from 'ngx-cookie-service';
import { PharmacyVoucherService } from '@core_services/pharmacy-voucher/pharmacy-voucher.service';
import { PharmacyVoucherEntryDetailModel } from '@core_models/pharmacy-voucher/pharmacy-voucher-entry-detail.model';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectButtonModule } from 'primeng/selectbutton';
import { PatientDropDownComponent } from '@shared_component/drop-down/patient-drop-down/patient-drop-down.component';
import { ViPatientModel } from '@core_models/master/patient.model';
import { ViMainStockModel } from '@core_models/stock/main-stock.model';
import { MainStockService } from '@core_services/stock/main-stock.service';

@Component({
  selector: 'app-pharmacy-voucher-create-voucher',
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
    DoctorDropDownComponent,
    PatientDropDownComponent
  ],
  templateUrl: './create-voucher.component.html',
  providers: [ConfirmationService, DropdownStateService, DatePipe],

})
export class PharmacyCreateVoucherComponent implements OnInit {

  doctors: DoctorModel[] = [];
  selectedDoctor!: DoctorModel;

  patients: ViPatientModel[] = [];
  selectedPatient!: ViPatientModel;

  pharmacyVoucher: PharmacyVoucherModel[] = [];
  details: Detail[] = [];

  cookieData: PharmacyVoucherEntryDetailModel[] = [];

  mainStocks: ViMainStockModel[] = [];

  selectedMainStock!: ViMainStockModel;

  loading: boolean = false;
  allListloading: boolean = false;
  labTestloading: boolean = false;
  labSubloading: boolean = false;
  labPharmacyloading: boolean = false;
  labmodalVisible: boolean = false;
  submodalVisible: boolean = false;
  PharmacymodalVisible: boolean = false;
  OpdModelvisible: boolean = false;
  creatOpdModeelvisible: boolean = false;
  checkedValue: boolean = false;
  formSubmitted: boolean = false;

  paymentType!: string;
  patientId = '';
  name = '';
  doctorName = '';
  salePrice: number | null = 0;
  typeCode: number | null = 0;
  typeName: string | null = '';
  groundBalance: number | null = 0;
  mode: string = 'OutPatient';

  genders = [{ label: 'Male' }, { label: 'Female' }];

  choiceOptions = [
    { label: 'Out-Patient', value: 'OutPatient' },
    { label: 'In-Patient', value: 'InPatient' }
  ];

  private readonly Issue_COOKIE_NAME = 'pharmacy-voucher-details';

  constructor(
    private sharedService: SharedService,
    private loggerService: LoggerService,
    private cookieService: CookieService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private pharmacyVoucherService: PharmacyVoucherService,
    private mainStockService: MainStockService,
  ) { }

  private formBuilder = inject(FormBuilder);
  public pharmacyVoucherForm: FormGroup = this.formBuilder.group({
    vno: [''],
    branchId: [0, Validators.required],
    patientId: [''],
    vdate: [new Date(), Validators.required],
    patientName: ['', Validators.required],
    referDoctorId: [null, Validators.required],
    totalAmount: [0, Validators.required],
    discountAmount: [0, Validators.required],
    paidAmount: [0, Validators.required],
    leftAmount: [0, Validators.required],
    netAmount: [0, Validators.required],
    paymentType: [''],
    processStatus: [''],
    issuePerson: ['', Validators.required],
    issueDate: [new Date()],
    remark: [null as string | null],

    // Extra fields for item entry
    itemCode: [''],
    typeName: [''],
    itemName: [''],
    quantity: [0],
    price: [0],
    groundBalance: [0],
  });

  ngOnInit(): void {
    this.loadItemsFromCookie();
    this.getPharmacyStock();
  }
  //#region Cookie

  addItemToCookie(): void {
    const quantity = this.pharmacyVoucherForm.value.quantity;

    if (!quantity || quantity <= 0) {
      this.showMessage('error', 'Invalid Quantity', 'Please enter a valid quantity greater than zero.');
      return;
    }

    if (quantity > (this.selectedMainStock.groundBalance ?? 0)) {
      this.showMessage('error', 'Quantity Exceeds Stock', 'Quantity cannot be greater than ground balance.');
      return;
    }

    const newItem: PharmacyVoucherEntryDetailModel = {
      itemCode: this.selectedMainStock.itemCode,
      itemName: this.selectedMainStock.itemName ?? "",
      typeCode: this.selectedMainStock.typeCode,
      typeName: this.selectedMainStock.typeName ?? "",
      groundBalance: this.selectedMainStock.groundBalance,
      quantity: quantity,
      price: this.selectedMainStock.salePrice,
      amount: quantity * this.selectedMainStock.salePrice
    };

    const existingItems = this.getItemsFromCookie();
    const existingItem = existingItems.find(item => item.itemCode === newItem.itemCode && item.typeName === newItem.typeName);

    if (existingItem) {
      existingItem.quantity += newItem.quantity;
      existingItem.amount += newItem.amount;
    } else {
      existingItems.push(newItem);
    }

    this.saveItemsToCookie(existingItems);
    this.cookieData = existingItems;
    this.onAmountChange();
    this.resetIssueDetailFields();

    this.showMessage('success', 'Success', 'Item added to Stock Issue list');
  }

  private showMessage(severity: string, summary: string, detail: string): void {
    this.messageService.add({ severity, summary, detail });
  }

  resetIssueDetailFields(): void {
    this.pharmacyVoucherForm.patchValue({
      itemCode: '',
      typeName: '',
      itemName: '',
      quantity: 0,
      groundBalance: 0
    });
    this.selectedMainStock = undefined!;
    this.typeCode = null;
    this.typeName = null;
    this.salePrice = 0;
    this.groundBalance = 0;
  }

  getItemsFromCookie(): PharmacyVoucherEntryDetailModel[] {
    const cookieData = this.cookieService.get(this.Issue_COOKIE_NAME);
    try {
      return cookieData ? JSON.parse(cookieData) : [];
    } catch {
      return [];
    }
  }

  saveItemsToCookie(items: PharmacyVoucherEntryDetailModel[]): void {
    this.cookieService.set(this.Issue_COOKIE_NAME, JSON.stringify(items), 1);
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
      this.showMessage('success', 'Success', 'Item removed from stock issue list');
    }
    this.onAmountChange();
  }

  clearAllItemsFromCookie(): void {
    this.cookieService.delete(this.Issue_COOKIE_NAME);
    this.cookieData = [];
    this.showMessage('success', 'Success', 'All items removed from stock issue list');
  }

  confirmClearAllItems(): void {
    const items = this.getItemsFromCookie();
    if (!items.length) {
      return;
    }
    this.confirmationService.confirm({
      message: 'Do you want to delete all records?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => this.clearAllItemsFromCookie(),
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Action cancelled',
          life: 3000
        });
      }
    });
  }

  //#endregion

  //#region Calculate Amounts

  onAmountChange(): void {
    let totalAmount = this.calculateTotalAmountFromCookie();
    let discountAmount = Number(this.pharmacyVoucherForm.controls['discountAmount'].value) || 0;
    let paidAmount = Number(this.pharmacyVoucherForm.controls['paidAmount'].value) || 0;

    let netAmount = totalAmount - discountAmount;
    let leftAmount = netAmount - paidAmount;

    this.pharmacyVoucherForm.controls['totalAmount'].setValue(totalAmount);
    this.pharmacyVoucherForm.controls['netAmount'].setValue(Math.max(netAmount, 0));
    this.pharmacyVoucherForm.controls['leftAmount'].setValue(Math.max(leftAmount, 0));
  }

  private calculateTotalAmountFromCookie(): number {
    return this.getItemsFromCookie().reduce((sum, item) => sum + (item.amount ?? 0), 0);
  }

  //#endregion

  //#region onDoctorChange
  onDoctorChange(event: any): void {
    this.loggerService.info("Doctor changed");
    if (this.selectedDoctor) {
      this.pharmacyVoucherForm.get('referDoctorId')?.setValue(this.selectedDoctor.doctorId);
    } else {
      this.pharmacyVoucherForm.get('referDoctorId')?.setValue(null);
    }
  }
  //#endregion

  //#region OnChange Method
  getPharmacyStock(): void {
    const branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');
    this.loading = true;

    this.mainStockService.getByActive(branchId).subscribe({
      next: (res) => {
        this.mainStocks = (res.data as ViMainStockModel[])
          .filter(item => item.itemCode.startsWith('Z'));
      },
      error: () => { },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onStockItemChange(event: any): void {
    this.loggerService.info("Pharmacy-Stock Item Code Change");
    if (this.selectedMainStock) {
      this.pharmacyVoucherForm.controls['itemCode'].setValue(this.selectedMainStock.itemCode);

      // Update the related fields
      this.typeName = this.selectedMainStock.typeName || null;
      this.salePrice = this.selectedMainStock.salePrice || null;
      this.groundBalance = this.selectedMainStock.groundBalance || null;

    } else {
      this.resetStockItemFields();
    }
  }

  // Add this helper method
  private resetStockItemFields(): void {
    this.typeName = null;
    this.salePrice = null;
    this.groundBalance = null;
    this.pharmacyVoucherForm.controls['itemCode'].setValue(null);
  }

  onModeChange() {
    if (!this.mode) {
      this.mode = 'OutPatient';
    }
    this.name = '';
  }
  //#endregion

  //#region Submit Method
  submit() {
    this.formSubmitted = true;
    let branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');
    this.pharmacyVoucherForm.markAllAsTouched();

    this.pharmacyVoucherForm.patchValue({
      patientId: this.patientId,
      patientName: this.name,
      BranchId: branchId
    });

    if (this.pharmacyVoucherForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields.'
      });
      return;
    }

    const detailsFromCookie = this.getItemsFromCookie();
    if (!detailsFromCookie.length) {
      this.messageService.add({
        severity: 'error',
        summary: 'No Items',
        detail: 'Please add at least one item to the voucher.'
      });
      return;
    }

    const referDoctorId = this.pharmacyVoucherForm.get('referDoctorId')?.value;
    if (!referDoctorId) {
      this.messageService.add({
        severity: 'error',
        summary: 'No Refer Doctor',
        detail: 'Please select a refer doctor.'
      });
      return;
    }


    if (this.patientId && this.pharmacyVoucherForm.get('leftAmount')?.value > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Payment Error',
        detail: 'Out-patients must pay the full amount at once. No credit allowed.'
      });
      return;
    }

    let payAmount = this.pharmacyVoucherForm.get('paidAmount')?.value;
    let netAmount = this.pharmacyVoucherForm.get('netAmount')?.value;
    let discountAmount = this.pharmacyVoucherForm.get('discountAmount')?.value;
    let totalAmount = this.pharmacyVoucherForm.get('totalAmount')?.value;

    if (discountAmount > totalAmount) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Discount amount cannot exceed the total amount.',
      });
      return;
    }

    if (payAmount > netAmount) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Pay amount cannot exceed the net amount.',
      });
      return;
    }

    let model = this.pharmacyVoucherForm.value as PharmacyVoucherModel;

    let requestBody: PharmacyVoucherModel = {
      vno: '',
      branchId: branchId,
      patientId: model.patientId || null,
      vdate: new Date(),
      referDoctorId: model.referDoctorId,
      totalAmount: model.totalAmount,
      discountAmount: model.discountAmount,
      paidAmount: model.paidAmount,
      leftAmount: model.leftAmount,
      paymentType: '',
      processStatus: '',
      issuePerson: model.issuePerson || null,
      issueDate: new Date(),
      createdOn: null,
      createdBy: null,
      updatedOn: null,
      updatedBy: null,
      deletedOn: null,
      deletedBy: null,
      remark: model.remark,
      details: detailsFromCookie.map(item => ({
        vno: "",
        itemCode: item.itemCode,
        typeCode: item.typeCode,
        qty: item.quantity,
        price: item.price,
        amount: item.amount,
      })) as Detail[]
    };

    this.loading = true;
    this.pharmacyVoucherService.create(requestBody).subscribe({
      next: () => {
        this.loading = false;
        this.clear();
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Pharmacy voucher saved successfully.'
        });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  //#endregion

  //#region Clear Method
  clear(): void {
    this.pharmacyVoucherForm.reset();
    this.pharmacyVoucherForm.patchValue({
      vdate: new Date(),
      issueDate: new Date(),
      totalAmount: 0,
      discountAmount: 0,
      paidAmount: 0,
      leftAmount: 0,
      netAmount: 0,
      quantity: 0,
    });

    this.cookieService.delete(this.Issue_COOKIE_NAME);
    this.selectedDoctor = undefined!;
    this.selectedMainStock = undefined!;
    this.salePrice = 0;
    this.typeName = '';
    this.groundBalance = 0;
    this.patientId = '';
    this.name = '';
    this.cookieData = [];
    this.formSubmitted = false;
    this.selectedPatient = null as any;
    if (this.mode = 'OutPatient') {
      this.mode = 'InPatient';
    } else {
      this.mode = 'OutPatient';
    }
  }
  //#endregion

  preventNegativeInput($event: KeyboardEvent): void {
    if (['-', 'e'].includes($event.key)) {
      $event.preventDefault();
    }
  }

  //#region OPD

  onOPDSelected(opd: ViPatientModel): void {
    this.selectedPatient = opd;

    if (opd) {
      this.name = opd.patientName;
      this.patientId = opd.patientId;
    } else {
      this.name = '';
      this.patientId = '';
    }
  }
  //#endregion
}
