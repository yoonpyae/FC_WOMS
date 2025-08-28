import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ViAdmissionModel } from '@core_models/admission/admission.model';
import { AdmissionService } from '@core_services/admission/admission.service';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { DropdownStateService } from '@shared_services/state-management/dropdown-state.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { Subscription } from 'rxjs';
import { EntryComponent } from "../../../../pages/admission/admission/entry/entry.component";

@Component({
  selector: 'app-admission-drop-down',
  imports: [CommonModule, SelectModule, FormsModule, ButtonModule, DialogModule, EntryComponent],
  template: `
    <p-select [options]="admission" [style]="{'width': '100%'}" [(ngModel)]="selectedValue" optionLabel="admissionNo"
              dataKey="admissionNo"
              placeholder="Select Admission" [ngModelOptions]="{ standalone: true }" [loading]="loading" [filter]="true" filterBy="name"
              [showClear]="true" (onChange)="onChanges($event)" [disabled]="!isEnabled" appendTo="body">
        <ng-template #selectedItem let-selectedOption>
            <div class="flex items-center gap-2" *ngIf="selectedOption">
              
              <i class="pi pi-user"></i>
                <div>{{ selectedOption.name }}</div>
            </div>
        </ng-template>
        <ng-template let-admission #item>
            <div class="flex gap-4">
              <div class="bg-gray-100 w-20 h-20 border rounded-xl flex justify-center items-center">
                 <i class="pi pi-user scale-150"></i>
              </div>
              <div class="flex flex-col gap-2">
                <div class="font-semibold">{{ admission.name }}</div>
                <div>AGE: {{ admission.age }}</div>
                <div>ROOM: {{ admission.roomName }}</div>
              </div>
            </div>
        </ng-template>
        <ng-template #dropdownicon>
            <i class="pi pi-users"></i>
        </ng-template>
        <ng-template #header>
            <div class="font-medium p-3">Current Admission</div>
        </ng-template>
      <ng-template #footer>
  <div class="p-3">
   <p-button label="Add New Admission" fluid severity="secondary" text size="small" icon="pi pi-plus" (onClick)="modalVisible=true" />
  </div>
</ng-template>

    </p-select>
    
<p-dialog header="{{ isEdit ? 'Edit' : 'Create New OPD' }}" [(visible)]="modalVisible"
    maskStyleClass="backdrop-blur-sm" [breakpoints]="{
    '1920px': '60vw',
    '1440px': '30vw',
    '1024px': '30vw',
    '768px': '80vw',
    '425px': '100vw',
    '375px': '100vw',
    '320px': '100vw'}" [modal]="true" [style]="{width: '60vw', height: '40vh', minWidth: '50vw', minHeight: '60vh'}"
    [draggable]="false" [resizable]="false">
    <app-admission-entry  (onSubmitted)="handleEntrySubmitted($event)" (cancelClicked)="onAdmissionCancel()"></app-admission-entry>`,

  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AdmissionDropDownComponent),
      multi: true
    }
  ],
})
export class AdmissionDropDownComponent implements OnInit, OnDestroy {
  @ViewChild(EntryComponent) admissionEntryComponent!: EntryComponent;
  @Output() onValueChange = new EventEmitter<ViAdmissionModel>();
  @Input() isEnabled: boolean = true;

  subscription!: Subscription;
  loading: boolean = false;
  isEdit = false;

  selectedAdmission!: ViAdmissionModel;

  modalVisible: boolean = false;

  dropdownId: string = 'admission-dropdown';

  admission: ViAdmissionModel[] = [];
  selectedValue!: ViAdmissionModel;

  constructor(
    private admissionService: AdmissionService,
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
          this.selectedValue = this.admission.filter((v, i) => v.admissionNo == states.selected[this.dropdownId])[0];
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
    this.admissionService.getByActive(hospitalId).subscribe({
      next: (res) => {
        this.admission = res.data as ViAdmissionModel[];
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


  handleEntrySubmitted(submitted: boolean) {
    if (submitted) {
      this.modalVisible = false;
      this.loadData();
    }
  }

  onChanges($event: DropdownChangeEvent) {
    this.onChange(this.selectedValue); // Emit changes when the dropdown value changes
    this.onTouch(); // Notify that the component was touched

    this.onValueChange.emit(this.selectedValue);
  }

  onAdmissionCancel(): void {
    if (this.admissionEntryComponent) {
      this.admissionEntryComponent.resetForm();
    }
    this.modalVisible = false;
    this.selectedAdmission = null as any;
    this.isEdit = false;
  }

}
