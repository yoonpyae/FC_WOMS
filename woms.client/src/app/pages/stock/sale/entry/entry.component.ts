import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SaleEntryDisplayModel } from '@core_models/stock/sale/sale-entry-detail.model';
import { SaleModel } from '@core_models/stock/sale/sale.model';
import { ItemCodeDropdownComponent } from '@shared_component/drop-down/item-code-dropdown/item-code-dropdown.component';
import { PacketTypeDropdownComponent } from '@shared_component/drop-down/packet-type-dropdown/packet-type-dropdown.component';
import { DropdownStateService } from '@shared_services/state-management/dropdown-state.service';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

@Component({
  selector: 'app-sale-entry',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    // PrimeNG Modules
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
    SelectModule,
    ConfirmDialogModule,
    DatePickerModule,

    // Custom Components
    // ItemCodeDropdownComponent,
    // PacketTypeDropdownComponent
  ],
    providers: [DatePipe, DropdownStateService, ConfirmationService],
  templateUrl: './entry.component.html'
})
export class EntryComponent implements OnInit {
  sales: SaleModel[] = [];
  slaeDetails: SaleEntryDisplayModel[] = [];

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

}
