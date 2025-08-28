import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { LabSubGroupModel } from '@core_models/master/lab-sub-group.model';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-lab-sub-group-dialog',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    DialogModule,
    TableModule,
    ButtonModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LabSubGroupDialogComponent),
      multi: true
    }
  ],
  templateUrl: './lab-sub-group-dialog.component.html',
  styleUrl: './lab-sub-group-dialog.component.scss'
})
export class LabSubGroupDialogComponent implements OnInit {
  @Input() mode: string = "OPD";
  @Output() onValueChange = new EventEmitter<LabSubGroupModel>();
  @Output() onSaved = new EventEmitter<void>();

  labSubGroups: LabSubGroupModel[] = [];
  selectedLabSubGroup!: LabSubGroupModel;
  modalVisible: boolean = false;
  labSubloading: boolean = false;

  ngOnInit(): void {

  }

  submit(): void {

  }

  cancel(): void {

  }
}
