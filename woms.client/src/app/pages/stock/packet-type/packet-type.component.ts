import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PacketTypeModel } from '@core_models/stock/packet-type.model';
import { PacketTypeService } from '@core_services/stock/packet-type.service';
import { ExportService } from '@shared_services/export.service';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-packet-type',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ToastModule,
    TagModule,
    SplitButtonModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    DialogModule,
    ConfirmDialogModule,
    ButtonModule,
    ToggleSwitchModule,
  ],
  providers: [
    ConfirmationService, ExportService, DatePipe, SharedService
  ],
  templateUrl: './packet-type.component.html'
})
export class PacketTypeComponent implements OnInit {
  packetTypes: PacketTypeModel[] = [];
  selectedPacketType!: PacketTypeModel;

  items!: MenuItem[];

  loading: boolean = false;
  isEdit: boolean = false;
  isSubmitting: boolean = false;
  modalVisible: boolean = false;

  constructor(
    private packetTypeService: PacketTypeService,
    private loggerService: LoggerService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    public sharedService: SharedService,
    private exportService: ExportService
  ) {
    this.items = [{
      label: 'Edit',
      icon: 'pi pi-pen-to-square',
      command: () => this.update()
    },
    {
      label: 'Delete',
      icon: 'pi pi-trash',
      command: () => this.delete()
    },
    {
      label: 'Excel',
      icon: 'pi pi-file-excel',
      command: () => this.excel()
    }]
  }

  //#region formBuilder
  private formBuilder = inject(FormBuilder);
  public packetTypeForm: FormGroup = this.formBuilder.group({
    typeCode: [0, Validators.required],
    typeName: ['', Validators.required],
    capacity: [0, Validators.required],
    status: [false]
  })
  //#endregion

  //#region ngOnInit and loadData
  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    this.packetTypeService.get(branchId).subscribe({
      next: res => {
        this.packetTypes = res.data as PacketTypeModel[];
        this.loading = false;

        this.loggerService.info(this.packetTypes);
      },
      error: err => {

      },
      complete: () => {
        this.loading = false;
      }
    })
  }
  //#endregion

  //#region CRUD
  create(): void {
    this.isEdit = false;
    const branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    this.packetTypeService.getByAutoCode(branchId).subscribe({
      next: res => {
        this.packetTypeForm.reset();
        this.packetTypeForm.controls['typeCode'].setValue(res.data as number);
        this.packetTypeForm.controls['status'].setValue(false);
        this.isEdit = false;
        this.modalVisible = true;
      }
    })
  }

  update(): void {
    this.isEdit = true;
    this.packetTypeForm.reset();
    if (this.selectedPacketType) {
      this.loggerService.info(this.selectedPacketType);

      this.packetTypeForm.controls['typeCode'].setValue(this.selectedPacketType.typeCode);
      this.packetTypeForm.controls['typeName'].setValue(this.selectedPacketType.typeName);
      this.packetTypeForm.controls['capacity'].setValue(this.selectedPacketType.capacity);
      this.packetTypeForm.controls['status'].setValue(this.selectedPacketType.status);

      this.modalVisible = true;
    } else {
      this.modalVisible = false;
      this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: "Please choose packet type." })
    }
  }

  delete(): void {
    if (this.selectedPacketType != null) {
      this.confirmationService.confirm({
        message: 'Are You Sure Want To Delete?',
        header: 'Delete Confirmation',
        icon: 'pi pi-info-circle',
        accept: () => {
          this.packetTypeService.delete(this.selectedPacketType.typeCode).subscribe({
            next: res => {
              this.messageService.add({ key: 'globalMessage', severity: 'success', summary: 'Confirmed', detail: 'Successfully deleted packet type.' });
              this.loadData();
              this.selectedPacketType = null as any;
            },
            complete: () => {
              this.loading = false;
            }
          });
        },
        reject: () => {
          this.selectedPacketType = null as any;
        },
        key: 'packetTypeDeleteDialog'
      });
    } else {
      this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: 'Please choose Packet Type.' });
    }
  }
  //#endregion

  //#region excel
  excel(): void {
    let exportData = this.selectedPacketType ? [this.selectedPacketType] : this.packetTypes;

    if (exportData.length === 0) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'No data available to export!',
      });
      return;
    }

    // Define the columns to be exported
    const columns = [
      { key: 'typeCode', value: 'Type Code' },
      { key: 'clinicId', value: 'Clinic Id' },
      { key: 'typeName', value: 'Type Name' },
      { key: 'capacity', value: 'Capacity' },
      { key: 'status', value: 'Status' },
      { key: 'createdOn', value: 'Created On' },
      { key: 'createdBy', value: 'Created By' },
      { key: 'updatedOn', value: 'Updated On' },
      { key: 'updatedBy', value: 'Updated By' },
    ];

    // Use exportSelectColsWithDynamicHeader for exporting data
    this.exportService.exportSelectColsWithDynamicHeader(exportData, columns, 'Packet Type');
  }
  //#endregion

  //#region clearSection
  clearSection(): void {
    this.selectedPacketType = null as any;
  }
  //#endregion

  //#region preventNegaticeInput
  preventNegativeInput($event: KeyboardEvent) {
    const inputChar = $event.key;
    if (inputChar === '-' || inputChar === 'e') {
      $event.preventDefault();
    }
  }
  //#endregion

  //#region submit
  submit(): void {
    if (this.packetTypeForm.valid) {
      this.isSubmitting = true;
      let model = this.packetTypeForm.value as PacketTypeModel;

      model.branchId = Number.parseInt((this.sharedService.getDefaultBranchId() ?? '0'));

      this.loggerService.info(this.selectedPacketType);
      if (!this.isEdit) {
        this.packetTypeService.create(this.packetTypeForm.value).subscribe({
          next: res => {
            this.modalVisible = false;
            this.loadData();
            this.messageService.add({ key: 'globalMessage', severity: 'success', summary: 'Success', detail: res.message.en });
          },
          error: err => {
            this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: err.message.en });
            this.isSubmitting = false;
          },
          complete: () => {
            this.isSubmitting = false;
          }
        })
      } else {
        this.packetTypeService.update(this.packetTypeForm.value).subscribe({
          next: res => {
            this.modalVisible = false;
            this.loadData();
            this.messageService.add({ key: 'globalMessage', severity: 'success', summary: 'Success', detail: res.message.en });
          },
          error: err => {
            this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: err.message.en });
            this.isSubmitting = false;
          },
          complete: () => {
            this.selectedPacketType = null as any;
            this.isSubmitting = false;
          }
        })
      }
    } else {
      Object.keys(this.packetTypeForm.controls).forEach(field => {
        const control = this.packetTypeForm.get(field);
        control?.markAsDirty({ onlySelf: true })
      });
    }
  }
  //#endregion
}
