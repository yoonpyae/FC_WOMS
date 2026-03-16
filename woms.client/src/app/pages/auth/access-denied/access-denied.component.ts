import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './access-denied.component.html'
})
export class AccessDeniedComponent {

  constructor(
    private authService: AuthService,
    private router: Router,
    private cookieService: CookieService
  ) { }

  goHome(): void {
    // Smart routing based on user role
    const role = this.cookieService.get('userrole')?.toLowerCase();

    if (role === 'doctor') {
      this.router.navigate(['/doctor-dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogout(): void {
    this.authService.logoutForce();
    this.router.navigate(['/auth/login']);
  }
}