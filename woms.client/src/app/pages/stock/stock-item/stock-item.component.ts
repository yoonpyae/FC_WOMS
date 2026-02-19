import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PacketTypeModel } from '@core_models/stock/packet-type.model';
import { StockItemModel } from '@core_models/stock/stock-item.model';
import { PacketTypeService } from '@core_services/stock/packet-type.service';
import { StockItemService } from '@core_services/stock/stock-item.service';
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
import { SelectModule } from 'primeng/select';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-stock-item',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ToastModule,
    SplitButtonModule,
    TagModule,
    IconFieldModule,
    InputTextModule,
    InputIconModule,
    DialogModule,
    ConfirmDialogModule,
    ButtonModule,
    ToggleSwitchModule,
    SelectModule
  ],
  providers: [
    ConfirmationService, ExportService, DatePipe
  ],
  templateUrl: './stock-item.component.html'
})
export class StockItemComponent implements OnInit {
  stockItems: StockItemModel[] = [];
  selectedStockItem!: StockItemModel;
  packetTypes: PacketTypeModel[] = [];
  selectedPacketType!: PacketTypeModel;

  items!: MenuItem[];
  loading: boolean = false;
  isEdit: boolean = false;
  isSubmitting: boolean = false;
  isDuplicateName: boolean = false;
  modalVisible: boolean = false;

  constructor(private stockItemService: StockItemService,
    private loggerService: LoggerService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private sharedService: SharedService,
    private exportService: ExportService,
    private packetTypeService: PacketTypeService
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
  public stockItemForm: FormGroup = this.formBuilder.group({
    itemCode: [''],
    itemName: ['', Validators.required],
    typeCode: [0, Validators.required],
    chemicalName: ['', Validators.required],
    status: [false],
  })
  //#endregion

  //#region ngOnInit and loadData
  ngOnInit(): void {
    this.loadData();

  }

  loadData(): void {
    this.loading = true;
    this.stockItemService.get().subscribe({
      next: res => {
        this.stockItems = res.data as StockItemModel[];
        this.loading = false;

        this.loggerService.info(this.stockItems);
      },
      error: err => {

      },
      complete: () => {
        this.loading = false;
      }
    })
    this.getTypeCodeChange();
  }
  //#endregion

  //#region CRUD
  create(): void {
    this.isEdit = false;
    this.stockItemForm.reset();
    this.stockItemForm.controls['status'].setValue(false);

    this.selectedPacketType = null as any;

    this.isEdit = false;
    this.modalVisible = true;
  }

  update(): void {
    this.isEdit = true;
    this.stockItemForm.reset();
    if (this.selectedStockItem) {
      this.loggerService.info(this.selectedStockItem);

      this.stockItemForm.controls['itemCode'].setValue(this.selectedStockItem.itemCode);
      this.stockItemForm.controls['itemName'].setValue(this.selectedStockItem.itemName);
      this.stockItemForm.controls['chemicalName'].setValue(this.selectedStockItem.chemicalName);
      this.stockItemForm.controls['status'].setValue(this.selectedStockItem.status);

      this.selectedPacketType = this.packetTypes.filter(x => x.typeCode == 1)[0]; // will always be initialized with packet type code 1 on edit.

      this.onTypeCodeChange();
      this.modalVisible = true;
    } else {
      this.modalVisible = false;
      this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: "Please choose stock item." })
    }
  }

  delete(): void {
    if (this.selectedStockItem != null) {
      this.confirmationService.confirm({
        message: 'Are You Sure Want To Delete?',
        header: 'Delete Confirmation',
        icon: 'pi pi-info-circle',
        accept: () => {
          this.stockItemService.delete(this.selectedStockItem.itemCode).subscribe({
            next: res => {
              this.messageService.add({ key: 'globalMessage', severity: 'success', summary: 'Confirmed', detail: 'Successfully deleted a stock item.' });
              this.loadData();
              this.selectedStockItem = null as any;
            },
            error: err => {
              this.selectedStockItem = null as any;
            },
            complete: () => {
              this.loading = false;
            }
          });
        },
        reject: () => {
          this.selectedStockItem = null as any;
        },
        key: 'stockItemDeleteDialog'
      });
    } else {
      this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: 'Please choose stock item.' });
    }
  }
  //#endregion

  // #region getTypeCodeChange
  getTypeCodeChange(): void {
    this.packetTypeService.get().subscribe({
      next: (res) => {
        this.packetTypes = res.data as PacketTypeModel[];
        if (this.isEdit) {
          this.selectedPacketType = this.packetTypes.filter(
            (x) => x.typeCode == this.selectedPacketType.typeCode
          )[0];
          this.onTypeCodeChange();
        }
      },
      error: () => { },
    });
  }
  //#endregion

  //#region onTypeCodeChange
  onTypeCodeChange(): void {
    if (this.selectedPacketType !== undefined && this.selectedPacketType !== null) {
      this.stockItemForm.controls['typeCode'].setValue(
        this.selectedPacketType.typeCode
      );
    }
  }
  //#endregion

  //#region clearSection
  clearSection(): void {
    this.selectedStockItem = null as any;
  }
  //#endregion

  //#region excel
  excel(): void {
    let exportData = this.selectedStockItem ? [this.selectedStockItem] : this.stockItems;

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
      { key: 'itemCode', value: 'Item Code' },
      { key: 'itemName', value: 'Item Name' },
      { key: 'chemicalName', value: 'Chemical' },
      { key: 'status', value: 'Status' },
      { key: 'createdOn', value: 'Created On' },
      { key: 'createdBy', value: 'Created By' },
      { key: 'updatedOn', value: 'Updated On' },
      { key: 'updatedBy', value: 'Updated By' },
    ];

    // Use exportSelectColsWithDynamicHeader for exporting data
    this.exportService.exportSelectColsWithDynamicHeader(exportData, columns, 'Stock Item');
  }
  //#endregion

  //#region submit
  submit(): void {
    if (this.stockItemForm.valid) {
      this.isSubmitting = true;
      if (!this.isEdit) {
        let itemName = this.stockItemForm.controls['itemName'].value;

        this.stockItemService.getByAutoId(itemName).subscribe({
          next: res => {
            const itemCode = res.data as string;
            this.stockItemForm.controls['itemCode'].setValue(itemCode);
            this.stockItemService.getByItemCode(itemCode, itemName).subscribe({
              next: () => {
                this.stockItemService.create(this.stockItemForm.value).subscribe({
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
                    this.selectedStockItem = null as any;
                  }
                })
              },
              error: err => {
                this.isSubmitting = false;
                this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: "Please create with new item name and try again." });
              }
            })
          },
          error: err => {
            this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: err.message.en });
            this.isSubmitting = false;
          }
        });
      } else {
        this.stockItemService.update(this.stockItemForm.value).subscribe({
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
            this.selectedStockItem = null as any;
            this.isSubmitting = false;
          }
        })
      }
    } else {
      Object.keys(this.stockItemForm.controls).forEach(field => {
        const control = this.stockItemForm.get(field);
        control?.markAsDirty({ onlySelf: true })
      });
    }
  }
  //#endregion
}
