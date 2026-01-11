import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientModel } from '@core_models/master/patient.model';
import { MainStockModel } from '@core_models/stock/main-stock.model';
import { PacketTypeModel } from '@core_models/stock/packet-type.model';
import { SaleEntryDetailModel, SaleEntryDisplayModel } from '@core_models/stock/sale/sale-entry-detail.model';
import { SaleEntryModel } from '@core_models/stock/sale/sale-entry.model';
import { SaleModel } from '@core_models/stock/sale/sale.model';
import { StockItemModel } from '@core_models/stock/stock-item.model';
import { PatientService } from '@core_services/master/patient.service';
import { MainStockService } from '@core_services/stock/main-stock.service';
import { SaleService } from '@core_services/stock/sale.service';
import { ItemCodeDropdownComponent } from '@shared_component/drop-down/item-code-dropdown/item-code-dropdown.component';
import { PacketTypeDropdownComponent } from '@shared_component/drop-down/packet-type-dropdown/packet-type-dropdown.component';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { DropdownStateService } from '@shared_services/state-management/dropdown-state.service';
import { CookieService } from 'ngx-cookie-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
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

@Component({
  selector: 'app-sale-entry',
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
    ConfirmDialogModule,
    DatePickerModule,

    // Custom Components
    ItemCodeDropdownComponent,
    PacketTypeDropdownComponent
  ],
  providers: [DatePipe, DropdownStateService, ConfirmationService],
  templateUrl: './entry.component.html'
})
export class EntryComponent implements OnInit {
  sales: SaleModel[] = [];
  saleDetails: SaleEntryDisplayModel[] = [];
  patients: PatientModel[] = [];
  packetTypes: PacketTypeModel[] = [];
  currentMainStock!: MainStockModel;

  selectedSale!: SaleModel;
  selectedStockItem: StockItemModel | null = null;
  selectedPacketType: PacketTypeModel | null = null;
  selectedPatient!: PatientModel;
  selectedRow: SaleEntryDetailModel | null = null;
  selectedPayMentType: any = null;

  loading: boolean = false;
  isSubmitting: boolean = false;
  modalVisible: boolean = false;
  uploadVisible: boolean = false;
  discountExceedsTotal: boolean = false;
  isDisabled: boolean = true;
  capacity: number | null = null;
  typeCode: number | null = null;

  @Output() onSubmitted = new EventEmitter<boolean>();

  private readonly SALE_COOKIE_NAME = 'sale_details';
  readonly paymentTypes = [{ label: 'Cash' }, { label: 'Credit' }];

  private formBuilder = inject(FormBuilder);
  public saleForm: FormGroup = this.formBuilder.group({
    saleVno: [0, Validators.required],
    branchId: [0, Validators.required],
    manualVno: ['', Validators.required],
    patientId: ['', Validators.required],
    saleDate: [{ value: new Date(), disabled: true }, Validators.required],
    totalAmount: [{ value: 0, disabled: true }, [Validators.min(0)]],
    discountAmount: [0, [Validators.required, Validators.min(0)]],
    netAmount: [{ value: 0, disabled: true }, [Validators.min(0)]],
    paymentType: ['', Validators.required],

    status: [false],
    remark: [null as string | null],
    itemCode: [''],
    typeCode: [0],
    qty: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(0)]],
    totalQty: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
  });

  constructor(
    private saleService: SaleService,
    private patientService: PatientService,
    private messageService: MessageService,
    private loggerService: LoggerService,
    private shareService: SharedService,
    private mainStockService: MainStockService,
    private dropdownStateService: DropdownStateService,
    private cookieService: CookieService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.getPatient();
    this.loadItemsFromCookie();
  }

  submit(): void {
    this.isSubmitting = true;
    this.loading = true;

    ['totalAmount', 'netAmount'].forEach(field =>
      this.saleForm.get(field)?.enable()
    );

    let branchId = Number.parseInt(this.shareService.getDefaultBranchId() ?? '0');
    this.saleForm.controls['branchId'].setValue(branchId);
    this.saleForm.markAllAsTouched();

    if (this.saleForm.invalid) {
      return this.abortSubmission('Please fill all required fields');
    }

    if (!this.selectedPayMentType) {
      return this.abortSubmission('Please select a payment type');
    }

    if (!this.selectedPatient || !this.selectedPatient.patientId) {
      return this.abortSubmission('Please select a Patient');
    }

    if (this.saleDetails.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Items',
        detail: 'Please add at least one item before submitting',
        life: 3000
      });
      return this.abortSubmission();
    }

    let model = this.saleForm.value as SaleEntryModel;

    let requestBody: SaleEntryModel = {
      saleVno: "",
      branchId: branchId,
      manualVno: model.manualVno,
      patientId: this.selectedPatient.patientId,
      saleDate: new Date(),
      totalAmount: model.totalAmount,
      discountAmount: model.discountAmount,
      netAmount: model.netAmount,
      paymentType: this.selectedPayMentType.label,
      paidDate: null,
      createdOn: null,
      createdBy: null,
      updatedOn: null,
      updatedBy: null,
      deletedOn: null,
      deletedBy: null,
      status: true,
      remark: model.remark || null,
      detail: this.saleDetails.map(item => ({
        saleVno: "",
        itemCode: item.itemCode,
        typeCode: item.typeCode,
        qty: item.qty,
        price: item.price,
      })) as SaleEntryDetailModel[]
    };

    this.saleService.create(requestBody).subscribe({
      next: () => {

        this.messageService.add({
          key: 'globalMessage',
          severity: 'success',
          summary: 'Success',
          detail: `sale Created!`
        });

        this.resetForm();
        this.isSubmitting = false;
        this.loading = false;
        this.onSubmitted.emit(true);
      },
      error: (err) => {
        this.messageService.add({
          key: 'globalMessage',
          severity: 'error',
          summary: 'Error',
          detail: err.error?.message
        });
        this.isSubmitting = false;
        this.loading = false;
      }
    });
  }

  abortSubmission(msg?: string): void {
    if (msg) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: msg
      });
    }
    this.isSubmitting = false;
    this.loading = false;
  }

  resetForm(): void {
    this.saleForm.reset({
      saleVno: 0,
      branchId: Number.parseInt(this.shareService.getDefaultBranchId() ?? '0'),
      manualVno: '',
      patientId: '',
      saleDate: new Date(),
      totalAmount: 0,
      discountAmount: 0,
      netAmount: 0,
      paymentType: '',
      status: false,
      remark: null,
      itemCode: '',
      typeCode: 0,
      qty: 0,
      price: 0,
      totalQty: 0,
    });

    this.selectedPatient = null as any;
    this.selectedPayMentType = null;
    this.saleDetails = [];
    this.cookieService.delete(this.SALE_COOKIE_NAME);
    this.loading = false;
  }

  //#region Service Calls
  getPatient(): void {
    let branchId = Number.parseInt(this.shareService.getDefaultBranchId() ?? '0');
    this.loading = true;

    this.patientService.get(branchId).subscribe({
      next: (res) => {
        this.patients = res.data as PatientModel[];
        this.selectedPatient = this.patients.find(
          x => x.patientId == this.saleForm.controls['patientId'].value
        )!;
        this.onPatientChange();
      },
      error: () => {
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  //#endregion

  //#region Event Handlers
  onPatientChange(): void {
    let control = this.saleForm.controls['patientId'];
    control.setValue(this.selectedPatient?.patientId ?? null);
  }

  onStockItemChange(event: any): void {
    this.loggerService.info("Stock Item Change");
    if (this.selectedStockItem !== undefined && this.selectedStockItem !== null) {
      this.saleForm.controls['itemCode'].setValue(this.selectedStockItem.itemCode);
      this.getMainStockItemByCode(this.selectedStockItem.itemCode);
    } else {
      this.saleForm.controls['itemCode'].setValue(null);
      this.saleForm.controls['typeName'].setValue(null);

      this.typeCode = null;
      this.capacity = null;

      this.selectedPacketType = undefined!;
    }
  }

  getMainStockItemByCode(code: string): void {
    let clinicId: number = Number.parseInt((this.shareService.getDefaultClinicId() ?? '0'));
    this.mainStockService.getByCode(code, clinicId).subscribe({
      next: (res) => {
        this.currentMainStock = res.data as MainStockModel;
        this.typeCode = this.currentMainStock.typeCode;

        // Set the selected packet type based on typeCode
        this.dropdownStateService.setSelectedById('type-code-dropdown', this.typeCode);

        // Get the capacity from the selected packet type
        let control = this.saleForm.controls['typeCode'];

        if (this.selectedPacketType !== undefined && this.selectedPacketType !== null) {
          control.setValue(this.selectedPacketType.typeCode);
          this.capacity = this.selectedPacketType.capacity;
        } else {
          this.capacity = null;
          control.setValue(null);
        }
      },
      error: () => {
      },
    });
  }

  onPacketTypeChange(event: any): void {
    // this.loggerService.info("Packet Type Change");
    // let control = this.purchaseForm.controls['typeCode'];

    // if (this.selectedPacketType) {
    //   control.setValue(this.selectedPacketType.typeCode);
    //   this.capacity = this.selectedPacketType.capacity;
    // } else {
    //   this.capacity = null;
    //   control.setValue(null);
    // }
  }

  addItemToCookie(): void {
    if (!this.validateItemForm()) return;

    if (!this.selectedStockItem || !this.selectedPacketType ||
      !this.saleForm.value.price || !this.saleForm.value.qty) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields'
      });
      return;
    }

    let saleVno = this.saleForm.value.saleVno;
    if (!saleVno) {
      this.saleForm.controls['saleVno'].setValue(saleVno);
    }

    let existingItems = this.getItemsFromCookie();

    let existingItem = existingItems.find(i =>
      i.itemCode === this.selectedStockItem!.itemCode &&
      i.typeCode === this.selectedPacketType!.typeCode
    );

    if (existingItem) {
      existingItem.qty += this.saleForm.value.qty;
      existingItem.price = this.saleForm.value.price;
      existingItem.totalQty = existingItem.qty * existingItem.price;
      existingItem.saleVno = saleVno;
    } else {
      let newItem = {
        itemCode: this.selectedStockItem.itemCode,
        itemName: this.selectedStockItem.itemName,
        typeCode: this.selectedPacketType.typeCode,
        typeName: this.selectedPacketType.typeName,
        capacity: this.capacity || 0,
        price: this.saleForm.value.price,
        qty: this.saleForm.value.qty,
        totalQty: Number((this.saleForm.value.price * this.saleForm.value.qty).toFixed(2)),
      };

      existingItems.push(newItem);
    }

    this.saveItemsToCookie(existingItems);
    this.loadItemsFromCookie();
    this.updateAmounts();
    this.resetSaleDetailFields();

    this.messageService.add({
      severity: 'success',
      summary: 'Added',
      detail: 'Item added successfully',
      life: 3000
    });
  }

  removeItem(item: SaleEntryDetailModel): void {
    let updatedItems = this.getItemsFromCookie().filter(i =>
      i.itemCode !== item.itemCode ||
      i.typeCode !== item.typeCode
    );

    this.saveItemsToCookie(updatedItems);
    this.loadItemsFromCookie();

    this.messageService.add({
      severity: 'success',
      summary: 'Removed',
      detail: 'Item deleted successfully',
      life: 3000
    });
  }

  //#region Helper Methods
  private validateItemForm(): boolean {
    if (!this.selectedStockItem || !this.selectedPacketType ||
      !this.saleForm.value.price || !this.saleForm.value.qty) {
      this.showError('Please fill all required fields');
      return false;
    }

    if (this.saleForm.value.price <= 0 || this.saleForm.value.qty <= 0) {
      this.showError('Price and Quantity must be greater than 0');
      return false;
    }
    return true;
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  }

  resetSaleDetailFields(): void {
    this.selectedStockItem = null;
    this.selectedPacketType = null;
    this.capacity = null;

    this.saleForm.patchValue({
      itemCode: '',
      typeCode: null,
      price: 0,
      qty: 0,
      totalQty: 0,
    });
  }

  //#endregion

  //#region Cookie Operations
  getItemsFromCookie(): SaleEntryDetailModel[] {
    let cookieData = this.cookieService.get(this.SALE_COOKIE_NAME);
    return cookieData ? JSON.parse(cookieData) : [];
  }

  saveItemsToCookie(items: SaleEntryDetailModel[]): void {
    let jsonString = JSON.stringify(items);
    this.cookieService.set(this.SALE_COOKIE_NAME, jsonString, 1); // Expires in 1 day
  }

  loadItemsFromCookie(): void {
    let cookieItems = this.getItemsFromCookie();

    this.saleDetails = cookieItems.map(item => ({
      ...item
    })) as SaleEntryDisplayModel[];

    this.updateAmounts();
  }


  //#endregion

  //#region Calculation Methods

  calcuateTotalAmount(): void {
    let { price, qty } = this.saleForm.controls;
    let totalQty = price.value * qty.value;
    this.saleForm.controls['totalQty'].setValue(isNaN(totalQty) ? 0 : totalQty);
  }

  updateAmounts(): void {
    let totalAmount = this.calculateTotalAmountFromCookie();
    let discountAmount = Number(this.saleForm.controls['discountAmount'].value) || 0;

    this.discountExceedsTotal = discountAmount > totalAmount;

    let netAmount = totalAmount - discountAmount;

    this.saleForm.controls['totalAmount'].setValue(totalAmount);
    this.saleForm.controls['netAmount'].setValue(Math.max(netAmount, 0));
  }

  private calculateTotalAmountFromCookie(): number {
    return this.getItemsFromCookie().reduce((sum, item) => sum + (item.totalQty ?? 0), 0);
  }

  private calculateSalePriceValue(): number {
    let price = this.saleForm.value.price;
    let percentage = this.saleForm.value.salePercentage || 0;
    let sale = price + (price * percentage / 100);
    return Number(sale.toFixed(2));
  }

  //#endregion

  //#region Validation Methods
  preventNegativeInput($event: KeyboardEvent): void {
    if (['-', 'e'].includes($event.key)) {
      $event.preventDefault();
    }
  }

  hasAnyItems(): boolean {
    return this.saleDetails.length > 0 || this.getItemsFromCookie().length > 0;
  }

  removeAllItems(): void {
    if (this.saleDetails.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Items',
        detail: 'There are no items to remove',
        life: 3000
      });
      return;
    }

    this.cookieService.delete(this.SALE_COOKIE_NAME);
    this.saleDetails = [];
    this.updateAmounts();

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'All items removed successfully',
      life: 3000
    });
  }

  clearAll(): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to cancel? All unsaved data will be lost.',
      header: 'Confirm Cancel',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.clearAllData();
        this.selectedSale = null as any;
        this.sales = [];
      }
    });
  }

  //#endregion

  //#region ComfirmationService
  confirm(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete all records?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.removeAllItems();
      },
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

  clearAllData(): void {
    // Reset the form to initial state
    this.saleForm.reset({
      saleVno: 0,
      branchId: Number.parseInt(this.shareService.getDefaultBranchId() ?? '0'),
      manualVno: '',
      supplierId: 0,
      salePercentage: 15,
      salePrice: null,
      saleDate: new Date(),
      totalAmount: 0,
      discountAmount: 0,
      netAmount: 0,
      paymentType: '',
      status: false,
      remark: null,
      itemCode: '',
      typeCode: 0,
      qty: 0,
      price: 0,
      totalQty: 0,
    });

    // Clear all selections
    this.selectedPatient = null as any;
    this.selectedStockItem = null;
    this.selectedPacketType = null;
    this.selectedPayMentType = null;
    this.selectedRow = null;
    this.capacity = null;

    // Clear sale details and cookie
    this.saleDetails = [];
    this.cookieService.delete(this.SALE_COOKIE_NAME);

    // Show success message
    this.messageService.add({
      severity: 'success',
      summary: 'Cleared',
      detail: 'All data has been cleared',
      life: 3000
    });
  }

  //#endregion
}
