import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { DropdownStateService } from '@shared_services/state-management/dropdown-state.service';
import { ButtonModule } from 'primeng/button';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { Subscription } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { ViPatientModel } from '@core_models/master/patient.model';
import { PatientService } from '@core_services/master/patient.service';
import { EntryComponent } from 'src/app/pages/master/patient/entry/entry.component';

@Component({
    selector: 'app-patient-down',
    imports: [CommonModule, SelectModule, FormsModule, ButtonModule, EntryComponent, DialogModule],
    template: `
    <p-select [options]="opd" [style]="{'width': '100%'}" [(ngModel)]="selectedValue" optionLabel="patientId"
              dataKey="patientId"
              placeholder="Select OPD" [ngModelOptions]="{ standalone: true }" [loading]="loading" [filter]="true" filterBy="name"
               (onChange)="onChanges($event)" [disabled]="!isEnabled" appendTo="body">
        <ng-template #selectedItem let-selectedOption>
            <div class="flex items-center gap-2" *ngIf="selectedOption">
              
              <i class="pi pi-user"></i>
                <div>{{ selectedOption.name }}</div>
            </div>
        </ng-template>
        <ng-template let-opd #item>
            <div class="flex gap-4">
              <div class="w-20 h-20 border rounded-xl flex justify-center items-center">
                 <i class="pi pi-user scale-150"></i>
              </div>
              <div class="flex flex-col gap-2">
                <div class="font-semibold">{{ opd.name }}</div>
                <div>AGE: {{ opd.age }}</div>
              </div>
            </div>
        </ng-template>
        <ng-template #dropdownicon>
            <i class="pi pi-users"></i>
        </ng-template>
        <ng-template #header>
            <div class="font-medium p-3">Current OPD</div>
        </ng-template>
        <ng-template #footer>
            <div class="p-3">
                <p-button label="Add New OPD" fluid severity="secondary" text size="small" icon="pi pi-plus" (onClick)="creatOpdModeelvisible=true" />
            </div>
        </ng-template>
    </p-select>
    
    <p-dialog header="Create OPD Registration" [(visible)]="creatOpdModeelvisible" (onHide)="clearSelection()"
        [breakpoints]="{
    '1920px': '60vw',
    '1440px': '30vw',
    '1024px': '30vw',
    '768px': '80vw',
    '425px': '100vw',
    '375px': '100vw',
    '320px': '100vw'}" [modal]="true" [style]="{width: '60vw', minWidth: '50vw', minHeight: '50vh'}"
        [draggable]="false" [resizable]="false">
        <app-patient-entry (onSubmitted)="handleOpdEntrySubmitted($event)"></app-patient-entry>
    </p-dialog>`,

    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PatientDropDownComponent),
            multi: true
        }
    ],
})
export class PatientDropDownComponent implements OnInit, OnDestroy {
    @Output() onValueChange = new EventEmitter<ViPatientModel>();
    @Input() isEnabled: boolean = true;

    subscription!: Subscription;
    loading: boolean = false;
    creatOpdModeelvisible: boolean = false;

    dropdownId: string = 'opd-dropdown';

    opd: ViPatientModel[] = [];
    selectedValue!: ViPatientModel;
    patientId = '';
    name = '';
    age = '';

    constructor(
        private patientService: PatientService,
        private loggerService: LoggerService,
        private sharedService: SharedService,
        private dropdownStateService: DropdownStateService,
        private messageService: MessageService,
    ) { }

    ngOnInit(): void {
        this.loadData();

        this.subscription = this.dropdownStateService.dropdownStates$.subscribe((states) => {
            if (this.dropdownId) {
                this.isEnabled = states.enabled[this.dropdownId] ?? true;
                if (states.selected[this.dropdownId] !== undefined) {
                    this.selectedValue = this.opd.filter((v, i) => v.patientId == states.selected[this.dropdownId])[0];
                }
            }
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public loadData(): void {
        let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
        this.loading = true;
        this.patientService.get(branchId).subscribe({
            next: (res) => {
                this.opd = res.data as ViPatientModel[];
                this.loading = false;
            },
            error: (err) => {
            },
            complete: () => {
                this.loading = false;
            },
        });
    }

    clearSelection() {
        this.opd = null as any;
    }

    handleOpdEntrySubmitted(newPatientId: string) {
        this.creatOpdModeelvisible = false;
        this.patientId = newPatientId;

        let branchId = Number.parseInt(this.sharedService.getDefaultBranchId() ?? '0');
        this.patientService.get(branchId).subscribe({
            next: (res) => {
                this.opd = res.data as ViPatientModel[];
                // Set the selected value to the new one
                this.selectedValue = this.opd.find(x => x.patientId === newPatientId)!;
                this.onChange(this.selectedValue);
                this.onValueChange.emit(this.selectedValue);

                this.messageService.add({
                    severity: 'success',
                    summary: 'OPD Registered',
                    detail: `Patient ID: ${newPatientId}`
                });
            },
            error: () => {
                this.name = '';
                this.age = '';
            }
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
