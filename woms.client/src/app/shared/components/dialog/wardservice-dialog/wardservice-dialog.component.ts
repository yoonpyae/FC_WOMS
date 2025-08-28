import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { WardServiceModel } from '@core_models/master/ward-service.model';
import { VoucherItemModel } from '@core_models/voucher-item.model';
import { WardServiceService } from '@core_services/master/ward-service.service';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-wardservice-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    //primeNg
    ToastModule,
    ButtonModule,
    ToggleSwitchModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    TagModule,
    TableModule,
    SelectModule,
    DialogModule
  ],
  templateUrl: './wardservice-dialog.component.html',
  styleUrl: './wardservice-dialog.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => WardserviceDialogComponent),
      multi: true
    }
  ]
})
export class WardserviceDialogComponent implements OnInit {
  @Input() mode: string = "OPD";
  @Output() onValueChange = new EventEmitter<WardServiceModel>();
  @Output() onSaved = new EventEmitter<void>();

  wardServices: WardServiceModel[] = [];
  selectedWardService: WardServiceModel[] = [];

  dropdownId: string = 'service-dialog';
  isSubmitting: boolean = false;

  quantity: number = 1;

  loading: boolean = false;
  modalVisible: boolean = false;

  metaKey: boolean = true;

  constructor(
    private wardServiceService: WardServiceService,
    private loggerService: LoggerService,
    private sharedService: SharedService,
    private cookieService: CookieService,
    private messageService: MessageService,
  ) { }


  ngOnInit(): void {
  }

  showDialog(): void {
    this.metaKey = false;
    this.modalVisible = true;
    this.loadData();
  }


  loadData(): void {
    this.loading = true;
    let hospitalId: number = Number.parseInt((this.sharedService.getDefaultHospitalId() ?? "0"));
    this.wardServiceService.getActive(hospitalId).subscribe({
      next: res => {
        this.wardServices = res.data as WardServiceModel[];
        this.loading = false;

        this.loggerService.info(this.selectedWardService);
      },
      error: err => {

      },
      complete: () => {
        this.loading = false;
      }
    })
  }

  selectedRow(rowData: WardServiceModel): boolean {
    return this.selectedWardService?.some((v) => v === rowData) ?? false;
  }

  submit(): void {
    if (this.selectedWardService && this.selectedWardService.length > 0) {
      for (let service of this.selectedWardService) {
        if (!service.fee || service.fee === 0) {
          this.messageService.add({
            key: 'globalMessage',
            severity: 'warn',
            summary: 'Warning',
            detail: `Service fee for "${service.wardServiceName ?? 'Unknown Ward'}" must be greater than 0.`
          });
          return;
        }
      }

      const cookieKey = (this.mode + '-voucher-item').toLowerCase();
      const data = this.cookieService.get(cookieKey);
      const cookieVoucherItem = JSON.parse(data === '' ? '[]' : data) as VoucherItemModel[];

      for (let service of this.selectedWardService) {
        const existing = cookieVoucherItem.find(c => c.id === service.wardId.toString() && c.type === "Ward Service");

        if (!existing) {
          const newItem: VoucherItemModel = {
            id: service.wardId.toString(),
            name: service.wardServiceName,
            price: service.fee,
            qty: this.quantity,
            total: service.fee,
            type: "Ward Service",
          };
          this.selectedWardService = [];
          cookieVoucherItem.push(newItem);
        }
      }

      this.cookieService.set(cookieKey, JSON.stringify(cookieVoucherItem));

      this.messageService.add({
        key: 'globalMessage',
        severity: 'success',
        summary: 'Success',
        detail: 'Ward service(s) saved successfully.'
      });

      this.modalVisible = false;
      this.selectedWardService = [];
      this.onSaved.emit();
      this.quantity = 1;

    } else {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one ward service.'
      });
    }
  }

  cancel(): void {
    this.selectedWardService = null as any;
    this.modalVisible = false;
  }

  onDialogHide(): void {
    this.selectedWardService = [];
  }
}
