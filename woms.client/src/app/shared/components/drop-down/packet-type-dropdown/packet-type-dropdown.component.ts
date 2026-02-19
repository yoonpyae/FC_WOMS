import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { PacketTypeModel } from '@core_models/stock/packet-type.model';
import { PacketTypeService } from '@core_services/stock/packet-type.service';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DropdownStateService } from '@shared_services/state-management/dropdown-state.service';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { Subject, Subscription } from 'rxjs';
import { StockItemModel } from '@core_models/stock/stock-item.model';

@Component({
  selector: 'app-packet-type-dropdown',
  imports: [
    SelectModule,
    FormsModule,
  ],
  template: `
    <p-select [options]="packetTypes" [style]="{'width': '100%'}" [(ngModel)]="selectedValue" optionLabel="typeName"
              dataKey="typeCode"
              placeholder="Select packet type" [ngModelOptions]="{ standalone: true }" [loading]="loading"
              [filter]="true" [style]="{'width': '100%'}"
              [showClear]="true"  [disabled]="disabled"
              (onChange)="onChanges($event)" ></p-select>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PacketTypeDropdownComponent),
      multi: true
    }
  ]
})
export class PacketTypeDropdownComponent implements OnInit, OnDestroy {
  @Output() onValueChange = new EventEmitter<PacketTypeModel>();
  @Input() isEnabled: boolean = true;
  @Input() disabled: boolean = false;
  subscription!: Subscription;
  loading: boolean = false;

  dropdownId: string = 'type-code-dropdown'; // Unique ID for this dropdown

  packetTypes: PacketTypeModel[] = [];
  selectedValue!: PacketTypeModel;

  constructor(
    private loggerService: LoggerService,
    private sharedService: SharedService,
    private packetTypeService: PacketTypeService,
    private dropdownStateService: DropdownStateService
  ) {
  }

  ngOnInit(): void {
    this.loadData();

    this.subscription = this.dropdownStateService.dropdownStates$.subscribe((states) => {
      if (this.dropdownId) {
        this.isEnabled = states.enabled[this.dropdownId] ?? true;
        if (states.selected[this.dropdownId] !== undefined) {
          this.selectedValue = this.packetTypes.filter((v, i) => v.typeCode == states.selected[this.dropdownId])[0];
          this.onChange(this.selectedValue); 
        }
      }
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  public loadData(): void {
    this.loading = true;
    this.packetTypeService.get().subscribe({
      next: (res) => {
        this.packetTypes = res.data as PacketTypeModel[];
      },
      error: err => {
      },
      complete: () => {
        this.loading = false;
      }
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
    this.onChange(this.selectedValue); // Emit changes when the dropdown value changes
    this.onTouch(); // Notify that the component was touched

    const value = $event.value;
    this.onValueChange.emit(value);
  }
}
