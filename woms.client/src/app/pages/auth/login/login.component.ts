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


@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule
  ],
  providers: [
    AuthService
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
    private router: Router) {
  }

  ngOnInit(): void {
  }

  login(): void {
    this.isLoading = true;

    this.authService.accessToken(this.username, this.password).subscribe(
      {
        next: (res: RootModel) => {
          this.setValueToSession(res);
          this.isLoading = false;

          if (this.sharedService.getDefaultBranchId() != "") {

            const userRole = res.data.user.user_role;

            if (userRole === 'doctor') {
              this.router.navigate(['/doctor-dashboard']);
            } else {
              this.router.navigate(['/dashboard']);
            }

          }
          else {
            this.router.navigate(['setting']);
          }

        },
        error: (res) => { this.isLoading = false; },
        complete: () => { this.isLoading = false; }
      }
    );
  }

  setValueToSession(res: RootModel) {
    window.localStorage.setItem('access_token', res.data.access_token);
    window.localStorage.setItem('refresh_token', res.data.refresh_token);
    this.cookieService.set('userId', res.data.user.id);
    this.cookieService.set('username', res.data.user.userName);
    this.cookieService.set('userrole', res.data.user.user_role);
    this.cookieService.set('authorized_status', 'authorized');

    if (res.data.user.doctorId) {
      this.cookieService.set('doctorId', res.data.user.doctorId.toString());
      this.cookieService.set('doctorName', res.data.user.doctorName);
    }
  }
}