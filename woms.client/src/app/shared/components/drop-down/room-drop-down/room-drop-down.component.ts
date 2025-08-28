import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { RoomModel } from '@core_models/master/room.model';
import { SharedService } from '@shared_services/shared.service';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { DropdownChangeEvent } from 'primeng/dropdown';
import { Subscription } from 'rxjs';
import { RoomService } from '@core_services/master/room.service';
import { TagModule } from "primeng/tag";

@Component({
  selector: 'app-room-drop-down',
  standalone: true,
  imports: [CommonModule, SelectModule, FormsModule, ButtonModule, DialogModule, TagModule],
  template: `
    <p-select [options]="rooms" [style]="{ width: '100%' }" [(ngModel)]="selectedValue"
              optionLabel="roomName" dataKey="roomId" placeholder="Select Room"
              [ngModelOptions]="{ standalone: true }" [loading]="loading" [filter]="true" filterBy="roomName"
              [showClear]="true" (onChange)="onChanges($event)" [disabled]="!isEnabled" appendTo="body">

      <ng-template #selectedItem let-selected>
        <div class="flex items-center gap-2" *ngIf="selected">
          <!-- <i class="pi pi-building-columns text-primary"></i> -->
          <div>{{ selected.roomName }}</div>
        </div>
      </ng-template>

      <ng-template let-room #item>
        <div class="flex gap-4 items-center">
          <!-- <div class="bg-gray-100 w-14 h-14 border rounded-xl flex justify-center items-center">
            <i class="pi pi-home text-2xl text-blue-600"></i>
          </div> -->
          <div class="flex flex-col gap-1">
            <div class="font-medium text-base">{{ room.roomName }}</div>
            <div class="text-sm text-gray-600 flex items-center gap-2">
  <p-tag
    [value]="room.fee + ' MMK'"
    icon="pi pi-wallet"
    [rounded]="true"
    class="text-xs"
  ></p-tag>
</div>

          <div class="text-sm text-gray-600 flex items-center gap-2">
  <p-tag
  [value]="room.available + ' Available'"
  [severity]="room.available > 0 ? 'success' : 'danger'"
  [icon]="room.available > 0 ? 'pi pi-check' : 'pi pi-times'"
  [rounded]="true"
  class="text-xs"
/>

</div>
          </div>
        </div>
      </ng-template>

      <ng-template #header>
        <div class="font-semibold p-3">Available Rooms</div>
      </ng-template>

      <ng-template #footer>
      </ng-template>
    </p-select>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RoomDropDownComponent),
      multi: true
    }
  ]
})
export class RoomDropDownComponent implements OnInit, OnDestroy {
 @Output() onValueChange = new EventEmitter<RoomModel | null>();
  @Input() isEnabled: boolean = true;

  rooms: RoomModel[] = [];
  selectedValue!: RoomModel;
  modalVisible: boolean = false;

  loading: boolean = false;
  subscription!: Subscription;

  constructor(
    private roomService: RoomService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.loadRooms();
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }

  private loadRooms(): void {
    const hospitalId = Number(this.sharedService.getDefaultHospitalId() ?? 0);
    this.loading = true;

    this.subscription = this.roomService.getActive(hospitalId).subscribe({
      next: (res) => {
        this.rooms = res.data as RoomModel[];
      },
      error: () => { },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onChange: any = () => { };
  onTouch: any = () => { };

  writeValue(obj: any): void {
    this.selectedValue = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  onChanges(event: DropdownChangeEvent): void {
    this.onChange(this.selectedValue);
    this.onTouch();
    this.onValueChange.emit(this.selectedValue);
  }

  refreshRooms(): void {
  this.selectedValue = undefined as any;
  this.onChange(null);
  this.onValueChange.emit(null);
  this.loadRooms();
}

}
