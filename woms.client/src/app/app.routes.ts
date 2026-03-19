import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { AuthGuardService } from '@shared_services/auth-guard.service';
import { UserRole } from '@core_models/user-role';

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
import { OpdVoucherComponent } from './pages/master/opd-voucher/opd-voucher.component';

// Stock Management
import { SupplierComponent } from './pages/master/supplier/supplier.component';
import { StockItemComponent } from './pages/stock/stock-item/stock-item.component';
import { PacketTypeComponent } from "./pages/stock/packet-type/packet-type.component";
import { MainStockComponent } from './pages/stock/main-stock/main-stock.component';
import { PurchaseComponent } from './pages/stock/purchase/purchase.component';

// Vouchers & Billing
import { PharmacyCreateVoucherComponent } from './pages/pharmacy-voucher/create-voucher/create-voucher.component';
import { PharmacyVoHistoryComponent } from './pages/pharmacy-voucher/history/history.component';
import { ConsultationComponent } from './pages/master/consultation/consultation.component';
import { PatientDetailComponent } from './pages/master/patient/detail/detail.component';
import { EntryComponent } from './pages/stock/purchase/entry/entry.component';
import { ServiceComponent } from './pages/master/service/service.component';
import { title } from 'process';
import { OPDVoucherEntryComponent } from './pages/master/opd-voucher/entry/entry.component';
import { DoctorDashboardComponent } from './pages/dashboard/doctor-dashboard/doctor-dashboard.component';
import { BranchComponent } from './pages/master/branch/branch.component';
import { UserManagementComponent } from './pages/master/user-management/user-management.component';
import { AppointmentReportComponent } from './pages/reports/appointment-report/appointment-report.component';
import { StockReportComponent } from './pages/reports/stock-report/stock-report.component';
import { VoucherReportComponent } from './pages/reports/voucher-report/voucher-report.component';
import { PharmacistDashboardComponent } from './pages/dashboard/pharmacist-dashboard/pharmacist-dashboard.component';
import { ReceptionDashboardComponent } from './pages/dashboard/reception-dashboard/reception-dashboard.component';

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
				data: { title: 'Dashboard', roles: [UserRole.SuperAdmin] },
			},
			{
				path: 'doctor-dashboard',
				component: DoctorDashboardComponent,
				canActivate: [AuthGuardService],
				data: { title: 'Dashboard', roles: [UserRole.Doctor] }
			},
			{
				path: 'pharmacist-dashboard',
				component: PharmacistDashboardComponent,
				canActivate: [AuthGuardService],
				data: { title: 'Pharmacy Dashboard', roles: [UserRole.Pharmacist] }
			},
			{
				path: 'reception-dashboard',
				component: ReceptionDashboardComponent,
				canActivate: [AuthGuardService],
				data: { title: 'Reception Dashboard', roles: [UserRole.Receptionist] }
			},
			// --- OUTPATIENT DEPARTMENT ---
			{
				path: 'doctor',
				canActivate: [AuthGuardService],
				data: { title: 'Doctor', roles: [UserRole.SuperAdmin] },
				children: [
					{ path: '', component: DoctorComponent },
					{ path: 'detail', component: DoctorDetailComponent },
					{ path: 'detail/:id', component: DoctorDetailComponent },
				]
			},
			{
				path: 'patient',
				canActivate: [AuthGuardService],
				data: { title: 'Patient', roles: [UserRole.Receptionist, UserRole.SuperAdmin, UserRole.Doctor] },
				children: [
					{ path: '', component: PatientComponent },
					{ path: 'detail/:id', component: PatientDetailComponent }
				]
			},
			{
				path: 'appointment',
				component: AppointmentComponent,
				canActivate: [AuthGuardService],
				data: { title: 'Appointment', roles: [UserRole.Receptionist, UserRole.SuperAdmin] },
			},
			{
				path: 'consultation',
				component: ConsultationComponent,
				canActivate: [AuthGuardService],
				data: { title: 'Consultation', roles: [UserRole.Doctor] },
				children: [
					{ path: 'create', component: ConsultationComponent },
					{ path: 'detail/:id', component: ConsultationComponent }
				]
			},
			{
				path: 'service',
				component: ServiceComponent,
				canActivate: [AuthGuardService],
				data: { title: 'Service', roles: [UserRole.SuperAdmin] },
			},

			// --- STOCK MANAGEMENT ---
			{
				path: 'stock',
				canActivate: [AuthGuardService],
				data: { title: 'Stock Management', roles: [UserRole.Pharmacist, UserRole.SuperAdmin] },
				children: [
					{ path: 'supplier', component: SupplierComponent, data: { title: 'Supplier' } },
					{ path: 'packet-types', component: PacketTypeComponent, data: { title: 'Packet Type' } },
					{ path: 'stock-items', component: StockItemComponent, data: { title: 'Stock Item' } },
					{ path: 'main-stocks', component: MainStockComponent, data: { title: 'Main Stock' } }
				]
			},

			// --- VOUCHERS & BILLING ---
			{
				path: 'purchase',
				canActivate: [AuthGuardService],
				data: { title: 'Purchases', roles: [UserRole.Pharmacist, UserRole.SuperAdmin] },
				component: PurchaseComponent
			},
			{
				path: 'pharmacy-voucher',
				canActivate: [AuthGuardService],
				data: { title: 'Pharmacy Voucher', roles: [UserRole.Pharmacist, UserRole.SuperAdmin] },
				children: [
					{ path: 'create-voucher', component: PharmacyCreateVoucherComponent, data: { title: 'Create Voucher' } },
					{ path: 'histories', component: PharmacyVoHistoryComponent, data: { title: 'Pharmacy History' } },
				]
			},
			{
				path: 'opd-voucher',
				canActivate: [AuthGuardService],
				data: { title: 'OPD Voucher', roles: [UserRole.Receptionist, UserRole.SuperAdmin] },
				children: [
					{ path: 'histories', component: OpdVoucherComponent, data: { title: 'OPD Vouher History' } },
					{ path: 'create-voucher', component: OPDVoucherEntryComponent, data: { title: 'Create Voucher' } },
				]
			},

			// --- REPORTS ---
			{
				path: 'reports',
				canActivate: [AuthGuardService],
				data: { title: 'Reports', roles: [UserRole.SuperAdmin] },
				children: [
					// TODO: Import and attach your Report components here once created
					{ path: 'appointment-reports', component: AppointmentReportComponent },
					{ path: 'stock-reports', component: StockReportComponent },
					{ path: 'voucher-reports', component: VoucherReportComponent },
				]
			},

			{
				path: 'management',
				canActivate: [AuthGuardService],
				data: { title: ' Management', roles: [UserRole.SuperAdmin] },
				children: [
					{
						component: BranchComponent,
						path: 'branchs',
					},
					{ path: 'users', component: UserManagementComponent },
				]
			},
		],
	}
];