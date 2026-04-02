import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MainStockModel, ViMainStockModel } from '@core_models/stock/main-stock.model';
import { PacketTypeModel } from '@core_models/stock/packet-type.model';
import { MainStockService } from '@core_services/stock/main-stock.service';
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
import { SelectModule } from 'primeng/select';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Table } from 'primeng/table';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-main-stock',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ToastModule,
    SplitButtonModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ToggleSwitchModule,
    ConfirmDialogModule,
    SelectModule
  ],
  providers: [
    ConfirmationService, ExportService, DatePipe
  ],
  templateUrl: './main-stock.component.html'
})
export class MainStockComponent implements OnInit {
  @ViewChild('dt1') dt1!: Table;
  mainstocks: ViMainStockModel[] = [];
  selectedMainStock!: MainStockModel;
  packetTypes: PacketTypeModel[] = [];
  selectedPacketType!: PacketTypeModel;

  items!: MenuItem[];
  loading: boolean = false;
  isEdit: boolean = false;
  isSubmitting: boolean = false;

  modalVisible: boolean = false;

  constructor(
    private mainStockService: MainStockService,
    private messageService: MessageService,
    private loggerService: LoggerService,
    private sharedService: SharedService,
    private exportService: ExportService,
    private packetTypeService: PacketTypeService,
    private route: ActivatedRoute
  ) {
    this.items = [
      {
        label: 'Excel',
        icon: 'pi pi-file-excel',
        command: () => this.excel()
      }
    ]
  }

  //#region formBuilder
  private formBuilder = inject(FormBuilder);
  public mainStockForm: FormGroup = this.formBuilder.group({
    itemCode: [''],
    typeCode: [0, Validators.required],
    branchId: [0, Validators.required],
    purchasePrice: [0, [Validators.required, Validators.min(0)]],
    salePrice: [0, [Validators.required, Validators.min(0)]],
    groundBalance: [0, [Validators.required, Validators.min(0)]],
    status: [false],
  })
  //#endregion

  //#region ngOnInit and loadData
  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    this.mainStockService.get(branchId).subscribe({
      next: res => {
        this.mainstocks = res.data as ViMainStockModel[];
        this.loading = false;

        this.loggerService.info(this.mainstocks);

        const filterType = this.route.snapshot.queryParamMap.get('filter');

        const outOfStockCount = this.mainstocks.filter(item => item.groundBalance === 0).length;
        const lowStockCount = this.mainstocks.filter(item => (item.groundBalance ?? -1) > 0 && (item.groundBalance ?? -1) <= 10).length;

        if (outOfStockCount > 0 && filterType !== 'low-stock') {
          this.messageService.add({
            severity: 'error',
            summary: 'Out of Stock Alert',
            detail: `Attention! ${outOfStockCount} item(s) have 0 ground balance.`,
            life: 6000
          });
        }

        if (lowStockCount > 0 && filterType !== 'out-of-stock') {
          this.messageService.add({
            severity: 'warn',
            summary: 'Low Stock Alert',
            detail: `${lowStockCount} item(s) are running low (10 or fewer remaining).`,
            life: 6000
          });
        }

        setTimeout(() => {
          this.applyRouteFilters();
        });
      },
      error: err => {

      },
      complete: () => {
        this.loading = false;
      }
    })
    this.getPackettype();
  }
  //#endregion

  applyRouteFilters(): void {
    const filterType = this.route.snapshot.queryParamMap.get('filter');

    if (filterType === 'out-of-stock') {
      // Filters exactly to 0
      this.dt1.filter(0, 'groundBalance', 'equals');
    } else if (filterType === 'low-stock') {
      // Filters to 10 or less (You can change '10' to whatever your low-stock threshold is)
      this.dt1.filter(10, 'groundBalance', 'lte');
    }
  }

  clearFilters(searchBox: HTMLInputElement): void {
    this.dt1.clear(); // Clears all table filters
    searchBox.value = ''; // Clears the global search input
  }

  //#region CRUD 
  update(): void {
    this.isEdit = true;
    this.mainStockForm.reset();
    if (this.selectedMainStock) {
      this.loggerService.info(this.selectedMainStock);

      this.mainStockForm.controls['itemCode'].setValue(this.selectedMainStock.itemCode);
      // this.mainStockForm.controls['itemCode'].disable();
      this.mainStockForm.controls['branchId'].setValue(this.selectedMainStock.branchId);
      this.mainStockForm.controls['typeCode'].setValue(this.selectedMainStock.typeCode);
      this.mainStockForm.controls['purchasePrice'].setValue(this.selectedMainStock.purchasePrice);
      this.mainStockForm.controls['salePrice'].setValue(this.selectedMainStock.salePrice);
      this.mainStockForm.controls['groundBalance'].setValue(this.selectedMainStock.groundBalance);
      this.mainStockForm.controls['status'].setValue(this.selectedMainStock.status);

      this.selectedPacketType = this.packetTypes.filter(x => x.typeCode == this.selectedMainStock.typeCode)[0];
      this.modalVisible = true;
    } else {
      this.modalVisible = false;
      this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: "Please choose main stock." })
    }
  }
  //#endregion

  //#region getPacketType
  getPackettype(): void {
    const branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    this.packetTypeService.get(branchId).subscribe({
      next: (res) => {
        this.packetTypes = res.data as PacketTypeModel[];
        if (this.isEdit) {
          this.selectedPacketType = this.packetTypes.filter(
            (x) => x.typeCode == this.selectedPacketType.typeCode
          )[0];
          this.onPacketTypeChange();
        }
      },
      error: () => { },
    });
  }
  //#endregion

  //#region onPacketTypeChange
  onPacketTypeChange(): void {
    if (this.selectedPacketType !== undefined && this.selectedPacketType !== null) {
      this.mainStockForm.controls['typeCode'].setValue(
        this.selectedPacketType.typeCode
      );
    }
  }
  //#endregion

  //#region excel
  excel(): void {
    let exportData = this.selectedMainStock ? [this.selectedMainStock] : this.mainstocks;

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
      { key: 'typeCode', value: 'Type Code' },
      { key: 'purchasePrice', value: 'Purchase Price' },
      { key: 'salePrice', value: 'Sale Price' },
      { key: 'groundBalance', value: 'groundBalance' },
      { key: 'status', value: 'Status' },
      { key: 'createdOn', value: 'Created On' },
      { key: 'createdBy', value: 'Created By' },
      { key: 'updatedOn', value: 'Updated On' },
      { key: 'updatedBy', value: 'Updated By' },
    ];

    // Use exportSelectColsWithDynamicHeader for exporting data
    this.exportService.exportSelectColsWithDynamicHeader(exportData, columns, 'Main Stock');
  }
  //#endregion

  //#region clearSection
  clearSection(): void {
    this.selectedMainStock = null as any;
  }
  //#endregion

  //#region preventNegativeInput
  preventNegativeInput($event: KeyboardEvent) {
    const inputChar = $event.key;
    if (inputChar === '-' || inputChar === 'e') {
      $event.preventDefault();
    }
  }
  //#endregion

  //#region submit
  submit(): void {
    if (this.mainStockForm.valid) {
      this.isSubmitting = true;
      this.loggerService.info(this.selectedMainStock);
      if (!this.isEdit) {
        this.mainStockService.create(this.mainStockForm.value).subscribe({
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
        let model: MainStockModel = this.mainStockForm.value;
        model.itemCode = this.selectedMainStock.itemCode;
        this.mainStockService.update(model).subscribe({
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
            this.selectedMainStock = null as any;
            this.isSubmitting = false;
          }
        })
      }
    } else {
      Object.keys(this.mainStockForm.controls).forEach(field => {
        const control = this.mainStockForm.get(field);
        control?.markAsDirty({ onlySelf: true })
      });
    }
  }
  //#endregion
}
