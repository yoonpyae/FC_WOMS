import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { LabTypeItemModel } from '@core_models/lab-type-item-model';
import { ViLabtestModel } from '@core_models/master/lab-test.model';
import { LabtestService } from '@core_services/master/lab-test.service';
import { SharedService } from '@shared_services/shared.service';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-lab-test-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    TableModule,
    DialogModule,
    ButtonModule,
    CheckboxModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LabTestDialogComponent),
      multi: true
    }
  ],
  templateUrl: './lab-test-dialog.component.html',
})
export class LabTestDialogComponent implements OnInit {
  @Input() mode: string = "OPD";
  @Output() onValueChange = new EventEmitter<LabTypeItemModel>();

  @Output() onSaved = new EventEmitter<void>();

  labTests: ViLabtestModel[] = [];
  selectedLabTest: ViLabtestModel[] = [];
  checked: boolean = false;
  metaKey: boolean = false;
  loading: boolean = false;
  labTestModalVisible: boolean = false;
  labTestloading: boolean = false;

  constructor(
    private labTestService: LabtestService,
    private cookieService: CookieService,
    private messageService: MessageService,
    private sharedService: SharedService
  ) { }

  //#region ngOnInit and loadData
  ngOnInit(): void {
  }

  loadData(): void {
    const hospitalId = Number.parseInt(this.sharedService.getDefaultHospitalId() ?? '0');
    this.labTestService.getActive(hospitalId).subscribe({
      next: (res) => {
        this.labTestloading = false;
        this.labTests = res.data as ViLabtestModel[];
      }
    });
  }
  //#endregion

  showDialog(): void {
    this.loadData();
    this.metaKey = false;
    this.labTestModalVisible = true;
  }

  getVouchersFromCookie(): LabTypeItemModel[] {
    const cookieData = this.cookieService.get('allListsTable');
    return cookieData ? JSON.parse(cookieData) : [];
  }

  submit(): void {
    if (this.selectedLabTest && this.selectedLabTest.length > 0) {
      const cookieKey = 'allListsTable';

      const cookieLabItem = this.getVouchersFromCookie();

      this.selectedLabTest.forEach(group => {
        const existing = cookieLabItem.find(c => c.testId === group.labTestId && c.type === "labtest");

        if (!existing) {
          const newLabTest: LabTypeItemModel = {
            id: this.getNextId(cookieLabItem),
            testId: group.labTestId,
            labTestName: group.labTestName,
            fee: group.fee,
            type: 'labtest'
          };
          cookieLabItem.push(newLabTest);
          this.onValueChange.emit(newLabTest);
        }
      });

      this.cookieService.set(cookieKey, JSON.stringify(cookieLabItem));

      this.selectedLabTest = [];
      this.labTestModalVisible = false;
      this.messageService.add({
        key: 'globalMessage',
        severity: 'success',
        summary: 'Success',
        detail: 'Lab Test added.'
      });

      this.onSaved.emit();

    } else {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please choose record.'
      });
    }
  }
  //#endregion

  //#region nextId
  getNextId(items: LabTypeItemModel[]): number {
    if (!items.length) return 1;
    return Math.max(...items.map(item => item.id)) + 1;
  }
  //#endregion

  //#region cancel
  cancel(): void {
    this.selectedLabTest = null as any;
    this.labTestModalVisible = false;
  }
  //#endregion

  //#region onDialogHide
  onDialogHide(): void {
    this.selectedLabTest = null as any;
  }
  //#endregion
}
