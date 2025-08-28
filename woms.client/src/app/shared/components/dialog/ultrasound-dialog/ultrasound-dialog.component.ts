import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { UltrasoundTestModel } from '@core_models/master/ultrasound-test.model';
import { VoucherItemModel } from '@core_models/voucher-item.model';
import { UltrasoundTestService } from '@core_services/master/ultrasound-test.service';
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
  selector: 'app-ultrasound-dialog',
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
  templateUrl: './ultrasound-dialog.component.html',
  styleUrl: './ultrasound-dialog.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UltrasoundDialogComponent),
      multi: true
    }
  ]
})
export class UltrasoundDialogComponent implements OnInit {
  @Input() mode: string = "OPD";
  @Output() onValueChange = new EventEmitter<UltrasoundTestModel>();
  @Output() onSaved = new EventEmitter<void>();

  ultrasoundTests: UltrasoundTestModel[] = [];
  selectedUltrasound: UltrasoundTestModel[] = [];

  dropdownId: string = 'ultrasound-dialog';
  isSubmitting: boolean = false;

  quantity: number = 1;

  loading: boolean = false;
  modalVisible: boolean = false;
  metaKey: boolean = true;

  constructor(
    private ultrasoundTestService: UltrasoundTestService,
    private loggerService: LoggerService,
    private sharedService: SharedService,
    private cookieService: CookieService,
    private messageService: MessageService
  ) { }


  ngOnInit(): void {

  }

  showDialog(): void {
    this.metaKey = false;
    this.modalVisible = true;
    this.loadData();
  }

  loadData(): void {
    let hospitalId: number = Number.parseInt((this.sharedService.getDefaultHospitalId() ?? "0"));
    this.loading = true;
    this.ultrasoundTestService.getActive(hospitalId).subscribe({
      next: (res) => {
        this.ultrasoundTests = res.data as UltrasoundTestModel[];
        this.loading = false;
        this.loggerService.info(this.ultrasoundTests);
      },
      error: (err) => { },
      complete: () => {
        this.loading = false;
      },
    });
  }

  selectedRow(rowData: UltrasoundTestModel): boolean {
    return this.selectedUltrasound?.some((v) => v === rowData) ?? false;
  }

  submit(): void {
    if (this.selectedUltrasound && this.selectedUltrasound.length > 0 && this.quantity > 0) {
      for (let test of this.selectedUltrasound) {
        if (!test.fee || test.fee === 0) {
          this.messageService.add({
            key: 'globalMessage',
            severity: 'warn',
            summary: 'Warning',
            detail: `Consultant fee for "${test.utstestName ?? 'Unknown Test'}" must be greater than 0.`
          });
          return;
        }
      }

      const cookieKey = (this.mode + '-voucher-item').toLowerCase();
      const data = this.cookieService.get(cookieKey);
      const cookieVoucherItem = JSON.parse(data === '' ? '[]' : data) as VoucherItemModel[];

      this.selectedUltrasound.forEach(test => {
        const existing = cookieVoucherItem.find(
          c => c.id === test.utstestId.toString() && c.type === "Ultrasound"
        );

        if (!existing) {
          const newItem: VoucherItemModel = {
            id: test.utstestId.toString(),
            name: test.utstestName,
            price: test.fee,
            qty: this.quantity,
            total: test.fee * this.quantity,
            type: "Ultrasound",
          };

          cookieVoucherItem.push(newItem);
        }
      });

      // Clear selection after loop
      this.selectedUltrasound = [];

      this.cookieService.set(cookieKey, JSON.stringify(cookieVoucherItem));

      // Show success message
      this.messageService.add({
        key: 'globalMessage',
        severity: 'success',
        summary: 'Success',
        detail: 'Ultrasound test(s) saved successfully.'
      });

      this.modalVisible = false;
      this.metaKey = true;
      this.onSaved.emit();
      this.quantity = 1;

    } else {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one ultrasound test'
      });
    }
  }


  cancel(): void {
    this.selectedUltrasound = null as any;
    this.modalVisible = false;
  }

  onDialogHide(): void {
    this.selectedUltrasound = [];
  }

}