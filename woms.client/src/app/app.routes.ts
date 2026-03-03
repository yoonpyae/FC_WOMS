import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { AuthGuardService } from '@shared_services/auth-guard.service';

// Auth & Core Pages
import { HomeComponent } from './pages/home/home.component';
import { SettingComponent } from './pages/setting/setting.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { ErrorComponent } from './pages/auth/error/error.component';
import { AccessDeniedComponent } from './pages/auth/access-denied/access-denied.component';

// Outpatient Department
import { DoctorComponent } from './pages/master/doctor/doctor.component';
import { DetailComponent as DoctorDetailComponent } from './pages/master/doctor/detail/detail.component';
import { PatientComponent } from './pages/master/patient/patient.component';
import { AppointmentComponent } from './pages/master/appointment/appointment.component';
// import { OpdServiceComponent } from './pages/master/opd-service/opd-service.component';
// import { OpdDoctorAttachComponent } from './pages/opd/opd-doctor-attach/opd-doctor-attach.component';

// Stock Management
import { SupplierComponent } from './pages/master/supplier/supplier.component';
import { StockItemComponent } from './pages/stock/stock-item/stock-item.component';
import { PacketTypeComponent } from "./pages/stock/packet-type/packet-type.component";
import { MainStockComponent } from './pages/stock/main-stock/main-stock.component';
import { PurchaseComponent } from './pages/stock/purchase/purchase.component';

// Vouchers & Billing
// import { CreateVoucherComponent as LabCreateVoucherComponent } from './pages/lab-voucher/create-voucher/create-voucher.component';
// import { HistoryComponent as LabHistoryComponent } from './pages/lab-voucher/history/history.component';
import { PharmacyCreateVoucherComponent } from './pages/pharmacy-voucher/create-voucher/create-voucher.component';
import { PharmacyVoHistoryComponent } from './pages/pharmacy-voucher/history/history.component';
import { ConsultationComponent } from './pages/master/consultation/consultation.component';

export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'setting', component: SettingComponent, data: { title: 'Setting' } },
	{
		path: 'auth',
		children: [
			{ path: 'error', component: ErrorComponent, data: { title: 'Error' } },
			{ path: 'access-denied', component: AccessDeniedComponent, data: { title: 'Access-Denied' } },
			{ path: 'login', component: LoginComponent, data: { title: 'Login' } },
			{ path: '**', redirectTo: '/notfound', data: { title: 'Not Found' } },
		],
	},
	{
		path: '',
		component: AppLayout,
		children: [
			{
				path: 'dashboard',
				component: DashboardComponent,
				canActivate: [AuthGuardService],
				data: { title: 'Dashboard' },
			},

			// --- OUTPATIENT DEPARTMENT ---
			{
				path: 'doctor',
				canActivate: [AuthGuardService],
				data: { title: 'Doctor' },
				children: [
					{ path: '', component: DoctorComponent },
					{ path: 'detail', component: DoctorDetailComponent },
					{ path: 'detail/:id', component: DoctorDetailComponent },
				]
			},
			{
				path: 'patient',
				component: PatientComponent,
				canActivate: [AuthGuardService],
				data: { title: 'Patient' },
			},
			{
				path: 'appointment',
				component: AppointmentComponent,
				canActivate: [AuthGuardService],
				data: { title: 'Appointment' },
			},
			{
				path: 'consultation',
				component: ConsultationComponent,
				canActivate: [AuthGuardService],
				data: { title: 'Consultation' },
				// children: [
				//   { path: 'create', component: ConsultationCreateComponent },
				//   { path: 'detail/:id', component: ConsultationDetailComponent }
				// ]
			},
			{
				path: 'opd',
				canActivate: [AuthGuardService],
				data: { title: 'OPD' },
				children: [
					// { path: 'opd-service', component: OpdServiceComponent, data: { title: 'OPD Service' } },
					// { path: 'opd-doctor-attach', component: OpdDoctorAttachComponent, data: { title: 'OPD Doctor Attach' } },
				]
			},

			// --- STOCK MANAGEMENT ---
			{
				path: 'stock',
				canActivate: [AuthGuardService],
				data: { title: 'Stock Management' },
				children: [
					{ path: 'supplier', component: SupplierComponent, data: { title: 'Supplier' } },
					{ path: 'packet-types', component: PacketTypeComponent, data: { title: 'Packet Type' } },
					{ path: 'stock-items', component: StockItemComponent, data: { title: 'Stock Item' } },
					{ path: 'purchases', component: PurchaseComponent, data: { title: 'Purchases' } },
					{ path: 'main-stocks', component: MainStockComponent, data: { title: 'Main Stock' } }
				]
			},

			// --- VOUCHERS & BILLING ---
			{
				path: 'lab-voucher',
				canActivate: [AuthGuardService],
				data: { title: 'Lab Voucher' },
				children: [
					// { path: 'create-vouchers', component: LabCreateVoucherComponent, data: { title: 'Create Voucher' } },
					// { path: 'histories', component: LabHistoryComponent, data: { title: 'History' } },
				]
			},
			{
				path: 'pharmacy-voucher',
				canActivate: [AuthGuardService],
				data: { title: 'Pharmacy Voucher' },
				children: [
					{ path: 'create-vouchers', component: PharmacyCreateVoucherComponent, data: { title: 'Create Voucher' } },
					{ path: 'histories', component: PharmacyVoHistoryComponent, data: { title: 'History' } },
				]
			},
			{
				path: 'opd-voucher',
				canActivate: [AuthGuardService],
				data: { title: 'OPD Voucher' },
				children: [
					// TODO: Import and attach your OPD Voucher components here once created
					// { path: 'create-vouchers', component: YourOpdVoucherCreateComponent },
					// { path: 'histories', component: YourOpdVoucherHistoryComponent },
				]
			},

			// --- REPORTS ---
			{
				path: 'reports',
				canActivate: [AuthGuardService],
				data: { title: 'Reports' },
				children: [
					// TODO: Import and attach your Report components here once created
					// { path: 'appointment-reports', component: AppointmentReportComponent },
					// { path: 'stock-reports', component: StockReportComponent },
					// { path: 'voucher-reports', component: VoucherReportComponent },
				]
			}
		],
	}
];