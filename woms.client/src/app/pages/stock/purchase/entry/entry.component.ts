import { CommonModule, DatePipe, formatDate } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { PacketTypeModel } from '@core_models/stock/packet-type.model';
import { PurchaseEntryDetailModel, PurchaseEntryDisplayModel } from '@core_models/stock/purchase/purchase-entry-detail.model';
import { PurchaseModel } from '@core_models/stock/purchase/purchase.model';
import { StockItemModel } from '@core_models/stock/stock-item.model';
import { SupplierModel } from '@core_models/master/supplier.model';
import { SupplierService } from '@core_services/master/supplier.service';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { DropdownStateService } from '@shared_services/state-management/dropdown-state.service';
import { ItemCodeDropdownComponent } from '@shared_component/drop-down/item-code-dropdown/item-code-dropdown.component';
import { PacketTypeDropdownComponent } from '@shared_component/drop-down/packet-type-dropdown/packet-type-dropdown.component';
import { PurchaseService } from '@core_services/stock/purchase.service';
import { PurchaseEntryModel } from '@core_models/stock/purchase/purchase-entry.model';
import { MainStockModel } from '@core_models/stock/main-stock.model';
import { MainStockService } from '@core_services/stock/main-stock.service';

@Component({
  selector: 'app-purchase-entry',
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
  purchases: PurchaseModel[] = [];
  purchaseDetails: PurchaseEntryDisplayModel[] = [];
  suppliers: SupplierModel[] = [];
  packetTypes: PacketTypeModel[] = [];
  currentMainStock!: MainStockModel;

  selectedPurchase!: PurchaseModel;
  selectedStockItem: StockItemModel | null = null;
  selectedPacketType: PacketTypeModel | null = null;
  selectedSupplier!: SupplierModel;
  selectedRow: PurchaseEntryDetailModel | null = null;
  selectedPayMentType: any = null;

  loading: boolean = false;
  isSubmitting: boolean = false;
  modalVisible: boolean = false;
  uploadVisible: boolean = false;
  discountExceedsTotal: boolean = false;
  isDisabled: boolean = true;
  capacity: number | null = null;
  typeCode: number | null = null;
  minExpireDate: Date = new Date();

  @Output() onSubmitted = new EventEmitter<boolean>();

  private readonly PURCHASE_COOKIE_NAME = 'purchase_details';
  readonly paymentTypes = [{ label: 'Cash' }, { label: 'Credit' }];

  private formBuilder = inject(FormBuilder);
  public purchaseForm: FormGroup = this.formBuilder.group({
    purchaseVno: [0, Validators.required],
    branchId: [0, Validators.required],
    manualVno: ['', Validators.required],
    supplierId: [0, Validators.required],
    salePercentage: [15],
    salePrice: [{ value: null, disabled: true }],
    purchaseDate: [{ value: new Date(), disabled: true }, Validators.required],
    totalAmount: [{ value: 0, disabled: true }, [Validators.min(0)]],
    discountAmount: [0, [Validators.required, Validators.min(0)]],
    netAmount: [{ value: 0, disabled: true }, [Validators.min(0)]],
    payAmount: [0, [Validators.required, Validators.min(0)]],
    leftAmount: [{ value: 0, disabled: true }, [Validators.min(0)]],
    paymentType: ['', Validators.required],

    status: [false],
    remark: [null as string | null],
    itemCode: [''],
    typeCode: [0],
    qty: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(0)]],
    totalQty: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0)]],
    expireDate: [new Date(), Validators.required],
    saleQty: [null as string | null],
  });

  constructor(
    private purchaseService: PurchaseService,
    private supplierService: SupplierService,
    private messageService: MessageService,
    private loggerService: LoggerService,
    private shareService: SharedService,
    private mainStockService: MainStockService,
    private dropdownStateService: DropdownStateService,
    private cookieService: CookieService,
    private confirmationService: ConfirmationService,
  ) { }

  ngOnInit(): void {
    this.getSuppliers();
    this.onPaymentTypeChange();
    this.minExpireDate.setDate(this.minExpireDate.getDate() + 1);
    this.loadItemsFromCookie();
  }

  //#region Form Submission
  submit(): void {
    this.isSubmitting = true;
    this.loading = true;

    ['totalAmount', 'netAmount', 'leftAmount'].forEach(field =>
      this.purchaseForm.get(field)?.enable()
    );

    let branchId = Number.parseInt(this.shareService.getDefaultBranchId() ?? '0');
    this.purchaseForm.controls['branchId'].setValue(branchId);
    this.purchaseForm.markAllAsTouched();

    if (this.purchaseForm.invalid) {
      return this.abortSubmission('Please fill all required fields');
    }

    if (!this.selectedPayMentType) {
      return this.abortSubmission('Please select a payment type');
    }

    if (!this.selectedSupplier || !this.selectedSupplier.supplierId) {
      return this.abortSubmission('Please select a supplier');
    }

    if (this.purchaseDetails.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Items',
        detail: 'Please add at least one item before submitting',
        life: 3000
      });
      return this.abortSubmission();
    }

    let model = this.purchaseForm.value as PurchaseEntryModel;

    let requestBody: PurchaseEntryModel = {
      purchaseVno: "",
      branchId: branchId,
      manualVno: model.manualVno,
      supplierId: this.selectedSupplier.supplierId,
      purchaseDate: new Date(),
      totalAmount: model.totalAmount,
      discountAmount: model.discountAmount,
      netAmount: model.netAmount,
      payAmount: model.payAmount,
      leftAmount: model.leftAmount,
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
      detail: this.purchaseDetails.map(item => ({
        purchaseVno: "",
        itemCode: item.itemCode,
        typeCode: item.typeCode,
        qty: item.qty,
        price: item.price,
        expireDate: item.expireDate,
        saleQty: item.saleQty,
        salePrice: item.salePrice
      })) as PurchaseEntryDetailModel[]
    };

    this.purchaseService.create(requestBody).subscribe({
      next: () => {

        this.messageService.add({
          key: 'globalMessage',
          severity: 'success',
          summary: 'Success',
          detail: `Purchase Created!`
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
    this.purchaseForm.reset({
      purchaseVno: 0,
      branchId: Number.parseInt(this.shareService.getDefaultBranchId() ?? '0'),
      manualVno: '',
      supplierId: 0,
      salePercentage: 15,
      salePrice: null,
      purchaseDate: new Date(),
      totalAmount: 0,
      discountAmount: 0,
      netAmount: 0,
      payAmount: 0,
      leftAmount: 0,
      paymentType: '',
      status: false,
      remark: null,
      itemCode: '',
      typeCode: 0,
      qty: 0,
      price: 0,
      totalQty: 0,
      expireDate: new Date(),
      saleQty: null
    });

    this.selectedSupplier = null as any;
    this.selectedPayMentType = null;
    this.purchaseDetails = [];
    this.cookieService.delete(this.PURCHASE_COOKIE_NAME);
    this.loading = false;
  }

  //#endregion

  //#region Service Calls
  getSuppliers(): void {
    let branchId = Number.parseInt(this.shareService.getDefaultBranchId() ?? '0');
    this.loading = true;

    this.supplierService.get(branchId).subscribe({
      next: (res) => {
        this.suppliers = res.data as SupplierModel[];
        this.selectedSupplier = this.suppliers.find(
          x => x.supplierId == this.purchaseForm.controls['supplierId'].value
        )!;
        this.onSupplierChange();
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
  onSupplierChange(): void {
    let control = this.purchaseForm.controls['supplierId'];
    control.setValue(this.selectedSupplier?.supplierId ?? null);
  }

  onStockItemChange(event: any): void {
    this.loggerService.info("Stock Item Change");
    if (this.selectedStockItem !== undefined && this.selectedStockItem !== null) {
      this.purchaseForm.controls['itemCode'].setValue(this.selectedStockItem.itemCode);
      this.getMainStockItemByCode(this.selectedStockItem.itemCode);
    } else {
      this.purchaseForm.controls['itemCode'].setValue(null);
      this.purchaseForm.controls['typeName'].setValue(null);

      this.typeCode = null;
      this.capacity = null;

      this.selectedPacketType = undefined!;
    }
  }

  getMainStockItemByCode(code: string): void {
    this.mainStockService.getByCode(code).subscribe({
      next: (res) => {
        this.currentMainStock = res.data as MainStockModel;
        this.typeCode = this.currentMainStock.typeCode;

        // Set the selected packet type based on typeCode
        this.dropdownStateService.setSelectedById('type-code-dropdown', this.typeCode);

        // Get the capacity from the selected packet type
        let control = this.purchaseForm.controls['typeCode'];

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


  onPaymentTypeChange(): void {
    let payAmountControl = this.purchaseForm.get('payAmount');
    this.selectedPayMentType ? payAmountControl?.enable() : payAmountControl?.disable();
  }

  //#endregion

  //#region Item Management
  addItemToCookie(): void {
    if (!this.validateItemForm()) return;

    if (!this.selectedStockItem || !this.selectedPacketType ||
      !this.purchaseForm.value.price || !this.purchaseForm.value.qty ||
      !this.purchaseForm.value.expireDate) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all required fields'
      });
      return;
    }

    let purchaseVno = this.purchaseForm.value.purchaseVno;
    if (!purchaseVno) {
      this.purchaseForm.controls['purchaseVno'].setValue(purchaseVno);
    }

    let existingItems = this.getItemsFromCookie();

    let existingItem = existingItems.find(i =>
      i.itemCode === this.selectedStockItem!.itemCode &&
      i.typeCode === this.selectedPacketType!.typeCode
    );

    if (existingItem) {
      existingItem.qty += this.purchaseForm.value.qty;
      existingItem.price = this.purchaseForm.value.price;
      existingItem.expireDate = this.purchaseForm.value.expireDate || null;
      existingItem.Amount = existingItem.qty * existingItem.price;
      existingItem.purchaseVno = purchaseVno;
    } else {
      let newItem = {
        itemCode: this.selectedStockItem.itemCode,
        itemName: this.selectedStockItem.itemName,
        typeCode: this.selectedPacketType.typeCode,
        typeName: this.selectedPacketType.typeName,
        capacity: this.capacity || 0,
        price: this.purchaseForm.value.price,
        qty: this.purchaseForm.value.qty,
        Amount: Number((this.purchaseForm.value.price * this.purchaseForm.value.qty).toFixed(2)),
        salePrice: this.calculateSalePriceValue(),
        expireDate: this.purchaseForm.value.expireDate ? formatDate(this.purchaseForm.value.expireDate, 'yyyy-MM-dd', 'en-US') : null,
        saleQty: null
      };

      existingItems.push(newItem);
    }

    this.saveItemsToCookie(existingItems);
    this.loadItemsFromCookie();
    this.updateAmounts();
    this.resetPurchaseDetailFields();

    this.messageService.add({
      severity: 'success',
      summary: 'Added',
      detail: 'Item added successfully',
      life: 3000
    });
  }

  removeItem(item: PurchaseEntryDetailModel): void {
    let updatedItems = this.getItemsFromCookie().filter(i =>
      i.itemCode !== item.itemCode ||
      i.typeCode !== item.typeCode ||
      i.expireDate !== item.expireDate
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

  //#endregion

  //#region Helper Methods
  private validateItemForm(): boolean {
    if (!this.selectedStockItem || !this.selectedPacketType ||
      !this.purchaseForm.value.price || !this.purchaseForm.value.qty ||
      !this.purchaseForm.value.expireDate) {
      this.showError('Please fill all required fields');
      return false;
    }

    if (this.purchaseForm.value.price <= 0 || this.purchaseForm.value.qty <= 0) {
      this.showError('Price and Quantity must be greater than 0');
      return false;
    }

    if (this.isInvalidExpireDate()) {
      this.showError('Expire Date must be after today.');
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

  resetPurchaseDetailFields(): void {
    this.selectedStockItem = null;
    this.selectedPacketType = null;
    this.capacity = null;

    this.purchaseForm.patchValue({
      itemCode: '',
      typeCode: null,
      price: 0,
      qty: 0,
      totalQty: 0,
      salePercentage: 15,
      salePrice: null,
      expireDate: new Date()
    });
  }

  //#endregion

  //#region Cookie Operations
  getItemsFromCookie(): PurchaseEntryDetailModel[] {
    let cookieData = this.cookieService.get(this.PURCHASE_COOKIE_NAME);
    return cookieData ? JSON.parse(cookieData) : [];
  }

  saveItemsToCookie(items: PurchaseEntryDetailModel[]): void {
    let jsonString = JSON.stringify(items);
    this.cookieService.set(this.PURCHASE_COOKIE_NAME, jsonString, 1); // Expires in 1 day
  }

  loadItemsFromCookie(): void {
    let cookieItems = this.getItemsFromCookie();

    this.purchaseDetails = cookieItems.map(item => ({
      ...item,
      salePrice: this.calculateSalePriceForItem(item)
    })) as PurchaseEntryDisplayModel[];

    this.updateAmounts();
  }

  private calculateSalePriceForItem(item: PurchaseEntryDetailModel): number {
    return item.price * 1.15;
  }

  //#endregion

  //#region Calculation Methods
  calculateSalePrice(): void {
    let price = this.purchaseForm.get('price')?.value;
    let percentage = this.purchaseForm.get('salePercentage')?.value;

    if (price !== null && percentage !== null && !isNaN(price) && !isNaN(percentage)) {
      let sale = price + (price * percentage / 100);
      sale = Number(sale.toFixed(2));
      this.purchaseForm.get('salePrice')?.setValue(sale);
    } else {
      this.purchaseForm.get('salePrice')?.setValue(null);
    }
  }

  calcuateTotalAmount(): void {
    let { price, qty } = this.purchaseForm.controls;
    let totalQty = price.value * qty.value;
    this.purchaseForm.controls['totalQty'].setValue(isNaN(totalQty) ? 0 : totalQty);
  }

  updateAmounts(): void {
    let totalAmount = this.calculateTotalAmountFromCookie();
    let discountAmount = Number(this.purchaseForm.controls['discountAmount'].value) || 0;
    let payAmount = Number(this.purchaseForm.controls['payAmount'].value) || 0;

    this.discountExceedsTotal = discountAmount > totalAmount;

    let netAmount = totalAmount - discountAmount;
    let leftAmount = netAmount - payAmount;

    this.purchaseForm.controls['totalAmount'].setValue(totalAmount);
    this.purchaseForm.controls['netAmount'].setValue(Math.max(netAmount, 0));
    this.purchaseForm.controls['leftAmount'].setValue(Math.max(leftAmount, 0));
  }

  private calculateTotalAmountFromCookie(): number {
    return this.getItemsFromCookie().reduce((sum, item) => sum + (item.Amount ?? 0), 0);
  }

  private calculateSalePriceValue(): number {
    let price = this.purchaseForm.value.price;
    let percentage = this.purchaseForm.value.salePercentage || 0;
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

  isInvalidExpireDate(): boolean {
    let control = this.purchaseForm.controls['expireDate'];
    if (!control.value) return true;

    let selected = new Date(control.value);
    let today = new Date();

    selected.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return selected <= today;
  }

  hasAnyItems(): boolean {
    return this.purchaseDetails.length > 0 || this.getItemsFromCookie().length > 0;
  }

  removeAllItems(): void {
    if (this.purchaseDetails.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Items',
        detail: 'There are no items to remove',
        life: 3000
      });
      return;
    }

    this.cookieService.delete(this.PURCHASE_COOKIE_NAME);
    this.purchaseDetails = [];
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
        this.selectedPurchase = null as any;
        this.purchases = [];
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
    this.purchaseForm.reset({
      purchaseVno: 0,
      branchId: Number.parseInt(this.shareService.getDefaultBranchId() ?? '0'),
      manualVno: '',
      supplierId: 0,
      salePercentage: 15,
      salePrice: null,
      purchaseDate: new Date(),
      totalAmount: 0,
      discountAmount: 0,
      netAmount: 0,
      payAmount: 0,
      leftAmount: 0,
      paymentType: '',
      status: false,
      remark: null,
      itemCode: '',
      typeCode: 0,
      qty: 0,
      price: 0,
      totalQty: 0,
      expireDate: new Date(),
      saleQty: null
    });

    // Clear all selections
    this.selectedSupplier = null as any;
    this.selectedStockItem = null;
    this.selectedPacketType = null;
    this.selectedPayMentType = null;
    this.selectedRow = null;
    this.capacity = null;

    // Clear purchase details and cookie
    this.purchaseDetails = [];
    this.cookieService.delete(this.PURCHASE_COOKIE_NAME);

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