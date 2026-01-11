import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ViPatientModel } from '@core_models/master/patient.model';
import { PatientService } from '@core_services/master/patient.service';
import { ExportService } from '@shared_services/export.service';
import { LoggerService } from '@shared_services/logger.service';
import { SharedService } from '@shared_services/shared.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Menu } from 'primeng/menu';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { EntryComponent } from './entry/entry.component';
import { DoctorModel } from '@core_models/master/doctor.model';

@Component({
  selector: 'app-patient',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    // primeNg
    ToastModule,
    ButtonModule,
    SplitButtonModule,
    ToggleSwitchModule,
    FileUploadModule,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    TagModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    EntryComponent
  ],
  standalone: true,
  providers: [ConfirmationService, ExportService, DatePipe],
  templateUrl: './patient.component.html'
})
export class PatientComponent implements OnInit {
  patients: ViPatientModel[] = [];
  selectedPatient!: ViPatientModel;

  items!: MenuItem[] | undefined;
  loading: boolean = false;
  isSubmitting: boolean = false;
  isEdit: boolean = false;
  modalVisible: boolean = false;
  today: Date = new Date();
  @ViewChild(EntryComponent) patientEntryComponent!: EntryComponent;

  constructor(
    private exportService: ExportService,
    private patientService: PatientService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private loggerService: LoggerService,
    private sharedService: SharedService,
  ) {
    this.items = [
      {
        label: 'Edit',
        icon: 'pi pi-pen-to-square',
        command: () => this.update(),
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.delete(),
      },
      {
        label: 'Excel',
        icon: 'pi pi-file-excel',
        command: () => this.excel(),
      },
    ];
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    let branchId: number = Number.parseInt((this.sharedService.getDefaultBranchId() ?? "0"));
    this.loading = true;
    this.patientService.get(branchId).subscribe({
      next: (res) => {
        this.patients = res.data as ViPatientModel[];
        this.loading = false;
        this.loggerService.info(this.patients);
      },
      error: () => { },
      complete: () => {
        this.loading = false;
      },
    });
  }

  create(): void {
    this.isEdit = false;
    this.selectedPatient = null as any;
    this.modalVisible = true;

    setTimeout(() => {
      if (this.patientEntryComponent) {
        this.patientEntryComponent.resetForm();
      }
    });
  }

  update(): void {
    if (!this.selectedPatient) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a record to update.',
      });
      return;
    }

    this.isEdit = true;
    this.modalVisible = true;

    let dob = this.selectedPatient.dob
      ? new Date(this.selectedPatient.dob).toISOString().split('T')[0]
      : '';

    if (this.patientEntryComponent) {
      this.patientEntryComponent.isEdit = true;
      this.patientEntryComponent.patientForm.patchValue({
        ...this.selectedPatient,
        dob,
      });

      this.patientEntryComponent.selectedDoctor = this.selectedPatient.doctorId
        ? { doctorId: this.selectedPatient.doctorId, name: this.selectedPatient.patientName } as DoctorModel
        : null;

      this.patientEntryComponent.getStates();
      this.patientEntryComponent.getDoctors();
    }
  }

  delete(): void {
    if (this.selectedPatient != null) {
      this.confirmationService.confirm({
        message: 'Are You Sure Want To Delete?',
        header: 'Delete Confirmation',
        icon: 'pi pi-info-circle',
        accept: () => {
          this.patientService.delete(this.selectedPatient.patientId).subscribe({
            next: (res) => {
              this.messageService.add({
                key: 'globalMessage',
                severity: 'success',
                summary: 'Confirmed',
                detail: res.message.en,
              });
              this.loadData();
              this.selectedPatient = null as any;
            },
            error: (err) => {
      
              this.loading = false;
            },
            complete: () => {
              this.loading = false;
            },
          });
        },
        reject: () => {
          this.selectedPatient = null as any;
        },
        key: 'patientDeleteDialog',
      });
    } else {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please choose patient.',
      });
    }
  }

  clearSelection(): void {
    this.selectedPatient = null as any;
    this.isEdit = false;
    if (this.patientEntryComponent) {
      this.patientEntryComponent.patientForm.reset();
      this.patientEntryComponent.SelectedState = null;
      this.patientEntryComponent.SelectedTownship = null;
    }
  }

  handlePatientSubmitted(success: string | boolean) {
    if (success) {
      this.modalVisible = false;
      this.loadData();
    }
  }

    excel(): void {
    let exportData = this.selectedPatient ? [this.selectedPatient] : this.patients;

    if (exportData.length === 0) {
      this.messageService.add({
        key: 'globalMessage',
        severity: 'warn',
        summary: 'Warning',
        detail: 'No data available to export!',
      });
      return;
    }

    // Define the columns to be exported
    let columns = [
      { key: 'patientId', value: 'Patient ID' },
      { key: 'name', value: 'Name' },
      { key: 'nrc', value: 'NRC' },
      { key: 'dob', value: 'Date of Birth' },
      { key: 'age', value: 'Age' },
      { key: 'stateId', value: 'State ID' },
      { key: 'Township ID', value: 'Township ID' },
      { key: 'addressDetail', value: 'Address Detail' },
      { key: 'phone', value: 'Phone Number' },
      { key: 'doctorId', value: 'Doctor ID' },
      { key: 'createdOn', value: 'Created On' },
      { key: 'createdBy', value: 'Created By' },
      { key: 'updatedOn', value: 'Updated On' },
      { key: 'updatedBy', value: 'Updated By' },
      { key: 'status', value: 'Status' },
      { key: 'remark', value: 'Remark' },
    ];

    // Use exportSelectColsWithDynamicHeader for exporting data
    this.exportService.exportSelectColsWithDynamicHeader(exportData, columns, 'Patient');
  }
}
