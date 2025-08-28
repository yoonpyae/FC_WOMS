import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { LabTypeItemModel } from '@core_models/lab-type-item-model';
import { ViLabSubGroupModel } from '@core_models/master/lab-sub-group.model';
import { LabSubGroupService } from '@core_services/master/lab-sub-group.service';
import { SharedService } from '@shared_services/shared.service';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-lab-sub-group-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    TableModule,
    DialogModule,
    ButtonModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LabSubGroupDialogComponent),
      multi: true
    }
  ],
  templateUrl: './lab-sub-group-dialog.component.html',
})
export class LabSubGroupDialogComponent implements OnInit {
  @Input() mode: string = "OPD";
  @Output() onValueChange = new EventEmitter<LabTypeItemModel>();
  @Output() onSaved = new EventEmitter<void>();

  labSubGroups: ViLabSubGroupModel[] = [];
  selectedLabSubGroup: ViLabSubGroupModel[] = [];

  modalVisible: boolean = false;
  labSubloading: boolean = false;
  metaKey: boolean = false;

  constructor(
    private cookieService: CookieService,
    private messageService: MessageService,
    private labSubGroupService: LabSubGroupService,
    private sharedService: SharedService
  ) { }

  //#region ngOnInit and loadData
  ngOnInit(): void {

  }

  loadData(): void {
    const hospitalId = Number.parseInt(this.sharedService.getDefaultHospitalId() ?? '0');
    this.labSubGroupService.getActive(hospitalId).subscribe({
      next: (res) => {
        this.labSubloading = false;
        this.labSubGroups = res.data as ViLabSubGroupModel[];
      }
    });
  }

  showDialog(): void {
    this.loadData();
    this.metaKey = false;
    this.modalVisible = true;

  }
  //#endregion

  //#region getVouchersFromCookie
  getVouchersFromCookie(): LabTypeItemModel[] {
    const cookieData = this.cookieService.get('allListsTable');
    return cookieData ? JSON.parse(cookieData) : [];
  }
  //#endregion

  //#region submit
  submit(): void {
    if (this.selectedLabSubGroup && this.selectedLabSubGroup.length > 0) {
      const cookieKey = 'allListsTable';

      const cookieLabItem = this.getVouchersFromCookie();

      this.selectedLabSubGroup.forEach(group => {
        const existing = cookieLabItem.find(c => c.testId === group.labSubGroupId && c.type === "subgroup");

        if (!existing) {
          const newLabSubGroup: LabTypeItemModel = {
            id: this.getNextId(cookieLabItem),
            testId: group.labSubGroupId,
            labTestName: group.labSubGroupName,
            fee: group.fee,
            type: 'subgroup'
          };
          cookieLabItem.push(newLabSubGroup);
          this.onValueChange.emit(newLabSubGroup);
        }
      });

      this.cookieService.set(cookieKey, JSON.stringify(cookieLabItem));

      this.selectedLabSubGroup = [];
      this.modalVisible = false;
      this.messageService.add({
        key: 'globalMessage',
        severity: 'success',
        summary: 'Success',
        detail: 'Lab Sub Group added.'
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
    this.selectedLabSubGroup = null as any;
    this.modalVisible = false;
  }
  //#endregion

  //#region onDialogHide
  onDialogHide(): void {
    this.selectedLabSubGroup = null as any;
  }
  //#endregion
}
