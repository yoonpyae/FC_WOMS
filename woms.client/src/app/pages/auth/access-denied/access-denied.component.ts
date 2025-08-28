import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-access-denied',
  imports: [RouterModule],
  templateUrl: './access-denied.component.html'
})
export class AccessDeniedComponent {
  constructor(private authService: AuthService,
    private router: Router) { }

  onLogout(): void {
    this.authService.logoutForce();
    this.router.navigate(['/auth/login']);
  }
}
