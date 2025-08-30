import { Component, Inject } from '@angular/core';
import { ConfirmationService, ConfirmEventType, MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, DOCUMENT } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../service/layout.service';
import { AppConfigurator } from "./app.configurator";
import { LazyProgressBarComponent } from "../../shared/components/lazy-progress-bar/lazy-progress-bar.component";
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AuthService } from '../../core/services/auth.service';
import { SharedService } from '../../shared/services/shared.service';
import { BreadCrumbComponent } from "@shared_component/bread-crumb/bread-crumb.component";

export interface layoutConfig {
  preset?: string;
  primary?: string;
  surface?: string | undefined | null;
  darkTheme?: boolean;
  menuMode?: string;
}

@Component({
  selector: 'app-topbar',
  imports: [
    RouterModule,
    CommonModule,
    MenuModule,
    ButtonModule,
    StyleClassModule,
    AvatarModule,
    BadgeModule,
    ConfirmDialogModule,
    AppConfigurator,
    LazyProgressBarComponent,
    BreadCrumbComponent
  ],
  providers: [AuthService, ConfirmationService],
  template: `
    <div class="layout-topbar">
      <app-lazy-progress-bar></app-lazy-progress-bar>
      <div class="layout-topbar-logo-container flex justify-center">
        <a class="layout-topbar-logo flex justify-between items-center gap-4" routerLink="/dashboard">
          <img src="images/Family_Clinics_Logo_only.png" class="h-14 object-contain">
          <h4 class="text-lg font-bold"></h4>
        </a>
            <h5>FAMILY CLINIC</h5>
      </div>
      <div class="flex justify-between items-center">
        <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
          <i class="pi pi-bars"></i>
        </button>
        <app-bread-crumb></app-bread-crumb>
      </div>
      <div class="layout-topbar-actions">
        
        <div class="layout-config-menu">
          <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
            <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
          </button>
          <!-- <div class="">
					<button
						class="layout-topbar-action layout-topbar-action-highlight"
						pStyleClass="@next"
						enterFromClass="hidden"
						enterActiveClass="animate-scalein"
						leaveToClass="hidden"
						leaveActiveClass="animate-fadeout"
						[hideOnOutsideClick]="true">
						<i class="pi pi-palette"></i>
					</button>
				</div> -->
          <app-configurator/>
        </div>

        <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden"
                enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout"
                [hideOnOutsideClick]="true">
          <i class="pi pi-ellipsis-v"></i>
        </button>

        <div class="layout-topbar-menu hidden lg:block">
          <div class="layout-topbar-menu-content">
            <button type="button" class="layout-topbar-action">
              <i class="pi pi-search"></i>
              <span>Search</span>
            </button>
            <button type="button" class="layout-topbar-action" (click)="menu.toggle($event)">
              <i class="pi pi-user"></i>
              <span>Profile</span>
            </button>
            <p-menu #menu [model]="items" [popup]="true">
              <ng-template pTemplate="start">
                <button pRipple
                        class="relative overflow-hidden w-full min-w-56 flex align-items-center text-color text-start hover:surface-200 border-noround">
                  <div
                      class="bg-slate-100 m-2 px-4 py-2 w-full flex flex-col rounded shadow-inner border border-slate-200">
                    <div class="flex justify-between items-center">
                      <span class="font-bold text-sm text-gray-500">Name</span>
                      <span class="font-bold text-base">{{ fullName }}</span>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="font-bold text-sm text-gray-500">Role</span>
                      <span class="font-bold text-base">{{ roleName }}</span>
                    </div>
                  </div>
                </button>
              </ng-template>
              <ng-template pTemplate="item" let-item>
                <a pRipple class="flex items-center px-4 py-2" [routerLink]="item.routerLink"
                   (click)="menuClick(item.label)">
                  <span [class]="item.icon"></span>
                  <span class="ml-2">{{ item.label }}</span>
                  <p-badge *ngIf="item.badge" class="ml-auto" [value]="item.badge"/>
                  <span *ngIf="item.shortcut"
                        class="ml-auto border-1 surface-border border-round surface-100 text-xs p-1">{{ item.shortcut }}</span>
                </a>
              </ng-template>
            </p-menu>
          </div>
        </div>

        <p-confirmdialog #cd key="logoutDialog">
          <ng-template #headless let-message let-onAccept="onAccept" let-onReject="onReject">
            <div class="flex flex-col items-center p-8 bg-surface-0 dark:bg-surface-900 rounded">
              <div
                  class="rounded-full bg-amber-500 text-primary-contrast inline-flex justify-center items-center h-24 w-24 -mt-20">
                <i class="pi pi-question !text-5xl"></i>
              </div>
              <span class="font-bold text-2xl block mb-2 mt-6">{{ message.header }}</span>
              <p class="mb-0">{{ message.message }}</p>
              <div class="flex items-center gap-2 mt-6">
                <p-button label="Logout" severity="danger" (onClick)="onAccept()" styleClass="w-32"></p-button>
                <p-button label="Cancel" [outlined]="true" (onClick)="onReject()" styleClass="w-32"></p-button>
              </div>
            </div>
          </ng-template>
        </p-confirmdialog>
      </div>
    </div>`
})
export class AppTopbar {

  _config: layoutConfig = {
    preset: 'Aura',
    primary: 'blue',
    surface: null,
    darkTheme: false,
    menuMode: 'static'
  };

  items!: MenuItem[];

  //#region User Info

  fullName!: string;
  roleName!: string;

  //#endregion

  constructor(
    public layoutService: LayoutService,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private sharedService: SharedService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    this.loadThemeFromCookie(); // Load theme on component initialization

    this.fullName = this.sharedService.getUserName() ?? "";
    this.roleName = this.sharedService.getUserRole() ?? "";

    this.items = [
      {
        label: 'Options',
        items: [
          {
            label: 'Setting',
            icon: 'pi pi-cog',
            routerLink: ['./setting']
          },
          {
            label: 'Logout',
            icon: 'pi pi-power-off',
          }
        ]
      }
    ];
  }

  applyTheme() {
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
  }

  toggleDarkMode() {
    this.saveThemeToCookie(); // Save the theme preference
    this.applyTheme();
  }

  private saveThemeToCookie() {
    document.cookie = `darkTheme=${!this.layoutService._config.darkTheme}; expires=${this.getCookieExpiryDate()}; path=/`;
  }

  private loadThemeFromCookie() {

    const cookieValue = this.getCookieValue('darkTheme');
    if (cookieValue) {
      this._config.darkTheme = cookieValue === 'true' ? true : false; // Parse the boolean from the string
      this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: cookieValue === 'true' ? true : false }));
      //
    } else {
      // Check for system preference if no cookie is set
      this.checkSystemPreference();
    }

  }

  private checkSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this._config.darkTheme = true;
      this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: true }));
    }
  }

  private getCookieValue(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  private getCookieExpiryDate(days: number = 365): string { // Set cookie to expire in 365 days
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    return date.toUTCString();
  }

  public menuClick(label: string): void {
    if (label === 'Logout') {
      this.onLogout();
    }
  }

  private onLogout(): void {
    this.confirmationService.confirm({
      message: 'Do you want to logout?',
      header: 'Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.authService.logoutForce();
        this.router.navigate(['./auth/login']);
      },
      reject: (type: ConfirmEventType) => {
        switch (type) {
          case ConfirmEventType.REJECT:
            // NO CODE
            break;
          case ConfirmEventType.CANCEL:
            // NO CODE
            break;
        }
      },
      key: 'logoutDialog'
    });
  }
}
