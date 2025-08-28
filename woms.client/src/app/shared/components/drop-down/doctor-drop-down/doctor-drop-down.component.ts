import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { DoctorModel } from '@core_models/master/doctor.model';
import { Subscription } from 'rxjs';
import { DoctorService } from '@core_services/master/doctor.service';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { DropdownStateService } from '@shared_services/state-management/dropdown-state.service';
import { DropdownChangeEvent } from 'primeng/dropdown';

@Component({
  selector: 'app-doctor-drop-down',
  imports: [SelectModule, FormsModule],
  template: `
   <p-select [options]="doctor" [style]="{'width': '100%'}" [(ngModel)]="selectedValue" optionLabel="name"
              dataKey="doctorId"
              placeholder="Select Doctor" [ngModelOptions]="{ standalone: true }" [loading]="loading" [filter]="true"
              [showClear]="true"
              (onChange)="onChanges($event)" [disabled]="!isEnabled" appendTo="body"></p-select>`,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DoctorDropDownComponent),
      multi: true
    }
  ],
})
export class DoctorDropDownComponent implements OnInit, OnDestroy {
  @Output() onValueChange = new EventEmitter<DoctorModel>();
  @Input() isEnabled: boolean = true;

  subscription!: Subscription;
  loading: boolean = false;

  dropdownId: string = 'doctor-dropdown';

  doctor: DoctorModel[] = [];
  selectedValue!: DoctorModel;

  constructor(
    private doctorService: DoctorService,
    private loggerService: LoggerService,
    private sharedService: SharedService,
    private dropdownStateService: DropdownStateService
  ) { }

  ngOnInit(): void {
    this.loadData();

    this.subscription = this.dropdownStateService.dropdownStates$.subscribe((states) => {
      if (this.dropdownId) {
        this.isEnabled = states.enabled[this.dropdownId] ?? true;
        if (states.selected[this.dropdownId] !== undefined) {
          this.selectedValue = this.doctor.filter((v, i) => v.doctorId == states.selected[this.dropdownId])[0];
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public loadData(): void {
    let hospitalId: number = Number.parseInt((this.sharedService.getDefaultHospitalId() ?? "0"));
    this.loading = true;
    this.doctorService.getByActive(hospitalId).subscribe({
      next: (res) => {
        this.doctor = res.data as DoctorModel[];
        this.loading = false;
      },
      error: (err) => {
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

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
    this.onChange(this.selectedValue); // Emit changes when the dropdown value changes
    this.onTouch(); // Notify that the component was touched

    this.onValueChange.emit(this.selectedValue);
  }

}
