import { Component } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { StyleClassModule } from "primeng/styleclass";
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-modulemenu',
  imports: [
    RouterModule,
    ButtonModule,
    StyleClassModule,
  ],
  template: `
   <div class="layout-topbar-module-actions ml-4 relative">
      <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
        <i class="pi pi-ellipsis-v"></i>
      </button>
      <div class="layout-topbar-menu hidden lg:block left-4">
        <div class="flex lg:flex-row flex-col items-start justify-start gap-2 xl:p-0 px-2">
          <a [href]="masterDataModuleUrl" pButton rel="noopener noreferrer"
          class="p-ripple p-button p-component p-button-secondary p-button-text">
            <span class="pi pi-database"></span> Master Data
          </a>
          <a [href]="fleetModuleUrl" pButton rel="noopener noreferrer"
          class="p-ripple p-button p-component p-button-secondary p-button-text">
            <span class="pi pi-users"></span> Fleet
          </a>
          <a [href]="notificationModuleUrl" pButton rel="noopener noreferrer"
          class="p-ripple p-button p-component p-button-secondary p-button-text">
            <span class="pi pi-send"></span> Send Message
          </a>
          <a [href]="promotionModuleUrl" pButton rel="noopener noreferrer"
          class="p-ripple p-button p-component p-button-secondary p-button-text">
            <span class="pi pi-megaphone"></span> Promotion
          </a>
          <a [href]="reportModuleUrl" pButton rel="noopener noreferrer"
          class="p-ripple p-button p-component p-button-secondary p-button-text">
            <span class="pi pi-chart-line"></span> Reporting
          </a>
        </div>
      </div>
  </div>
  `,
  styles: [`
    .layout-topbar-module-actions {
      display: flex;
      gap: 2rem;
    }
  `],

})
export class AppModuleMenu {
  webUrl: string = environment.web_url;

  masterDataModuleUrl: string = `${this.webUrl}/v2/master/`;
  fleetModuleUrl: string = `${this.webUrl}/v2/fleet/`;
  promotionModuleUrl: string = `${this.webUrl}/v2/promotion/`;
  notificationModuleUrl: string = `${this.webUrl}/v2/notification/`;
  reportModuleUrl: string = `${this.webUrl}/v2/report/`;

};
