import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BranchService } from '@core_services/master/branch.service'; // Adjust path if needed
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
import { SplitButton } from 'primeng/splitbutton';
import { ToggleSwitch } from 'primeng/toggleswitch';

@Component({
  selector: 'app-branch',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    ButtonModule,
    SplitButton,
    InputTextModule,
    InputIconModule,
    IconFieldModule,
    TagModule,
    TableModule,
    ConfirmDialogModule,
    TextareaModule,
    ToggleSwitch
  ],
  providers: [ConfirmationService, DatePipe],
  templateUrl: './branch.component.html',
  styleUrl: './branch.component.scss' // Optional
})
export class BranchComponent implements OnInit {
  
  branches: any[] = [];
  selectedBranch: any;
  items!: MenuItem[] | undefined;
  
  loading: boolean = false;
  isSubmitting: boolean = false;
  showForm: boolean = false;

  private formBuilder = inject(FormBuilder);
  
  public branchForm: FormGroup = this.formBuilder.group({
    branchName: ['', Validators.required],
    contactPerson: ['', Validators.required],
    primaryPhone: ['', Validators.required],
    otherPhone: [''],
    email: ['', [Validators.required, Validators.email]],
    addressDetail: ['', Validators.required],
    townshipId: [1, Validators.required], // Set default or use dropdown later
    stateId: [1, Validators.required],    // Set default or use dropdown later
    isDefault: [false],
    status: [true],
    remark: ['']
  });

  constructor(
    private branchService: BranchService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private loggerService: LoggerService
  ) {
    // Only View and Delete for now since the API only supports Create/Get/Delete
    this.items = [
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.delete() }
    ];
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.branchService.get().subscribe({
      next: (res: any) => {
        this.branches = res.data || [];
      },
      error: (err) => {
        this.loggerService.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load branches.' });
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  create(): void {
    this.showForm = true;
    this.branchForm.reset({
      townshipId: 1,
      stateId: 1,
      isDefault: false,
      status: true
    });
  }

  cancelForm(): void {
    this.showForm = false;
    this.branchForm.reset();
  }

  saveBranch(): void {
    if (this.branchForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill all required fields correctly.' });
      return;
    }

    this.isSubmitting = true;
    const payload = this.branchForm.getRawValue();

    this.branchService.create(payload).subscribe({
      next: (res: any) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Branch created successfully.' });
        this.loadData();
        this.cancelForm();
      },
      error: (err: any) => {
        this.loggerService.error("Error creating branch");
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create branch.' });
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  delete(): void {
    if (!this.selectedBranch) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a branch to delete.' });
      return;
    }

    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${this.selectedBranch.branchName}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        // Implement delete call here when you add it to the Branch Controller
        this.messageService.add({ severity: 'info', summary: 'Notice', detail: 'Delete API not yet implemented.' });
      }
    });
  }
}