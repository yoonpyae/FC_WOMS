import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { ECGTestModel } from '@core_models/master/ecg-test.model';
import { VoucherItemModel } from '@core_models/voucher-item.model';
import { EcgTestService } from '@core_services/master/ecg-test.service';
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
import { ToggleSwitch, ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-ecg-dialog',
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
  templateUrl: './ecg-dialog.component.html',
  styleUrl: './ecg-dialog.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EcgDialogComponent),
      multi: true
    }
  ]
})
export class EcgDialogComponent implements OnInit {
  @Input() mode: string = "OPD";
  @Output() onValueChange = new EventEmitter<ECGTestModel>();
  @Output() onSaved = new EventEmitter<void>();

  ecgTests: ECGTestModel[] = [];
  selectedECGTest: ECGTestModel[] = [];

  dropdownId: string = 'ecg-dialog';
  isSubmitting: boolean = false;

  quantity: number = 1;

  loading: boolean = false;
  modalVisible: boolean = false;

  metaKey: boolean = false;

  constructor(
    private ecgTestService: EcgTestService,
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
    this.ecgTestService.getActive(hospitalId).subscribe({
      next: (res) => {
        this.ecgTests = res.data as ECGTestModel[];
        this.loading = false;
        this.loggerService.info(this.ecgTests);
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

  selectedRow(rowData: ECGTestModel): boolean {
    return this.selectedECGTest?.some((v) => v === rowData) ?? false;
  }

  submit(): void {
    if (this.selectedECGTest && this.selectedECGTest.length > 0 && this.quantity > 0) {
      for (let test of this.selectedECGTest) {
        if (!test.fee || test.fee === 0) {
          this.messageService.add({
            key: 'globalMessage',
            severity: 'warn',
            summary: 'Warning',
            detail: `Consultant fee for "${test.ecgtestName ?? 'Unknown Test'}" must be greater than 0.`
          });
          return;
        }
      }

      const cookieKey = (this.mode + '-voucher-item').toLowerCase();
      const data = this.cookieService.get(cookieKey);
      const cookieVoucherItem = JSON.parse(data === '' ? '[]' : data) as VoucherItemModel[];

      for (let ecgTest of this.selectedECGTest) {
        const existing = cookieVoucherItem.find(c => c.id === ecgTest.ecgtestId.toString() && c.type === "ECG");

        if (!existing) {
          const newItem: VoucherItemModel = {
            id: ecgTest.ecgtestId.toString(),
            name: ecgTest.ecgtestName,
            price: ecgTest.fee,
            qty: this.quantity,
            total: ecgTest.fee,
            type: "ECG",
          };
          cookieVoucherItem.push(newItem);
          this.selectedECGTest = [];
        }
      }

      this.cookieService.set(cookieKey, JSON.stringify(cookieVoucherItem));

      this.messageService.add({
        key: 'globalMessage',
        severity: 'success',
        summary: 'Success',
        detail: 'ECG Test(s) saved successfully.'
      });

      this.modalVisible = false;
      this.selectedECGTest = [];
      this.quantity = 1;

      this.onSaved.emit();
    } else {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one ECG test'
      });
    }
  }

  cancel(): void {
    this.selectedECGTest = null as any;
    this.modalVisible = false;
  }

  onDialogHIde(): void {
    this.selectedECGTest = [];
  }

}
