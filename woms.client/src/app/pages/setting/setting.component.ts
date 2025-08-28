import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClinicModel } from '@core_models/master/clinic.model';
import { ClinicService } from '@core_services/master/clinic.service';
import { SharedService } from '@shared_services/shared.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-setting',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    SelectModule,
    ButtonModule
  ],
  templateUrl: './setting.component.html',
})
export class SettingComponent implements OnInit {
  clinics: ClinicModel[] = [];
  selectedClinic!: ClinicModel;
  disabledClinic: boolean = false;

  constructor(
    private clinicService: ClinicService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.clinicService.get().subscribe({
      next: (res) => {
        this.clinics = res.data as ClinicModel[];
        let userRole = this.sharedService.getUserRole() ?? '';
        // if (userRole == 'Clinic') {
        //   this.disabledClinic = true;
        //   this.selectedClinic = this.Clinics[0];
        // }
      },
    });
  }

  onSubmit(): void {
    if (this.selectedClinic == null) {
      this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: "Warning", detail: "Please choose Clinic." });
    }
    else {
      this.sharedService.setDefaultClinicId(this.selectedClinic?.clinicId.toString());
      this.router.navigate(['/dashboard']);
    }
  }

}
