import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { StateModel } from '@core_models/master/state.model';
import { SupplierModel, ViSupplierModel } from '@core_models/master/supplier.model';
import { TownshipModel } from '@core_models/master/townsip.model';
import { StateService } from '@core_services/master/state.service';
import { SupplierService } from '@core_services/master/supplier.service';
import { TownshipService } from '@core_services/master/township.service';
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
import { SplitButton } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'app-supplier',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    //primeNg
    ToastModule,
    ButtonModule,
    SplitButton,
    ToggleSwitch,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    TagModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    SelectModule
  ],

  providers: [ConfirmationService, DatePipe, DecimalPipe, ExportService],
  templateUrl: './supplier.component.html',
})
export class SupplierComponent implements OnInit {
  suppliers: ViSupplierModel[] = [];
  selectedSupplier!: ViSupplierModel;

  states: StateModel[] = [];
  SelectedState: StateModel | null = null;

  townships: TownshipModel[] = [];
  SelectedTownship: TownshipModel | null = null;

  items!: MenuItem[] | undefined;

  loading = false;
  isEdit = false;
  modalVisible = false;
  isSubmitting: boolean = false;

  constructor(
    private supplierService: SupplierService,
    private stateService: StateService,
    private townshipService: TownshipService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private loggerService: LoggerService,
    private sharedService: SharedService,
    private exportService: ExportService,
  ) {
    this.items = [
      {
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
      }
    ];
  }

  private formBuilder = inject(FormBuilder);
  public supplierForm: FormGroup = this.formBuilder.group({
    supplierId: [0],
    branchId: [0],
    companyName: ['', Validators.required],
    contactPerson: [''],
    stateId: [0, Validators.required],
    townshipId: [0, Validators.required],
    address: ['', Validators.required],
    phone: new FormControl('', {
      validators: [Validators.required, Validators.pattern("^(0(1|9)[0-9]{7,9})$")]
    }),
    email: new FormControl('', { validators: [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")] }),
    balance: [0],
    createdOn: [''],
    createdBy: [''],
    updatedOn: [''],
    updatedBy: [''],
    deletedOn: [''],
    deletedBy: [''],
    status: [false],
    remark: [''],
  });

  ngOnInit(): void {
    this.loadData();
    this.getStates();
  }

  loadData(): void {
    let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    this.loading = true;
    this.supplierService.get(branchId).subscribe({
      next: res => {
        this.suppliers = res.data as ViSupplierModel[];
        this.loading = false;

        this.loggerService.info(this.suppliers)
      },
      error: err => { },
      complete: () => {
        this.loading = false;
      }
    });
  }

  //#region Stage and Township

  getStates(): void {
    this.loading = true;
    this.stateService.get().subscribe({
      next: (res) => {
        this.states = res.data as StateModel[];
        if (this.isEdit) {
          let stateId = this.supplierForm.get('stateId')?.value;
          this.SelectedState = this.states.find(state => state.stateId === stateId) ?? null;
          if (this.SelectedState) {
            this.getTownships(this.SelectedState.stateId);
          }
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: err?.message?.en ?? 'Failed to load states.' });
      }
    });
  }

  onStateChange(): void {
    if (this.SelectedState) {
      this.supplierForm.get('stateId')?.setValue(this.SelectedState.stateId);
      this.getTownships(this.SelectedState.stateId);
      this.SelectedTownship = null;
      this.townships = [];
      this.supplierForm.get('townshipId')?.setValue(0);
    }
  }

  getTownships(stateId: number): void {
    this.loading = true;
    this.townshipService.getByStateId(stateId).subscribe({
      next: (res) => {
        this.townships = res.data as TownshipModel[];
        if (this.isEdit) {
          let townshipId = this.supplierForm.get('townshipId')?.value;
          this.SelectedTownship = this.townships.find(township => township.townshipId === townshipId) ?? null;
        }
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: err?.message?.en ?? 'Failed to load townships.' });
      },
    });
  }

  onTownshipChange(): void {
    if (this.SelectedTownship) {
      this.supplierForm.get('townshipId')?.setValue(this.SelectedTownship.townshipId);
    }
  }

  // #endregion

  create(): void {
    let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    this.supplierService.getAutoId(branchId).subscribe({
      next: res => {
        this.supplierForm.reset();
        this.supplierForm.controls['supplierId'].setValue(res.data as number);
        this.supplierForm.controls['branchId'].setValue(branchId);
        this.supplierForm.controls['status'].setValue(false);

        this.isEdit = false;
        this.modalVisible = true;
      }
    });
  }

  update(): void {
    this.isEdit = true;
    this.supplierForm.reset();
    if (this.selectedSupplier) {
      this.loggerService.info(this.selectedSupplier);

      this.supplierForm.controls['supplierId'].setValue(this.selectedSupplier.supplierId);
      this.supplierForm.controls['branchId'].setValue(this.selectedSupplier.branchId);
      this.supplierForm.controls['companyName'].setValue(this.selectedSupplier.companyName);
      this.supplierForm.controls['contactPerson'].setValue(this.selectedSupplier.contactPerson);
      this.supplierForm.controls['stateId'].setValue(this.selectedSupplier.stateId);
      this.supplierForm.controls['townshipId'].setValue(this.selectedSupplier.townshipId);
      this.supplierForm.controls['address'].setValue(this.selectedSupplier.address);
      this.supplierForm.controls['phone'].setValue(this.selectedSupplier.phone);
      this.supplierForm.controls['email'].setValue(this.selectedSupplier.email);
      this.supplierForm.controls['status'].setValue(this.selectedSupplier.status)

      this.modalVisible = true;
    } else {
      this.modalVisible = false;
      this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: "Please choose Supplier." });
    }
  }

  delete(): void {
    if (this.selectedSupplier != null) {
      this.confirmationService.confirm({
        message: 'Are You Sure Want To Delete?',
        header: 'Delete Confirmation',
        icon: 'pi pi-info-circle',
        accept: () => {
          this.supplierService.delete(this.selectedSupplier.supplierId).subscribe({
            next: res => {
              this.messageService.add({ key: 'globalMessage', severity: 'success', summary: 'Confirmed', detail: res.message.en });
              this.loadData();
              this.selectedSupplier = null as any;
            },
            complete: () => {
              this.loading = false;
            }
          });
        },
        reject: () => {
          this.selectedSupplier = null as any;
        },
        key: 'supplierDeleteDialog'
      });
    } else {
      this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: 'Please choose Supplier.' });
    }
  }

  excel(): void {
    let exportData = this.selectedSupplier ? [this.selectedSupplier] : this.suppliers;

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
      { key: 'supplierId', value: 'Supplier ID' },
      { key: 'branchId', value: 'Hospital ID' },
      { key: 'companyName', value: 'Company Name' },
      { key: 'contactPerson', value: 'Contact Person' },
      { key: 'stateId', value: 'State ID' },
      { key: 'townshipId', value: 'Township ID' },
      { key: 'address', value: 'Address' },
      { key: 'phone', value: 'Phone' },
      { key: 'email', value: 'Email' },
      { key: 'status', value: 'Status' },
      { key: 'createdOn', value: 'Created On' },
      { key: 'createdBy', value: 'Created By' },
      { key: 'updatedOn', value: 'Updated On' },
      { key: 'updatedBy', value: 'Updated By' },
    ];

    // Use exportSelectColsWithDynamicHeader for exporting data
    this.exportService.exportSelectColsWithDynamicHeader(exportData, columns, 'Supplier');
  }

  clearSection(): void {
    this.selectedSupplier = null as any;
  }

  submit(): void {
    console.log('Form Errors:', this.supplierForm.errors);
    console.log('Form Status:', this.supplierForm.status);

    // This will list every control and why it is failing:
    Object.keys(this.supplierForm.controls).forEach(key => {
      const controlErrors = this.supplierForm.get(key)?.errors;
      if (controlErrors != null) {
        console.log('Key control: ' + key + ', errors: ', controlErrors);
      }
    });

    if (this.supplierForm.valid) {
      let model = this.supplierForm.value as SupplierModel;
      model.branchId = Number.parseInt((this.sharedService.getDefaultBranchId() ?? '0'));
      this.loggerService.info(model);
      this.isSubmitting = true;

      if (!this.isEdit) {
        this.supplierService.create(this.supplierForm.value).subscribe(
          {
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
          }
        );
      } else {
        this.supplierService.update(this.supplierForm.value).subscribe(
          {
            next: res => {
              this.modalVisible = false;
              this.loadData();
              this.messageService.add({ key: 'globalMessage', severity: 'success', summary: 'Success', detail: res.message.en });
            },
            error: err => {
              this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: 'Warning', detail: err.message.en });
            },
            complete: () => {
              this.isSubmitting = false;
              this.selectedSupplier = null as any;
            }
          }
        );
      }
    } else {
      Object.keys(this.supplierForm.controls).forEach(field => {
        const control = this.supplierForm.get(field);
        control?.markAsDirty({ onlySelf: true })
      });
    }
  }
  preventNegativeInput($event: KeyboardEvent) {
    const inputChar = $event.key;
    if (inputChar === '-' || inputChar === 'e') {
      $event.preventDefault();
    }
  }

}
