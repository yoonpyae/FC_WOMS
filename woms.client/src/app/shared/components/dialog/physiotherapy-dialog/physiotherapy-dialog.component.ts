import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { PhysiotherapyModel } from '@core_models/master/physiotherapy.model';
import { VoucherItemModel } from '@core_models/voucher-item.model';
import { PhysiotherapyService } from '@core_services/master/physiotherapy.service';
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
  selector: 'app-physiotherapy-dialog',
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
  templateUrl: './physiotherapy-dialog.component.html',
  styleUrl: './physiotherapy-dialog.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhysiotherapyDialogComponent),
      multi: true
    }
  ]
})
export class PhysiotherapyDialogComponent implements OnInit {
  @Input() mode: string = "OPD";
  @Output() onValueChange = new EventEmitter<PhysiotherapyModel>();
  @Output() onSaved = new EventEmitter<void>();

  physiotherapies: PhysiotherapyModel[] = [];
  selectedPhysiotherapy: PhysiotherapyModel[] = [];

  loading: boolean = false;
  modalVisible: boolean = false;

  dropdownId: string = 'physiotherapy-dialog';
  isSubmitting: boolean = false;

  quantity: number = 1;

  metaKey: boolean = true;

  constructor(
    private physiotherapyService: PhysiotherapyService,
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
    let hospitalId: number = Number.parseInt((this.sharedService.getDefaultHospitalId() ?? '0'));
    this.loading = true;
    this.physiotherapyService.getActive(hospitalId).subscribe({
      next: (res) => {
        this.physiotherapies = res.data as PhysiotherapyModel[];
        this.loading = false;

        this.loggerService.info(this.physiotherapies);
      },
      error: (err) => { },
      complete: () => {
        this.loading = false;
      },
    });
  }

  selectedRow(rowData: PhysiotherapyModel): boolean {
    return this.selectedPhysiotherapy?.some((v) => v === rowData) ?? false;
  }

  submit(): void {
    if (this.selectedPhysiotherapy && this.selectedPhysiotherapy.length > 0 && this.quantity > 0) {
      for (let therapy of this.selectedPhysiotherapy) {
        if (!therapy.fee || therapy.fee === 0) {
          this.messageService.add({
            key: 'globalMessage',
            severity: 'warn',
            summary: 'Warning',
            detail: `Physiotherapy fee for "${therapy.physiotherapyName ?? 'Unknown Therapy'}" must be greater than 0.`
          });
          return;
        }
      }

      const cookieKey = (this.mode + '-voucher-item').toLowerCase();
      const data = this.cookieService.get(cookieKey);
      const cookieVoucherItem = JSON.parse(data === '' ? '[]' : data) as VoucherItemModel[];

      for (let therapy of this.selectedPhysiotherapy) {
        const existing = cookieVoucherItem.find(c => c.id === therapy.physiotherapyId.toString() && c.type === "Physiotherapy");

        if (!existing) {
          const newItem: VoucherItemModel = {
            id: therapy.physiotherapyId.toString(),
            name: therapy.physiotherapyName,
            price: therapy.fee,
            qty: this.quantity,
            total: therapy.fee * this.quantity,
            type: "Physiotherapy",
          };

          cookieVoucherItem.push(newItem);
          this.selectedPhysiotherapy = [];
        }
      }

      this.cookieService.set(cookieKey, JSON.stringify(cookieVoucherItem));

      this.messageService.add({
        key: 'globalMessage',
        severity: 'success',
        summary: 'Success',
        detail: 'Physiotherapy service(s) saved successfully.'
      });

      this.modalVisible = false;
      this.selectedPhysiotherapy = [];
      this.onSaved.emit();
      this.quantity = 1;

    } else {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one physiotherapy service'
      });
    }
  }

  cancel(): void {
    this.selectedPhysiotherapy = null as any;
    this.modalVisible = false;
  }

  onDialogHide(): void {
    this.selectedPhysiotherapy = [];
  }

}
