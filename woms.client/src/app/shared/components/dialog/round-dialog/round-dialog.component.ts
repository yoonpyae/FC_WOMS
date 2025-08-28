import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DoctorModel } from '@core_models/master/doctor.model';
import { VoucherItemModel } from '@core_models/voucher-item.model';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';
import { RoundDoctorDropDownComponent } from "@shared_component/drop-down/round-doctor-drop-down/round-doctor-drop-down.component";

@Component({
  selector: 'app-round-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    RoundDoctorDropDownComponent
],
  templateUrl: './round-dialog.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RoundDialogComponent),
      multi: true
    }
  ],
})
export class RoundDialogComponent implements OnInit {
  @Input() mode: string = "Admission";
  @Output() onValueChange = new EventEmitter<DoctorModel>();
  @Output() onSaved = new EventEmitter<void>();

  subscription!: Subscription;

  quantity: number = 1;
  dropdownId: string = 'round-dialog';
  isSubmitting: boolean = false;
  selectedDoctor!: DoctorModel;
  modalVisible: boolean = false;
  metaKey: boolean = true;

  constructor(
    private cookieService: CookieService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void { }

  //#region Dialog Control
  showDialog(): void {
    this.metaKey = false;
    this.modalVisible = true;
  }

  cancel(): void {
    this.selectedDoctor = null as any;
    this.modalVisible = false;
  }

  onDialogHide(): void {
    this.selectedDoctor = null as any;
  }
  //#endregion

  //#region Doctor Selection
  onDoctorChange(): void {
    this.onValueChange.emit(this.selectedDoctor);
  }
  //#endregion

  //#region Submission
  submit(): void {
    if (this.selectedDoctor && this.quantity > 0) {
      if (!this.selectedDoctor.roundFee || this.selectedDoctor.roundFee === 0) {
        this.messageService.add({
          key: 'globalMessage',
          severity: 'warn',
          summary: 'Warning',
          detail: 'Round fee must be greater than 0.'
        });
        return;
      }

      const cookieKey = (this.mode + '-voucher-item').toLowerCase();
      const data = this.cookieService.get(cookieKey);
      const cookieVoucherItem = JSON.parse(data === '' ? '[]' : data) as VoucherItemModel[];

      const existing = cookieVoucherItem.find(
        c => c.id === this.selectedDoctor.doctorId.toString() && c.type === "Round"
      );

      if (existing) {
        existing.qty += this.quantity;
        existing.total = existing.qty * this.selectedDoctor.roundFee;
      } else {
        const newRound: VoucherItemModel = {
          id: this.selectedDoctor.doctorId.toString(),
          name: this.selectedDoctor.name,
          price: this.selectedDoctor.roundFee,
          qty: this.quantity,
          total: this.selectedDoctor.roundFee * this.quantity,
          type: 'Round',
        };
        cookieVoucherItem.push(newRound);
      }

      this.cookieService.set(cookieKey, JSON.stringify(cookieVoucherItem));

      this.messageService.add({
        key: 'globalMessage',
        severity: 'success',
        summary: 'Success',
        detail: 'Round added.'
      });

      this.selectedDoctor = null as any;
      this.quantity = 1;
      this.modalVisible = false;
      this.metaKey = true;
      this.onSaved.emit();

    } else if (!this.quantity || this.quantity <= 0) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Quantity must be greater than 0.'
      });
    }
  }
  //#endregion
}