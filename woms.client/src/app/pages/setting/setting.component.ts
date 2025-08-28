import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BranchModel } from '@core_models/master/branch.model';
import { BranchService } from '@core_services/master/branch.service';
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
  branchs: BranchModel[] = [];
  selectedbranch!: BranchModel;
  disabledbranch: boolean = false;

  constructor(
    private branchService: BranchService,
    private sharedService: SharedService,
    private messageService: MessageService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.branchService.get().subscribe({
      next: (res) => {
        this.branchs = res.data as BranchModel[];
        let userRole = this.sharedService.getUserRole() ?? '';
        // if (userRole == 'branch') {
        //   this.disabledbranch = true;
        //   this.selectedbranch = this.branchs[0];
        // }
      },
    });
  }

  onSubmit(): void {
    if (this.selectedbranch == null) {
      this.messageService.add({ key: 'globalMessage', severity: 'warn', summary: "Warning", detail: "Please choose branch." });
    }
    else {
      this.sharedService.setDefaultBranchId(this.selectedbranch?.branchId.toString());
      this.router.navigate(['/dashboard']);
    }
  }

}
