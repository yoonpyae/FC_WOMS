import { RouterLink } from "@angular/router";
import { last } from "rxjs";
import { rootCertificates } from "tls";
const ADMIN: string[] = ['admin'];
const ADMIN_MANAGER: string[] = ['admin', 'manager'];
const ADMIN_MANAGER_CASHIER: string[] = ['admin', 'manager', 'cashier'];

export const NAVIGATION_MENU: Readonly<any[]> = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        icon: 'pi pi-fw pi-chart-pie',
        routerLink: ['/dashboard'],
      }
    ],
  },
  {
    label: 'Outpatient Department',
    items: [
      {
        label: 'Doctor',
        icon: 'pi pi-fw pi-id-card',
        routerLink: ['/doctor']
      },
      {
        label: 'Patient',
        icon: 'pi pi-fw pi-user',
        routerLink: ['/patient']
      },
      {
        label: 'Appointment',
        icon: 'pi pi-fw pi-calendar',
        routerLink: ['/appointment']
      },
      {
        label: 'Service',
        icon: 'pi pi-fw pi-briefcase',
        items: [
          { label: 'OPD Service', routerLink: ['/opd/opd-service'] },
          { label: 'OPD Doctor Attach', routerLink: ['/opd/opd-doctor-attach'] },
        ]
      }
    ]
  },
  {
    label: 'Stock Management',
    items: [
      {
        label: 'Supplier',
        icon: 'pi pi-fw pi-truck',
        routerLink: ['/stock/supplier']
      },
      {
        label: 'Stock Operations',
        icon: 'pi pi-fw pi-box',
        items: [
          { label: 'Packet Type', routerLink: ['/stock/packet-types'] },
          { label: 'Stock Item', routerLink: ['/stock/stock-items'] },
          { label: 'Purchase', routerLink: ['/stock/purchases'] },
          { label: 'Main Stock', routerLink: ['/stock/main-stocks'] },
        ]
      }
    ]
  },
  {
    label: 'Vouchers & Billing',
    items: [
      {
        label: 'Lab Voucher',
        icon: 'pi pi-fw pi-receipt',
        items: [
          { label: 'Create Voucher', routerLink: ['/lab-voucher/create-vouchers'] },
          { label: 'History', routerLink: ['/lab-voucher/histories'] }
        ]
      },
      {
        label: 'Pharmacy Voucher',
        icon: 'pi pi-fw pi-receipt',
        items: [
          { label: 'Create Voucher', routerLink: ['/pharmacy-voucher/create-vouchers'] },
          { label: 'History', routerLink: ['/pharmacy-voucher/histories'] }
        ]
      },
      {
        label: 'OPD Voucher',
        icon: 'pi pi-fw pi-receipt',
        items: [
          { label: 'Create Voucher', routerLink: ['/opd-voucher/create-vouchers'] },
          { label: 'History', routerLink: ['/opd-voucher/histories'] }
        ]
      }
    ]
  },
  {
    label: 'Reports',
    items: [
      {
        label: 'Appointment Reports',
        icon: 'pi pi-fw pi-chart-bar',
        routerLink: ['/reports/appointment-reports']
      },
      {
        label: 'Stock Reports',
        icon: 'pi pi-fw pi-chart-line',
        routerLink: ['/reports/stock-reports']
      },
      {
        label: 'Voucher Reports',
        icon: 'pi pi-fw pi-file-excel',
        routerLink: ['/reports/voucher-reports']
      }
    ]
  }
];
