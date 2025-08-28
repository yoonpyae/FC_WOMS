import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { XRayTestModel } from '@core_models/master/xray-test.model';
import { VoucherItemModel } from '@core_models/voucher-item.model';
import { XrayTestService } from '@core_services/master/xray-test.service';
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
  selector: 'app-xray-dialog',
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
  templateUrl: './xray-dialog.component.html',
  styleUrl: './xray-dialog.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => XrayDialogComponent),
      multi: true
    }
  ]
})

export class XrayDialogComponent implements OnInit {
  @Input() mode: string = "OPD";
  @Output() onValueChange = new EventEmitter<XRayTestModel>();
  @Output() onSaved = new EventEmitter<void>();

  xrayTests: XRayTestModel[] = [];
  selectedXray: XRayTestModel[] = [];

  loading: boolean = false;
  modalVisible: boolean = false;

  dropdownId: string = 'xray-dialog';
  isSubmitting: boolean = false;

  quantity: number = 1;

  metaKey: boolean = true;

  constructor(
    private xrayTestService: XrayTestService,
    private loggerService: LoggerService,
    private sharedService: SharedService,
    private cookieService: CookieService,
    private messageService: MessageService,
  ) { }


  ngOnInit(): void {
  }

  loadData(): void {
    let hospitalId: number = Number.parseInt((this.sharedService.getDefaultHospitalId() ?? '0'));
    this.loading = true;
    this.xrayTestService.getActive(hospitalId).subscribe({
      next: (res) => {
        this.xrayTests = res.data as XRayTestModel[];
        this.loading = false;

        this.loggerService.info(this.xrayTests);
      },
      error: (err) => { },
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

  selectedRow(rowData: XRayTestModel): boolean {
    return this.selectedXray?.some((v) => v === rowData) ?? false;
  }

  submit(): void {
    if (this.selectedXray && this.selectedXray.length > 0 && this.quantity > 0) {
      for (let test of this.selectedXray) {
        if (!test.fee || test.fee === 0) {
          this.messageService.add({
            key: 'globalMessage',
            severity: 'warn',
            summary: 'Warning',
            detail: `Consultant fee for "${test.xrayTestName ?? 'Unknown Test'}" must be greater than 0.`
          });
          return;
        }
      }

      const cookieKey = (this.mode + '-voucher-item').toLowerCase();
      const data = this.cookieService.get(cookieKey);
      const cookieVoucherItem = JSON.parse(data === '' ? '[]' : data) as VoucherItemModel[];

      for (let xray of this.selectedXray) {
        const existing = cookieVoucherItem.find(c => c.id === xray.xrayTestId.toString() && c.type === "X-Ray");

        if (!existing) {
          const newItem: VoucherItemModel = {
            id: xray.xrayTestId.toString(),
            name: xray.xrayTestName,
            price: xray.fee,
            qty: this.quantity,
            total: xray.fee * this.quantity,
            type: "X-Ray",
          };
          this.selectedXray = [];
          cookieVoucherItem.push(newItem);
        }
      }

      this.cookieService.set(cookieKey, JSON.stringify(cookieVoucherItem));

      this.messageService.add({
        key: 'globalMessage',
        severity: 'success',
        summary: 'Success',
        detail: 'X-Ray test(s) saved successfully.'
      });

      this.modalVisible = false;
      this.selectedXray = [];
      this.onSaved.emit();
      this.quantity = 1;
    } else {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one X-Ray test'
      });
    }
  }

  cancel(): void {
    this.selectedXray = null as any;
    this.modalVisible = false;
  }

  onDialogHide(): void {
    this.selectedXray = [];
  }

}
