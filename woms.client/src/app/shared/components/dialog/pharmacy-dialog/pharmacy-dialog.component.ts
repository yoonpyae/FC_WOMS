import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ViOTDeptStockModel } from '@core_models/ot-case/ot-dept-stock.model';
import { OTVoucherItemModel } from '@core_models/voucher-item.model';
import { OtDeptStockService } from '@core_services/ot-case/ot-dept-stock.service';
import { SharedService } from '@shared_services/shared.service';
import { DropdownStateService } from '@shared_services/state-management/dropdown-state.service';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-pharmacy-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    SelectModule
  ],
  templateUrl: './pharmacy-dialog.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PharmacyDialogComponent),
      multi: true
    }
  ],
})
export class PharmacyDialogComponent implements OnInit, OnDestroy {
  @Input() isEnabled = true;
  @Output() valueChange = new EventEmitter<ViOTDeptStockModel>();
  @Output() onSaved = new EventEmitter<void>();

  subscription!: Subscription;
  isSubmitting: boolean = false;
  loading: boolean = false;
  modalVisible: boolean = false;
  metaKey: boolean = true;
  readonly dropdownId = 'pharmacy-dialog';
  pharmacyStock: ViOTDeptStockModel[] = [];
  selectedOTDeptStock: ViOTDeptStockModel | null = null;
  quantity: number = 0;

  constructor(
    private otDeptStockService: OtDeptStockService,
    private cookieService: CookieService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private dropdownStateService: DropdownStateService
  ) { }

  ngOnInit(): void {
    this.setupDropdownSubscription();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  //#region Dialog Methods
  showDialog(): void {
    this.metaKey = false;
    this.modalVisible = true;
    this.loadData();
  }

  onDialogHide(): void {
    this.resetForm();
    this.modalVisible = false;
  }

  cancel(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.selectedOTDeptStock = null;
    this.quantity = 0;
    this.modalVisible = false;
  }
  //#endregion

  //#region Data Loading & State Management
  loadData(): void {
    const hospitalId = Number.parseInt(this.sharedService.getDefaultHospitalId() ?? '0');
    this.loading = true;

    this.otDeptStockService.get(hospitalId).subscribe({
      next: (res) => {
        this.pharmacyStock = (res.data as ViOTDeptStockModel[]);
      },
      error: () => { },
      complete: () => {
        this.loading = false;
      }
    });
  }

  setupDropdownSubscription(): void {
    this.subscription = this.dropdownStateService.dropdownStates$.subscribe((states) => {
      if (!this.dropdownId) return;

      this.isEnabled = states.enabled[this.dropdownId] ?? true;

      if (states.selected[this.dropdownId] !== undefined) {
        this.selectedOTDeptStock = this.pharmacyStock.find(v => v.itemCode === states.selected[this.dropdownId]) ?? null;
      }
    });
  }
  //#endregion

  //#region Pharmacy Selection & Submission
  onPharmacyChange(): void {
    if (this.selectedOTDeptStock) {
      this.valueChange.emit(this.selectedOTDeptStock);
    }
  }

  submit(): void {
    if (this.selectedOTDeptStock && this.quantity > 0) {
      if (!this.selectedOTDeptStock.quantity || this.selectedOTDeptStock.quantity === 0) {
        this.showWarning('Ground balance must be greater than 0.');
        return;
      }

      const cookieKey = ('voucher-item').toLowerCase();
      const data = this.cookieService.get(cookieKey);
      const cookieVoucherItem = JSON.parse(data === '' ? '[]' : data) as OTVoucherItemModel[];

      const existing = cookieVoucherItem.find(c => c.id === this.selectedOTDeptStock?.itemCode.toString());

      if (existing) {
        existing.qty += this.quantity;
        existing.total = existing.qty * this.selectedOTDeptStock.quantity;
      } else {
        const newVoucherItem: OTVoucherItemModel = {
          id: this.selectedOTDeptStock.itemCode.toString(),
          name: this.selectedOTDeptStock.itemName ?? '',
          typecode: this.selectedOTDeptStock.typeCode,
          typename: this.selectedOTDeptStock.typeName ?? '',
          price: this.selectedOTDeptStock.salePrice,
          qty: this.quantity,
          total: this.selectedOTDeptStock.salePrice * this.quantity,
          type: 'OT Stock',
        }
        cookieVoucherItem.push(newVoucherItem);
      }

      this.cookieService.set(cookieKey, JSON.stringify(cookieVoucherItem));

      this.modalVisible = false;
      this.messageService.add({
        key: 'globalMessage',
        severity: 'success',
        summary: 'Success',
        detail: 'OT Stock added.'
      });
      this.modalVisible = false;
      this.selectedOTDeptStock = null as any;
      this.quantity = 1;
      this.metaKey = true;
      this.onSaved.emit();

    } else if (!this.quantity || this.quantity <= 0) {
      this.showWarning('Quantity must be greater than 0.');
    }
  }
  //#endregion

  //#region Utility & Validation
  showWarning(message: string): void {
    this.messageService.add({
      key: 'globalMessage',
      severity: 'warn',
      summary: 'Warning',
      detail: message
    });
  }

  preventNegativeInput(event: KeyboardEvent): void {
    if (event.key === '-' || event.key === 'e') {
      event.preventDefault();
    }
  }

  get totalAmount(): number {
    return this.selectedOTDeptStock && this.quantity
      ? (this.selectedOTDeptStock.salePrice ?? 0) * this.quantity
      : 0;
  }
  // #endregion

  //#region ControlValueAccessor Implementation
  onChange: (value: ViOTDeptStockModel | null) => void = () => { };
  onTouch: () => void = () => { };

  writeValue(obj: ViOTDeptStockModel | null): void {
    this.selectedOTDeptStock = obj;
  }

  registerOnChange(fn: (value: ViOTDeptStockModel | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  onChanges(event: DropdownChangeEvent): void {
    this.onChange(this.selectedOTDeptStock);
    this.onTouch();
    this.onPharmacyChange();
  }
  //#endregion
}
