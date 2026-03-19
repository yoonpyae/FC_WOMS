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
    <div class="layout-topbar bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-200 dark:border-surface-700 shadow-sm transition-colors duration-200 h-[4rem] px-4 flex items-center justify-between sticky top-0 z-50 w-full relative">
      <app-lazy-progress-bar></app-lazy-progress-bar>
      
      <div class="flex items-center flex-1 gap-4">
        <button class="layout-menu-button p-link w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors shrink-0" (click)="layoutService.onMenuToggle()">
          <i class="pi pi-bars text-xl text-surface-700 dark:text-surface-100"></i>
        </button>
        
        <a class="flex items-center gap-3 shrink-0" routerLink="/dashboard">
          <img src="images/Family_Clinics_Logo_only.png" class="h-8 md:h-10 object-contain drop-shadow-sm">
          <span class="text-lg md:text-xl font-bold tracking-tight text-surface-900 dark:text-surface-0 hidden sm:block">FAMILY CLINIC</span>
        </a>

        <div class="hidden lg:flex items-center ml-4">
          <app-bread-crumb></app-bread-crumb>
        </div>
      </div>

      <div class="flex items-center gap-1 md:gap-2 shrink-0">
        
        <button type="button" class="p-link w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" (click)="toggleDarkMode()">
          <i [ngClass]="{ 'pi text-xl text-surface-700 dark:text-surface-100': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
        </button>
        
        <app-configurator></app-configurator>

        <button class="p-link w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" (click)="menu.toggle($event)">
          <i class="pi pi-user text-xl text-surface-700 dark:text-surface-100"></i>
        </button>

        <p-menu #menu [model]="items" [popup]="true" styleClass="w-64 mt-2 rounded-xl border border-surface-200 dark:border-surface-700 shadow-lg">
          <ng-template pTemplate="start">
            <div class="p-4 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50 rounded-t-xl flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                {{ fullName.charAt(0) | uppercase }}
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-surface-900 dark:text-surface-0">{{ fullName }}</span>
                <span class="text-xs text-surface-500 dark:text-surface-400 capitalize">{{ roleName }}</span>
              </div>
            </div>
          </ng-template>
          <ng-template pTemplate="item" let-item>
            <a pRipple class="flex items-center px-4 py-3 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors cursor-pointer text-surface-700 dark:text-surface-100" [routerLink]="item.routerLink" (click)="menuClick(item.label)">
              <span [class]="item.icon" class="text-lg"></span>
              <span class="ml-3 font-medium">{{ item.label }}</span>
            </a>
          </ng-template>
        </p-menu>
      </div>

      <p-confirmdialog #cd key="logoutDialog">
        <ng-template #headless let-message let-onAccept="onAccept" let-onReject="onReject">
          <div class="flex flex-col items-center p-8 bg-surface-0 dark:bg-surface-900 rounded-2xl shadow-xl">
            <div class="rounded-full bg-red-500/10 text-red-500 inline-flex justify-center items-center h-20 w-20 mb-4">
              <i class="pi pi-power-off text-4xl"></i>
            </div>
            <span class="font-bold text-2xl block mb-2 text-surface-900 dark:text-surface-0">{{ message.header }}</span>
            <p class="mb-6 text-surface-500 dark:text-surface-400 text-center">{{ message.message }}</p>
            
            <div class="flex items-center justify-center gap-4 w-full mt-2">
              <p-button label="Cancel" [outlined]="true" severity="secondary" (onClick)="onReject()" styleClass="w-32 rounded-lg"></p-button>
              <p-button label="Logout" severity="danger" (onClick)="onAccept()" styleClass="w-32 rounded-lg"></p-button>
            </div>
          </div>
        </ng-template>
      </p-confirmdialog>
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
    this.loadThemeFromCookie(); 

    this.fullName = this.sharedService.getUserName() ?? "";
    this.roleName = this.sharedService.getUserRole() ?? "";

    this.items = [
      {
        label: 'Setting',
        icon: 'pi pi-cog',
        routerLink: ['/setting'] 
      },
      {
        label: 'Logout',
        icon: 'pi pi-power-off',
      }
    ];
  }

  applyTheme() {
    this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
  }

  toggleDarkMode() {
    this.saveThemeToCookie(); 
    this.applyTheme();
  }

  private saveThemeToCookie() {
    document.cookie = `darkTheme=${!this.layoutService._config.darkTheme}; expires=${this.getCookieExpiryDate()}; path=/`;
  }

  private loadThemeFromCookie() {
    const cookieValue = this.getCookieValue('darkTheme');
    if (cookieValue) {
      this._config.darkTheme = cookieValue === 'true' ? true : false; 
      this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: cookieValue === 'true' ? true : false }));
    } else {
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

  private getCookieExpiryDate(days: number = 365): string { 
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
      message: 'Are you sure you want to log out of your session?',
      header: 'Confirm Logout',
      icon: 'pi pi-info-circle',
      accept: () => {
        this.authService.logoutForce();
        this.router.navigate(['./auth/login']);
      },
      reject: (type: ConfirmEventType) => {},
      key: 'logoutDialog'
    });
  }
}