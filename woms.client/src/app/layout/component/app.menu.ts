import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { NAVIGATION_MENU } from '../../app.menu';
import { SharedService } from '../../shared/services/shared.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {

  model: MenuItem[] = [];
  menus: any[] = [];
  private currentRole: string | null = null;

  constructor(private sharedService: SharedService, private router: Router) { }

  ngOnInit() {
    // initialize role and build the menu accordingly
    this.currentRole = this.sharedService.getUserRole();
    this.buildMenu();

    // refresh menu when the user role changes (login/logout)
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      const newRole = this.sharedService.getUserRole();
      if (newRole !== this.currentRole) {
        this.currentRole = newRole;
        this.buildMenu();
      }
    });
  }

  private buildMenu(): void {
    if (!this.currentRole) {
      // no user, clear menu entirely
      this.menus = [];
      this.model = [];
      return;
    }

    this.cloneMenu();
    this.menus = this.filterByRole(this.menus, this.currentRole);
    this.model = this.menus;
  }

  private cloneMenu(): void {
    this.menus = JSON.parse(JSON.stringify(NAVIGATION_MENU));
  }

  /**
   * Recursively filter the navigation structure by the supplied role.
   * Items without a `data.roles` property are treated as public.
   */
  private filterByRole(items: any[], role: string): any[] {
    return items
      .map((cat) => ({ ...cat }))
      .filter((cat) => {
        // 1. STRICT CHECK: Does the top-level category restrict access?
        const allowed: string[] = (cat.data && cat.data.roles) || [];
        if (allowed.length && !allowed.includes(role)) {
          return false; // Hide entire category
        }
        return true;
      })
      .map((cat) => {
        if (cat.items) {
          cat.items = this.filterItems(cat.items, role);
        }
        return cat;
      })
      // Hide category if all its items were filtered out
      .filter((cat) => cat.items && cat.items.length > 0);
  }

  private filterItems(items: any[], role: string): any[] {
    return items
      .map((item) => ({ ...item }))
      .filter((item) => {
        // 2. STRICT CHECK: Does this specific menu item restrict access?
        const allowed: string[] = (item.data && item.data.roles) || [];
        if (allowed.length && !allowed.includes(role)) {
          return false; // Hide this item and skip its children
        }
        return true;
      })
      .map((item) => {
        // 3. Process children
        if (item.items) {
          item.items = this.filterItems(item.items, role);
        }
        return item;
      })
      .filter((item) => {
        // 4. If an item is just a dropdown wrapper (no routerLink) 
        // and all its children were filtered out, hide the wrapper too.
        if (item.items && item.items.length === 0 && !item.routerLink) {
          return false;
        }
        return true;
      });
  }
}
