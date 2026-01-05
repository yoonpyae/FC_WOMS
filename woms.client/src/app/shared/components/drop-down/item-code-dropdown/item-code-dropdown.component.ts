import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { StockItemModel } from '@core_models/stock/stock-item.model';
import { StockItemService } from '@core_services/stock/stock-item.service';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { DropdownStateService } from '@shared_services/state-management/dropdown-state.service';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-item-code-dropdown',
  imports: [SelectModule, FormsModule],
  template: `
    <p-select [options]="stockItems" [style]="{'width': '100%'}" [(ngModel)]="selectedValue" optionLabel="itemName"
              dataKey="itemCode"
              placeholder="Select item" [ngModelOptions]="{ standalone: true }" [loading]="loading" [filter]="true"
              [showClear]="true"
              (onChange)="onChanges($event)" [disabled]="!isEnabled"></p-select>`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ItemCodeDropdownComponent),
      multi: true
    }
  ],
})
export class ItemCodeDropdownComponent implements OnInit, OnDestroy {
  @Output() onValueChange = new EventEmitter<StockItemModel>();
  @Input() isEnabled: boolean = true;

  subscription!: Subscription;
  loading: boolean = false;

  dropdownId: string = 'item-code-dropdown'; // Unique ID for this dropdown

  stockItems: StockItemModel[] = [];
  selectedValue!: StockItemModel;

  constructor(
    private stockItemService: StockItemService,
    private loggerService: LoggerService,
    private shareService: SharedService,
    private dropdownStateService: DropdownStateService
  ) {
  }

  ngOnInit(): void {
    this.loadData();

    this.subscription = this.dropdownStateService.dropdownStates$.subscribe((states) => {
      if (this.dropdownId) {
        this.isEnabled = states.enabled[this.dropdownId] ?? true;
        if (states.selected[this.dropdownId] !== undefined) {
          this.selectedValue = this.stockItems.filter((v, i) => v.itemCode == states.selected[this.dropdownId])[0];
        }
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public loadData(): void {
    let clinicId: number = Number.parseInt((this.shareService.getDefaultClinicId() ?? "0"));
    this.loading = true;
    this.stockItemService.get(clinicId).subscribe({
      next: (response) => {
        this.stockItems = response.data as StockItemModel[];
        this.stockItems = this.stockItems.filter(item => item.itemCode.startsWith('A'));
        this.loading = false;
        // this.loggerService.info(this.stockItems);
      },
      error: (err) => {
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  // Methods to implement ControlValueAccessor
  onChange: any = () => {
  };
  onTouch: any = () => {
  };

  writeValue(obj: any): void {
    this.selectedValue = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  onChanges($event: DropdownChangeEvent) {
    // this.selectedValueChange.emit(this.selectedValue);
    // const value = $event.value;
    this.onChange(this.selectedValue); // Emit changes when the dropdown value changes
    this.onTouch(); // Notify that the component was touched

    this.onValueChange.emit(this.selectedValue);
  }
}
