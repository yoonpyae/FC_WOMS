import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

import { CommonModule } from '@angular/common';
import { PasswordModule } from 'primeng/password';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { LayoutService } from '../../../layout/service/layout.service';
import { AuthService } from '../../../core/services/auth.service';
import { RootModel } from '@core_models/root.model';
import { LoggerService } from '../../../shared/services/logger.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SharedService } from '../../../shared/services/shared.service';
import { DialogModule } from 'primeng/dialog';

import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    DialogModule,
    ToastModule
  ],
  providers: [
    AuthService, MessageService 
  ],
  templateUrl: './login.component.html',
  styles: [`
    :host ::ng-deep .pi-eye,
    :host ::ng-deep .pi-eye-slash {
      transform: scale(1.6);
      margin-right: 1rem;
      color: var(--primary-color) !important;
    }`]
})
export class LoginComponent implements OnInit {
  showForgotPasswordDialog: boolean = false;
  isRemberMeChecked: boolean = false;
  isLoading: boolean = false;
  username!: string;
  password!: string;

  constructor(
    public layoutService: LayoutService,
    private authService: AuthService,
    private sharedService: SharedService,
    private notificationService: NotificationService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private loggerService: LoggerService,
    private cookieService: CookieService,
    private router: Router,
    private messageService: MessageService) {
  }

  ngOnInit(): void {
  }

  login(): void {
    this.isLoading = true;

    this.authService.accessToken(this.username, this.password).subscribe(
      {
        next: (res: RootModel) => {
          this.setValueToSession(res);
         
          this.messageService.add({ 
            severity: 'success', 
            summary: 'Welcome Back', 
            detail: 'Login successful. Redirecting...' 
          });

          setTimeout(() => {
            this.isLoading = false;

          if (this.sharedService.getDefaultBranchId() != "") {

            const userRole = res.data.user.user_role;

            if (userRole === 'doctor') {
              this.router.navigate(['/doctor-dashboard']);
            }
            else if (userRole === 'pharmacist') {
              this.router.navigate(['/pharmacist-dashboard']);
            }
            else if (userRole === 'receptionist') {
              this.router.navigate(['/reception-dashboard']);
            }
            else {
              this.router.navigate(['/dashboard']);
            }

          }
       else {
              this.router.navigate(['setting']);
            }
          }, 1000);
        },
        error: (res) => { 
          this.isLoading = false; 
          // Show Error Toast
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Login Failed', 
            detail: 'Invalid username or password. Please try again.' 
          });
        }
      }
    );
  }

  setValueToSession(res: RootModel) {
    const token = res.data.access_token;
    const refreshToken = res.data.refresh_token;

    // Handle Token Storage based on Checkbox
    if (this.isRemberMeChecked) {
      window.localStorage.setItem('access_token', token);
      window.localStorage.setItem('refresh_token', refreshToken);
    } else {
      window.sessionStorage.setItem('access_token', token);
      window.sessionStorage.setItem('refresh_token', refreshToken);
      window.localStorage.removeItem('access_token');
      window.localStorage.removeItem('refresh_token');
    }

    const expiryDays = this.isRemberMeChecked ? 30 : undefined;

    this.cookieService.set('userId', res.data.user.id, expiryDays);
    this.cookieService.set('username', res.data.user.userName, expiryDays);
    this.cookieService.set('userrole', res.data.user.user_role, expiryDays);
    this.cookieService.set('authorized_status', 'authorized', expiryDays);

    if (res.data.user.doctorId) {
      this.cookieService.set('doctorId', res.data.user.doctorId.toString(), expiryDays);
      this.cookieService.set('doctorName', res.data.user.doctorName, expiryDays);
      if (res.data.user.branchId && res.data.user.branchId !== 0) {
        this.sharedService.setDefaultBranchId(res.data.user.branchId.toString());
      }
    }
  }

  openForgotPassword() {
    this.showForgotPasswordDialog = true;
  }
}