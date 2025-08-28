import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ClinicModel } from '@core_models/master/clinic.model';
import { HospitalService } from '@core_services/master/hospital.service';
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
    private hospitalService: HospitalService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.hospitalService.get().subscribe({
      next: (res) => {
        this.clinics = res.data as ClinicModel[];
        let userRole = this.sharedService.getUserRole() ?? '';
        // if (userRole == 'hospital') {
        //   this.disabledHospital = true;
        //   this.selectedHospital = this.hospitals[0];
        // }
      },
    });
  }

  onSubmit(): void {
    if (this.selectedClinic == null) {
      this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: "Warning", detail: "Please choose Hospital." });
    }
    else {
      this.sharedService.setDefaultHospitalId(this.selectedClinic?.clinicId.toString());
      this.router.navigate(['/dashboard']);
    }
  }

}
