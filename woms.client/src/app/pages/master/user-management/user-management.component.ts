import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '@core_services/master/user.service';
import { LoggerService } from '@shared_services/logger.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, ToastModule, ButtonModule,
    InputTextModule, PasswordModule, SelectModule, TagModule, TableModule, ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './user-management.component.html'
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  loading: boolean = false;
  isSubmitting: boolean = false;
  showForm: boolean = false;

  isEdit: boolean = false;
  currentUserId: string = '';

  roles = ['SuperAdmin', 'Receptionist', 'Pharmacist']; // Excludes Doctor (managed elsewhere)

  private formBuilder = inject(FormBuilder);

  public userForm: FormGroup = this.formBuilder.group({
    userName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['Receptionist', Validators.required]
  });

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private loggerService: LoggerService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.userService.get().subscribe({
      next: (res: any) => { this.users = res.data || []; },
      error: (err) => this.loggerService.error(err),
      complete: () => this.loading = false
    });
  }

  create(): void {
    this.isEdit = false;
    this.showForm = true;
    this.userForm.reset({ role: 'Receptionist' });

    // Ensure fields are enabled and required for creation
    this.userForm.get('userName')?.enable();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  // Add this new Edit Method
  editUser(user: any): void {
    this.isEdit = true;
    this.showForm = true;
    this.currentUserId = user.id;

    // Populate the form
    this.userForm.patchValue({
      userName: user.userName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      password: '' // Passwords aren't fetched or updated here
    });

    // Disable Username (shouldn't change login ID) and remove password requirement
    this.userForm.get('userName')?.disable();
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  cancelForm(): void {
    this.showForm = false;
    this.userForm.reset();
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Validation', detail: 'Please fill all required fields.' });
      return;
    }

    this.isSubmitting = true;

    // Use getRawValue() to include the disabled userName if needed, though the backend ignores it for updates
    const payload = this.userForm.getRawValue();

    const request$ = this.isEdit
      ? this.userService.update(this.currentUserId, payload)
      : this.userService.create(payload);

    request$.subscribe({
      next: (res: any) => {
        const msg = this.isEdit ? 'User updated successfully.' : 'User account created.';
        this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
        this.loadData();
        this.cancelForm();
      },
      error: (err) => {
        this.loggerService.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message?.en || 'Operation failed.' });
      },
      complete: () => this.isSubmitting = false
    });
  }

  deleteUser(user: any): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to revoke access for ${user.userName}?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.userService.delete(user.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'User access revoked.' });
            this.loadData();
          },
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete.' })
        });
      }
    });
  }
}