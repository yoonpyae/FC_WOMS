import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, OnInit, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { OtServiceModel } from '@core_models/master/ot-service.model';
import { OTVoucherItemModel } from '@core_models/voucher-item.model';
import { OtServiceService } from '@core_services/master/ot-service.service';
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
  selector: 'app-ot-service-dialog',
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
  templateUrl: './ot-service-dialog.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OtServiceDialogComponent),
      multi: true
    }
  ]
})
export class OtServiceDialogComponent implements OnInit {
  @Output() onValueChange = new EventEmitter<OtServiceModel>();
  @Output() onSaved = new EventEmitter<void>();

  otServices: OtServiceModel[] = [];
  selectedOTService: OtServiceModel[] = [];

  dropdownId: string = 'ot-service-dialog';
  isSubmitting: boolean = false;

  quantity: number = 1;

  loading: boolean = false;
  modalVisible: boolean = false;

  metaKey: boolean = false;

  constructor(
    private otService: OtServiceService,
    private loggerService: LoggerService,
    private sharedService: SharedService,
    private cookieService: CookieService,
    private messageService: MessageService,
  ) { }

  ngOnInit(): void {
  }

  loadData() {
    let hospitalId: number = Number.parseInt((this.sharedService.getDefaultHospitalId() ?? "0"));
    this.loading = true;
    this.otService.getActive(hospitalId).subscribe({
      next: (res) => {
        this.otServices = res.data as OtServiceModel[];
        this.loading = false;
        this.loggerService.info(this.otServices);
      },
      error: (err) => {
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  showDialog(): void {
    this.metaKey = false;
    this.modalVisible = true;
    this.loadData();
  }

  selectedRow(rowData: OtServiceModel): boolean {
    return this.selectedOTService?.some((v) => v === rowData) ?? false;
  }

  submit(): void {
    if (this.selectedOTService && this.selectedOTService.length > 0 && this.quantity > 0) {
      for (let test of this.selectedOTService) {
        if (!test.fee || test.fee === 0) {
          this.messageService.add({
            key: 'globalMessage',
            severity: 'warn',
            summary: 'Warning',
            detail: `Fee for "${test.otServiceName ?? 'Unknown Test'}" must be greater than 0.`
          });
          return;
        }
      }

      const cookieKey = ('voucher-item').toLowerCase();
      const data = this.cookieService.get(cookieKey);
      const cookieVoucherItem = JSON.parse(data === '' ? '[]' : data) as OTVoucherItemModel[];

      for (let otService of this.selectedOTService) {
        const existing = cookieVoucherItem.find(c => c.id === otService.otsid.toString() && c.type === "OT Service");

        if (!existing) {
          const newItem: OTVoucherItemModel = {
            id: otService.otsid.toString(),
            name: otService.otServiceName,
            typecode: otService.otsid,
            typename: otService.otServiceName,
            price: otService.fee,
            qty: this.quantity,
            total: otService.fee,
            type: "OT Service",
          };
          cookieVoucherItem.push(newItem);
          this.selectedOTService = [];
        }
      }

      this.cookieService.set(cookieKey, JSON.stringify(cookieVoucherItem));

      this.messageService.add({
        key: 'globalMessage',
        severity: 'success',
        summary: 'Success',
        detail: 'OT Service(s) saved successfully.'
      });

      this.modalVisible = false;
      this.selectedOTService = [];
      this.quantity = 1;

      this.onSaved.emit();
    } else {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one OT Service'
      });
    }
  }

  cancel(): void {
    this.selectedOTService = null as any;
    this.modalVisible = false;
  }

  onDialogHIde(): void {
    this.selectedOTService = [];
  }

}
