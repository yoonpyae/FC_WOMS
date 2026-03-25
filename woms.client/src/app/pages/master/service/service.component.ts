import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServiceModel } from '@core_models/master/service.model';
import { ServiceService } from '@core_services/master/service.service';
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
  selector: 'app-service',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    ButtonModule,
    SplitButtonModule,
    ToggleSwitchModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    TagModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService, ExportService, DatePipe],
  templateUrl: './service.component.html',
  styleUrl: './service.component.scss'
})
export class ServiceComponent implements OnInit {
  services: ServiceModel[] = [];
  selectedService!: ServiceModel;

  items!: MenuItem[] | undefined;

  loading: boolean = false;
  isSubmitting: boolean = false;
  isEdit: boolean = false;
  modalVisible: boolean = false;

  constructor(
    private serviceService: ServiceService,
    private messageService: MessageService,
    private exportService: ExportService,
    private confirmationService: ConfirmationService,
    private loggerService: LoggerService,
    private sharedService: SharedService,
  ) {
    this.items = [
      {
        label: 'Edit',
        icon: 'pi pi-pen-to-square',
        command: () => this.update(),
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.delete(),
      },
      {
        label: 'Excel',
        icon: 'pi pi-file-excel',
        command: () => this.excel(),
      },
    ];
  }

  private formBuilder = inject(FormBuilder);
  public serviceForm: FormGroup = this.formBuilder.group({
    serviceId: [0, Validators.required],
    branchId: [0, Validators.required],
    serviceName: ['', Validators.required],
    fee: [0, [Validators.required, Validators.min(0)]],
    isActive: [false],
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    this.loading = true;
    this.serviceService.get(branchId).subscribe({
      next: (res) => {
        this.services = res.data as ServiceModel[];
        this.loading = false;

        this.loggerService.info(this.services);
      },
      error: (err) => { },
      complete: () => {
        this.loading = false;
      },
    });
  }

  create(): void {
    let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    this.serviceService.getAutoId(branchId).subscribe({
      next: (res) => {
        this.serviceForm.reset();
        this.serviceForm.controls['fee'].setValue(0);
        this.serviceForm.controls['serviceId'].setValue(res.data as number);
        this.serviceForm.controls['branchId'].setValue(branchId);
        this.serviceForm.controls['serviceName'].setValue('');
        this.serviceForm.controls['isActive'].setValue(false);
        this.isEdit = false;
        this.modalVisible = true;
      },
    });
  }

  update(): void {
    this.isEdit = true;
    this.serviceForm.reset();
    if (this.selectedService) {
      this.loggerService.info(this.selectedService);

      this.serviceForm.controls['serviceId'].setValue(
        this.selectedService.serviceId,
      );
      this.serviceForm.controls['branchId'].setValue(
        this.selectedService.branchId,
      );
      this.serviceForm.controls['serviceName'].setValue(
        this.selectedService.serviceName,
      );
      this.serviceForm.controls['fee'].setValue(this.selectedService.fee);
      this.serviceForm.controls['isActive'].setValue(
        this.selectedService.isActive,
      );
      this.modalVisible = true;
    } else {
      this.modalVisible = false;
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please choose Service.',
      });
    }
  }

  delete(): void {
    if (this.selectedService != null) {
      const branchId = this.selectedService.branchId;
      this.confirmationService.confirm({
        message: 'Are You Sure Want To Delete?',
        header: 'Delete Confirmation',
        icon: 'pi pi-info-circle',
        accept: () => {
          this.loading = true;
          this.serviceService.delete(this.selectedService.serviceId, branchId).subscribe({
            next: (res) => {
              this.messageService.add({
                key: 'globalMessage',
                severity: 'success',
                summary: 'Confirmed',
                detail: res.message.en,
              });
              this.loadData();
              this.selectedService = null as any;
            },
            error: () => { this.loading = false; },
            complete: () => {
              this.loading = false;
            },
          });
        },
        reject: () => {
          this.selectedService = null as any;
        },
        key: 'ServiceDeleteDialog',
      });
    } else {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please choose Service.',
      });
    }
  }

  excel(): void {
    let exportData = this.selectedService ? [this.selectedService] : this.services;

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
      { key: 'serviceId', value: 'Service ID' },
      { key: 'branchId', value: 'Branch ID' },
      { key: 'serviceName', value: 'Service Name' },
      { key: 'fee', value: 'Fee' },
      { key: 'isActive', value: 'Fixed' },
      { key: 'createdOn', value: 'Created On' },
      { key: 'createdBy', value: 'Created By' },
      { key: 'updatedOn', value: 'Updated On' },
      { key: 'updatedBy', value: 'Updated By' },
    ];

    // Use exportSelectColsWithDynamicHeader for exporting data
    this.exportService.exportSelectColsWithDynamicHeader(exportData, columns, 'Service');
  }

  submit(): void {
    if (this.serviceForm.valid) {
      let model = this.serviceForm.value as ServiceModel;
      model.branchId = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));

      this.isSubmitting = true;

      this.loggerService.info(model);
      if (!this.isEdit) {
        this.serviceService.create(this.serviceForm.value).subscribe({
          next: (res) => {
            this.loadData();
            this.isSubmitting = false;
            this.modalVisible = false;
            this.messageService.add({
              key: 'globalMessage',
              severity: 'success',
              summary: 'Success',
              detail: res.message.en,
            });
          },
          error: (err) => {
            this.isSubmitting = false;
            this.messageService.add({
              key: 'globalMessage',
              severity: 'warn',
              summary: 'Warning',
              detail: err.message.en,
            });
          },
          complete: () => {
            this.isSubmitting = false;
          },
        });
      } else {
        this.serviceService.update(this.serviceForm.value).subscribe({
          next: (res) => {
            this.loadData();
            this.modalVisible = false;
            this.isSubmitting = false;
            this.messageService.add({
              key: 'globalMessage',
              severity: 'success',
              summary: 'Success',
              detail: res.message.en,
            });
          },
          error: (err) => {
            this.isSubmitting = false;
            this.messageService.add({
              key: 'globalMessage',
              severity: 'warn',
              summary: 'Warning',
              detail: err.message.en,
            });
          },
          complete: () => {
            this.selectedService = null as any;
            this.isSubmitting = false;
          },
        });
      }
    } else {
      Object.keys(this.serviceForm.controls).forEach((field) => {
        const control = this.serviceForm.get(field);
        control?.markAsDirty({ onlySelf: true });
      });
    }
  }

  clearSelection() {
    this.selectedService = null as any;
  }

  preventNegativeInput($event: KeyboardEvent) {
    const inputChar = $event.key;
    if (inputChar === '-' || inputChar === 'e') {
      $event.preventDefault();
    }
  }
}
