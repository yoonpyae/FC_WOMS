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

  roles = ['SuperAdmin', 'Receptionist', 'Pharmacist'];

  private formBuilder = inject(FormBuilder);

  public userForm: FormGroup = this.formBuilder.group({
    userName: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9_]+$/)]], // Prevent spaces/special chars in username
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.pattern(/^[0-9+\-\s()]*$/)]], // Basic phone validation
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['Receptionist', Validators.required]
  });

  // Helper for easy access to form fields in HTML
  get f() { return this.userForm.controls; }

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
      error: (err) => {
        this.loggerService.error(err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load users.' });
      },
      complete: () => this.loading = false
    });
  }

  create(): void {
    this.isEdit = false;
    this.showForm = true;

    // Completely reset the form state
    this.userForm.reset({ role: 'Receptionist' });
    this.userForm.get('userName')?.enable();
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();

    // Mark as pristine so validation errors don't show immediately
    this.userForm.markAsPristine();
    this.userForm.markAsUntouched();
  }

  editUser(user: any): void {
    this.isEdit = true;
    this.showForm = true;
    this.currentUserId = user.id;

    this.userForm.patchValue({
      userName: user.userName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      password: ''
    });

    this.userForm.get('userName')?.disable();
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  cancelForm(): void {
    this.showForm = false;
    this.userForm.reset();
  }

  saveUser(): void {
    // Mark all as touched to trigger UI validation messages
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Validation', detail: 'Please check the form for errors.' });
      return;
    }

    this.isSubmitting = true;
    const payload = this.userForm.getRawValue();

    const request$ = this.isEdit
      ? this.userService.update(this.currentUserId, payload)
      : this.userService.create(payload);

    request$.subscribe({
      next: () => {
        const msg = this.isEdit ? 'User updated successfully.' : 'User account created.';
        this.messageService.add({ severity: 'success', summary: 'Success', detail: msg });
        this.loadData();
        this.cancelForm();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.loggerService.error(err);

        let errorMsg = 'Operation failed.';

        if (err.error.message.en) {
          errorMsg = err.error.message.en;
        }
        else if (err.message.en) {
          errorMsg = err.message.en;
        }
        else if (typeof err.error.message === 'string') {
          errorMsg = err.error.message;
        }
        else if (typeof err.error === 'string') {
          errorMsg = err.error;
        }

        this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMsg });
        this.isSubmitting = false;
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
          error: (err) => {
            let errorMsg = err.error.message.en || 'Failed to delete user.';
            this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMsg });
          }
        });
      }
    });
  }
}