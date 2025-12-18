import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupplierModel } from '@core_models/master/supplier.model';
import { SupplierService } from '@core_services/master/supplier.service';
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
    ConfirmDialogModule
  ],

  providers: [ConfirmationService, DatePipe, DecimalPipe, ExportService],
  templateUrl: './supplier.component.html',
})
export class SupplierComponent implements OnInit {
  suppliers: SupplierModel[] = [];
  selectedSupplier!: SupplierModel;

  items!: MenuItem[] | undefined;

  loading = false;
  isEdit = false;
  modalVisible = false;
  isSubmitting: boolean = false;

  constructor(
    private supplierService: SupplierService,
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
  public supplierform: FormGroup = this.formBuilder.group({
    supplierId: [0],
    clinicId: [0],
    companyName: ['', Validators.required],
    contactPerson: [''],
    address: ['', Validators.required],
    phone: new FormControl('', {
      validators: [Validators.required, Validators.pattern("^(0(1|9)[0-9]{7,9})$")]
    }),
    email: new FormControl('', { validators: [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")] }),
    balance: [0, [Validators.required, Validators.min(0)]],
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
  }

  loadData(): void {
    let clinicId: number = Number.parseInt((this.sharedService.getDefaultClinicId() ?? "0"));
    this.loading = true;
    this.supplierService.get(clinicId).subscribe({
      next: res => {
        this.suppliers = res.data as SupplierModel[];
        this.loading = false;

        this.loggerService.info(this.suppliers)
      },
      error: err => { },
      complete: () => {
        this.loading = false;
      }
    });
  }

  create(): void {
    let clinicId: number = Number.parseInt((this.sharedService.getDefaultClinicId() ?? "0"));
    this.supplierService.getAutoId(clinicId).subscribe({
      next: res => {
        this.supplierform.reset();
        this.supplierform.controls['balance'].setValue(0);
        this.supplierform.controls['supplierId'].setValue(res.data as number);
        this.supplierform.controls['clinicId'].setValue(clinicId);
        this.supplierform.controls['status'].setValue(false);

        this.isEdit = false;
        this.modalVisible = true;
      }
    });
  }

  update(): void {
    this.isEdit = true;
    this.supplierform.reset();
    if (this.selectedSupplier) {
      this.loggerService.info(this.selectedSupplier);

      this.supplierform.controls['supplierId'].setValue(this.selectedSupplier.supplierId);
      this.supplierform.controls['clinicId'].setValue(this.selectedSupplier.cliniclId);
      this.supplierform.controls['companyName'].setValue(this.selectedSupplier.companyName);
      this.supplierform.controls['contactPerson'].setValue(this.selectedSupplier.contactPerson);
      this.supplierform.controls['address'].setValue(this.selectedSupplier.address);
      this.supplierform.controls['phone'].setValue(this.selectedSupplier.phone);
      this.supplierform.controls['email'].setValue(this.selectedSupplier.email);
      this.supplierform.controls['balance'].setValue(this.selectedSupplier.balance);
      this.supplierform.controls['status'].setValue(this.selectedSupplier.status)

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
      { key: 'clinicId', value: 'Hospital ID' },
      { key: 'companyName', value: 'Company Name' },
      { key: 'contactPerson', value: 'Contact Person' },
      { key: 'address', value: 'Address' },
      { key: 'phone', value: 'Phone' },
      { key: 'email', value: 'Email' },
      { key: 'balance', value: 'balance' },
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
    if (this.supplierform.valid) {
      let model = this.supplierform.value as SupplierModel;
      model.cliniclId = Number.parseInt((this.sharedService.getDefaultClinicId() ?? '0'));
      this.loggerService.info(model);
      this.isSubmitting = true;

      if (!this.isEdit) {
        this.supplierService.create(this.supplierform.value).subscribe(
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
        this.supplierService.update(this.supplierform.value).subscribe(
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
      Object.keys(this.supplierform.controls).forEach(field => {
        const control = this.supplierform.get(field);
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
