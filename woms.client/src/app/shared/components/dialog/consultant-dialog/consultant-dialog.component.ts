import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { DoctorModel } from '@core_models/master/doctor.model';
import { DoctorDropDownComponent } from '@shared_component/drop-down/doctor-drop-down/doctor-drop-down.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Subscription } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { VoucherItemModel } from '@core_models/voucher-item.model';

@Component({
  selector: 'app-consultant-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    DoctorDropDownComponent,
  ],
  templateUrl: './consultant-dialog.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ConsultantDialogComponent),
      multi: true
    }],
})
export class ConsultantDialogComponent {
  @Input() mode: string = "OPD";
  @Output() onValueChange = new EventEmitter<DoctorModel>();
  @Output() onSaved = new EventEmitter<void>();

  subscription!: Subscription;

  dropdownId: string = 'consultant-dialog';
  isSubmitting: boolean = false;
  metaKey: boolean = true;
  quantity: number = 1;

  selectedDoctor!: DoctorModel;
  modalVisible: boolean = false;

  constructor(
    private cookieService: CookieService,
    private messageService: MessageService
  ) { }

  //#region Dialog Methods
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

  //#region Doctor Selection Methods
  onDoctorChange(): void {
    this.onValueChange.emit(this.selectedDoctor);
  }
  //#endregion

  //#region Submission Methods
  submit(): void {
    if (!this.selectedDoctor || this.quantity <= 0) {
      if (!this.quantity || this.quantity <= 0) {
        this.messageService.add({
          key: 'globalMessage',
          severity: 'warn',
          summary: 'Warning',
          detail: 'Quantity must be greater than 0.'
        });
      }
      return;
    }

    if (!this.selectedDoctor.consultantFee || this.selectedDoctor.consultantFee === 0) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Consultant fee must be greater than 0.'
      });
      return;
    }

    // Read existing consultants from cookie
    const cookieKey = (this.mode + '-voucher-item').toLowerCase();
    const data = this.cookieService.get(cookieKey);
    const cookieVoucherItem = JSON.parse(data === '' ? '[]' : data) as VoucherItemModel[];

    // Check if doctor already exists
    const existing = cookieVoucherItem.find(c =>
      c.id === this.selectedDoctor.doctorId.toString() &&
      c.type === "Consultant"
    );

    if (existing) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'This consultant already exists.'
      });
      this.modalVisible = false;
      return;
    }

    // Add new consultant
    const newConsultant: VoucherItemModel = {
      id: this.selectedDoctor.doctorId.toString(),
      name: this.selectedDoctor.name,
      price: this.selectedDoctor.consultantFee,
      qty: 1,
      total: this.selectedDoctor.consultantFee,
      type: 'Consultant'
    };

    cookieVoucherItem.push(newConsultant);
    this.cookieService.set(cookieKey, JSON.stringify(cookieVoucherItem));

    this.modalVisible = false;
    this.messageService.add({
      key: 'globalMessage',
      severity: 'success',
      summary: 'Success',
      detail: 'Consultant added.'
    });
    this.selectedDoctor = null as any;
    this.quantity = 1;
    this.metaKey = true;
    this.onSaved.emit();
  }
  //#endregion
}
