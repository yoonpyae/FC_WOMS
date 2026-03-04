import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, Scroll, UrlTree } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Observable } from 'rxjs';
import { LoggerService } from './logger.service';
import { SharedService } from './shared.service';
import {NAVIGATION_MENU} from '../../app.menu';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {
  constructor(
    private authService: AuthService,
    private sharedService: SharedService,
    private loggerSerivce: LoggerService,
    private messageService: MessageService,
    private router: Router) { }
  canActivate(next: ActivatedRouteSnapshot,
              state: RouterStateSnapshot):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['auth/login']);
      return false;
    }

    const allowed: string[] = next.data['roles'] || [];
    const userrole = this.sharedService.getUserRole() ?? '';
    if (allowed.length && !allowed.includes(userrole)) {
      this.router.navigate(['auth/access-denied']);
      this.messageService.add({
        key: 'globalMessage',
        severity: 'info',
        summary: 'Access denied',
        detail: 'You don\'t have permission.'
      });
      return false;
    }

    return true;
  }

  checkAuthorizedRoute(url: string): boolean {
    const userrole = this.sharedService.getUserRole() ?? '';
    let isValid = true;

    NAVIGATION_MENU.forEach((category) => {
      category.items.forEach((item: any) => {
        const checkItem = (menuItem: any) => {
          if (menuItem.routerLink && menuItem.routerLink[0] === url) {
            const allowed: string[] = (menuItem.data && menuItem.data.roles) || [];
            isValid = allowed.length ? allowed.includes(userrole) : true;
          }
        };

        if (item.items) {
          item.items.forEach((sub: any) => {
            if (sub.items) {
              sub.items.forEach(checkItem);
            } else {
              checkItem(sub);
            }
          });
        } else {
          checkItem(item);
        }
      });
    });

    return isValid;
  }
}
