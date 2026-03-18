import { RouterLink } from "@angular/router";
import { UserRole } from "@core_models/user-role";
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
        data: { roles: [UserRole.SuperAdmin] }
      },
      {
        label: 'Dashboard',
        icon: 'pi pi-fw pi-chart-pie',
        routerLink: ['/doctor-dashboard'],
        data: { roles: [UserRole.Doctor] }
      },
    ],
  },
  {
    label: 'Outpatient Department',
    items: [
      {
        label: 'Doctor',
        icon: 'pi pi-fw pi-id-card',
        routerLink: ['/doctor'],
        data: { roles: [UserRole.SuperAdmin] }
      },
      {
        label: 'Patient',
        icon: 'pi pi-fw pi-user',
        routerLink: ['/patient'],
        data: { roles: [UserRole.Receptionist, UserRole.SuperAdmin, UserRole.Doctor] }
      },
      {
        label: 'Appointment',
        icon: 'pi pi-fw pi-calendar',
        routerLink: ['/appointment'],
        data: { roles: [UserRole.Receptionist, UserRole.SuperAdmin] }
      },
      {
        label: 'Consultation',
        icon: 'pi pi-fw pi-file-edit',
        routerLink: ['/consultation'],
        data: { roles: [UserRole.Doctor] }
      },
      {
        label: 'Service',
        icon: 'pi pi-fw pi-briefcase',
        data: { roles: [UserRole.SuperAdmin] },
        routerLink: ['/service']
      }
    ]
  },
  {
    label: 'Stock Management',
    items: [
      {
        label: 'Supplier',
        icon: 'pi pi-fw pi-truck',
        routerLink: ['/stock/supplier'],
        data: { roles: [UserRole.SuperAdmin] }
      },
      {
        label: 'Stock Operations',
        icon: 'pi pi-fw pi-box',
        data: { roles: [UserRole.Pharmacist, UserRole.SuperAdmin] },
        items: [
          { label: 'Packet Type', routerLink: ['/stock/packet-types'] },
          { label: 'Stock Item', routerLink: ['/stock/stock-items'] },
          { label: 'Main Stock', routerLink: ['/stock/main-stocks'] },
        ]
      }
    ]
  },
  {
    label: 'Vouchers & Billing',
    items: [
      {
        label: 'Purchase',
        icon: 'pi pi-fw pi-receipt',
        data: { roles: [UserRole.Pharmacist, UserRole.SuperAdmin] },
        routerLink: ['/purchase']
      },
      {
        label: 'Pharmacy Voucher',
        icon: 'pi pi-fw pi-receipt',
        data: { roles: [UserRole.Pharmacist, UserRole.SuperAdmin] },
        items: [
          { label: 'Create Voucher', routerLink: ['/pharmacy-voucher/create-voucher'] },
          { label: 'History', routerLink: ['/pharmacy-voucher/histories'] }
        ]
      },
      {
        label: 'OPD Voucher',
        icon: 'pi pi-fw pi-receipt',
        data: { roles: [UserRole.Receptionist, UserRole.SuperAdmin] },
        items: [
          { label: 'Create Voucher', routerLink: ['/opd-voucher/create-voucher'] },
          { label: 'History', routerLink: ['/opd-voucher/histories'] }
        ]
      }
    ]
  },
  {
    label: 'Reports',
    data: { roles: [UserRole.SuperAdmin] },
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
  },
  {
    label: 'Management',
    data: { roles: [UserRole.SuperAdmin] },
    items: [
      {
        label:'Branch',
        icon: 'pi pi-fw pi-building',
        RouterLink:['/management/branchs']
      }
    ]
  },
];
