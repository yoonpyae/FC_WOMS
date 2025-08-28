import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { LabTypeItemModel } from '@core_models/lab-type-item-model';
import { LabMainGroupModel } from '@core_models/master/lab-main-group.model';
import { LabMainGroupService } from '@core_services/master/lab-main-group.service';
import { SharedService } from '@shared_services/shared.service';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-lab-main-group-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    DialogModule,
    TableModule,
    ButtonModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LabMainGroupDialogComponent),
      multi: true
    }
  ],
  templateUrl: './lab-main-group-dialog.component.html',
})
export class LabMainGroupDialogComponent implements OnInit {
  @Input() mode: string = "OPD";
  @Output() onValueChange = new EventEmitter<LabTypeItemModel>();
  @Output() onSaved = new EventEmitter<void>();

  labMainGroups: LabMainGroupModel[] = [];
  selectedLabMainGroup: LabMainGroupModel[] = [];

  labMainloading: boolean = false;
  labMainModalVisible: boolean = false;
  metaKey: boolean = false;

  constructor(
    private cookieService: CookieService,
    private messageService: MessageService,
    private sharedService: SharedService,
    private labMainGroupService: LabMainGroupService
  ) { }

  //#region ngOnInit and loadData
  ngOnInit(): void {
  }

  loadData(): void {
    const hospitalId = Number.parseInt(this.sharedService.getDefaultHospitalId() ?? '0');
    this.labMainGroupService.getActive(hospitalId).subscribe({
      next: (res) => {
        this.labMainloading = false;
        this.labMainGroups = res.data as LabMainGroupModel[];
      }
    });
  }

  showDialog(): void {
    this.metaKey = false;
    this.labMainModalVisible = true;
    this.loadData();
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
    if (this.selectedLabMainGroup && this.selectedLabMainGroup.length > 0) {
      const cookieKey = 'allListsTable';

      const cookieLabItem = this.getVouchersFromCookie();

      this.selectedLabMainGroup.forEach(group => {
        const existing = cookieLabItem.find(c => c.testId === group.mainGroupId && c.type === "maingroup");

        if (!existing) {
          const newLabSubGroup: LabTypeItemModel = {
            id: this.getNextId(cookieLabItem),
            testId: group.mainGroupId,
            labTestName: group.mainGroupName,
            fee: group.fee,
            type: 'maingroup'
          };
          cookieLabItem.push(newLabSubGroup);
          this.onValueChange.emit(newLabSubGroup);
        }
      });

      this.cookieService.set(cookieKey, JSON.stringify(cookieLabItem));

      this.selectedLabMainGroup = [];
      this.labMainModalVisible = false;
      this.messageService.add({
        key: 'globalMessage',
        severity: 'success',
        summary: 'Success',
        detail: 'Lab Main Group added.'
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
    this.selectedLabMainGroup = null as any;
    this.labMainModalVisible = false;
  }
  //#endregion

  //#region onDialogHide
  onDialogHide(): void {
    this.selectedLabMainGroup = null as any;
  }
  //#endregion
}
