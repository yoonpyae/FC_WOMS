import { RouterLink } from "@angular/router";
import { last } from "rxjs";
const ADMIN: string[] = ['admin'];
const ADMIN_MANAGER: string[] = ['admin', 'manager'];
const ADMIN_MANAGER_CASHIER: string[] = ['admin', 'manager', 'cashier'];

export const NAVIGATION_MENU: Readonly<any[]> = [
  {
    label: 'Home',
    items: [
      {
        label: 'Dashboard',
        icon: 'pi pi-fw pi-chart-pie',
        routerLink: ['/dashboard'],
      },
      {
        label: 'Master',
        icon: 'pi pi-fw pi-database',
        items: [

          {
            label: 'Medical Checkup',
            items: [
              { label: 'Checkup-Company', routerLink: ['/master/checkup-company'] },
              { label: 'Checkup Types', routerLink: ['/master/checkup-types'] },
            ]
          },
          {
            label: 'Diagnostic Tests',
            items: [
              { label: 'ECG Test', routerLink: ['/master/ecg-tests'] },
              { label: 'Ultrasound Test', routerLink: ['/master/ultrasound-tests'] },
              { label: 'X-Ray Test', routerLink: ['/master/xray-tests'] },
              { label: 'Physiotherapy', routerLink: ['/master/physiotherapies'] },

            ]
          },
          {
            label: 'Laboratory & Test',
            items: [
              { label: 'Laboratory', routerLink: ['/master/laboratory'] },
              { label: 'Lab Accessory', routerLink: ['/master/accessories'] },
              { label: 'Lab Main Group', routerLink: ['/master/lab-main-groups'] },
              { label: 'Lab Sub Group', routerLink: ['/master/lab-sub-groups'] },
              { label: 'Lab Test', routerLink: ['/master/lab-test'] },
            ]
          },
          {
            label: 'OPD / OT / Ward',
            items: [
              { label: 'OPD Service', routerLink: ['/master/opd-services'] },
              { label: 'OT Service', routerLink: ['/master/ot-service'] },
              { label: 'Ward Service', routerLink: ['/master/ward-service'] },
            ]
          },
          { label: 'Cash Title', routerLink: ['/master/cash-title'] },
          { label: 'Supplier', routerLink: ['/master/supplier'] },
          { label: 'Doctor', routerLink: ['/master/doctor'] },
          { label: 'Room', routerLink: ['/master/room'] },
          { label: 'Admission Package', routerLink: ['/master/admission-package'] },
        ]
      },
      {
        label: 'Stock',
        icon: 'pi pi-fw pi-box',
        items: [
          { label: 'Packet Type', routerLink: ['/stock/packet-types'] },
          { label: 'Stock Item', routerLink: ['/stock/stock-items'] },
          { label: 'Purchase', routerLink: ['/stock/purchases'] },
          { label: 'Sale', routerLink: ['/stock/sales'] },
          { label: 'Main Stock', routerLink: ['/stock/main-stocks'] },
          { label: 'Pharmacy Stock', routerLink: ['/stock/pharmacy-stocks'] },
          { label: 'Stock Issue', routerLink: ['/stock/stock-issue'] },
          { label: 'Damage Voucher', routerLink: ['/stock/damage-vouchers'] }
        ]
      },
      {
        label: 'Lab Voucher',
        icon: 'pi pi-book',
        items: [
          { label: 'Create Voucher', routerLink: ['/lab-voucher/create-vouchers'] },
          { label: 'History', routerLink: ['/lab-voucher/histories'] }
        ]
      },

      {
        label: 'Pharmacy Voucher',
        icon: 'pi pi-book',
        items: [
          { label: 'Create Voucher', routerLink: ['/pharmacy-voucher/create-vouchers'] },
          { label: 'History', routerLink: ['/pharmacy-voucher/histories'] }
        ]
      },
      {
        label: 'OPD',
        icon: 'pi pi-users',
        items: [
          { label: 'OPD Registration', routerLink: ['/opd/opd-registrations'] },
          { label: 'OPD Booking', routerLink: ['/opd/opd-bookings'] },
          { label: 'OPD Voucher', routerLink: ['/opd/opd-vouchers'] },
          { label: 'OPD Doctor Attach', routerLink: ['/opd/opd-doctor-attach'] },
        ]
      },
    ],
  },
];
