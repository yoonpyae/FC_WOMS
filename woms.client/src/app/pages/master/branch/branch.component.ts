import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BranchService } from '@core_services/master/branch.service';
import { LoggerService } from '@shared_services/logger.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, ToastModule, ButtonModule,
    InputTextModule, InputIconModule, IconFieldModule, TagModule, TableModule,
    ConfirmDialogModule, TextareaModule, ToggleSwitch
  ],
  providers: [ConfirmationService, DatePipe],
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.scss'
})
export class BranchComponent implements OnInit {

  branches: any[] = [];
  selectedBranch: any;
  items!: MenuItem[] | undefined;

  loading: boolean = false;
  isSubmitting: boolean = false;
  showForm: boolean = false;

  isEdit: boolean = false;
  currentBranchId: number = 0;

  private formBuilder = inject(FormBuilder);

  public branchForm: FormGroup = this.formBuilder.group({
    branchName: ['', Validators.required],
    contactPerson: ['', Validators.required],
    primaryPhone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]*$/)]],
    otherPhone: ['', [Validators.pattern(/^[0-9+\-\s()]*$/)]],
    email: ['', [Validators.required, Validators.email]],
    addressDetail: ['', Validators.required],
    townshipId: [1, Validators.required],
    stateId: [1, Validators.required],
    isDefault: [false],
    status: [true],
    remark: ['']
  });

  get f() { return this.branchForm.controls; }

  constructor(
    private branchService: BranchService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private loggerService: LoggerService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.branchService.get().subscribe({
      next: (res: any) => { this.branches = res.data || []; },
      error: (err) => {
        this.loggerService.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load branches.' });
      },
      complete: () => { this.loading = false; }
    });
  }

  create(): void {
    this.isEdit = false; // Fix: Ensure it doesn't stay in edit mode
    this.showForm = true;
    this.branchForm.reset({
      townshipId: 1,
      stateId: 1,
      isDefault: false,
      status: true
    });

    // Clear validation styling from previous interactions
    this.branchForm.markAsUntouched();
    this.branchForm.markAsPristine();
  }

  editBranch(branch: any): void {
    this.isEdit = true;
    this.showForm = true;
    this.currentBranchId = branch.branchId;

    this.branchForm.patchValue({
      branchName: branch.branchName,
      contactPerson: branch.contactPerson,
      primaryPhone: branch.primaryPhone,
      otherPhone: branch.otherPhone,
      email: branch.email,
      addressDetail: branch.addressDetail,
      townshipId: branch.townshipId || 1,
      stateId: branch.stateId || 1,
      isDefault: branch.isDefault,
      status: branch.status,
      remark: branch.remark
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.branchForm.reset();
  }

  saveBranch(): void {
    if (this.branchForm.invalid) {
      this.branchForm.markAllAsTouched(); // Trigger UI validation errors
      this.messageService.add({ severity: 'warn', summary: 'Validation Error', detail: 'Please check the form for errors.' });
      return;
    }

    this.isSubmitting = true;

    const payload = {
      ...this.branchForm.getRawValue(),
      branchId: this.isEdit ? this.currentBranchId : 0
    };

    const request$ = this.isEdit
      ? this.branchService.update(payload)
      : this.branchService.create(payload);

    request$.subscribe({
      next: () => {
        const msg = this.isEdit ? 'Branch updated successfully.' : 'Branch created successfully.';
        this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
        this.loadData();
        this.cancelForm();
      },
      error: (err: any) => {
        this.loggerService.error(err);
        this.isSubmitting = false;
        // Robust error parsing
        let errorMsg = 'Operation failed.';
        if (err.error.message.en) errorMsg = err.error.message.en;
        else if (err.message.en) errorMsg = err.message.en;
        else if (typeof err.error.message === 'string') errorMsg = err.error.message;
        else if (typeof err.error === 'string') errorMsg = err.error;

        this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMsg });
      },
      complete: () => this.isSubmitting = false
    });
  }
}