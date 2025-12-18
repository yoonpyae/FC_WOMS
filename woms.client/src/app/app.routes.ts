import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { AccessDeniedComponent } from './pages/auth/access-denied/access-denied.component';
import { ErrorComponent } from './pages/auth/error/error.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuardService } from '@shared_services/auth-guard.service';
// import { AccessoryComponent } from './pages/master/accessory/accessory.component';
// import { EcgComponent } from './pages/master/ecg/ecg.component';
// import { UltrasoundComponent } from './pages/master/ultrasound/ultrasound.component';
// import { XrayComponent } from './pages/master/xray/xray.component';
// import { PhysiotherapyComponent } from './pages/master/physiotherapy/physiotherapy.component';
// import { OpdServiceComponent } from './pages/master/opd-service/opd-service.component';
// import { CashTitleComponent } from './pages/master/cash-title/cash-title.component';
// import { RoomComponent } from './pages/master/room/room.component';
// import { AdmissionPackageComponent } from './pages/master/admission-package/admission-package.component';
// import { OtServiceComponent } from './pages/master/ot-service/ot-service.component';
// import { WardServiceComponent } from './pages/master/ward-service/ward-service.component';
import { SupplierComponent } from './pages/master/supplier/supplier.component';
// import { LaboratoryComponent } from './pages/master/laboratory/laboratory.component';
// import { CheckupCompanyComponent } from './pages/master/checkup-company/checkup-company.component';
// import { CheckuptypesComponent } from './pages/master/checkuptypes/checkuptypes.component';
// import { DoctorComponent } from './pages/master/doctor/doctor.component';
import { SettingComponent } from './pages/setting/setting.component';
// import { LabtestComponent } from './pages/master/lab-test/lab-test.component';
// import { LabMainGroupComponent } from './pages/master/lab-main-group/lab-main-group.component';
// import { LabSubGroupComponent } from './pages/master/lab-sub-group/lab-sub-group.component';
// import { DetailComponent as DoctorDetailComponent } from './pages/master/doctor/detail/detail.component';
// import { PurchaseComponent } from './pages/stock/purchase/purchase.component';
import { PacketTypeComponent } from "./pages/stock/packet-type/packet-type.component";
import { MainStockComponent } from './pages/stock/main-stock/main-stock.component';
// import { PharmacyStockComponent } from "./pages/stock/pharmacy-stock/pharmacy-stock.component";
// import { StockIssueComponent } from './pages/stock/stock-issue/stock-issue.component';
// import { DamageVoucherComponent } from './pages/stock/damage-voucher/damage-voucher.component';
// import { EntryComponent as DamageVoucherEntryComponent } from "./pages/stock/damage-voucher/entry/entry.component";
// import { DetailComponent as StockIssueDetailComponent } from './pages/stock/stock-issue/detail/detail.component';
// import { HistoryComponent } from './pages/lab-voucher/history/history.component';
// import { CreateVoucherComponent } from './pages/lab-voucher/create-voucher/create-voucher.component';
import { Title } from '@angular/platform-browser';
// import { AdmissionComponent } from './pages/admission/admission/admission.component';
// import { OPDRegisterComponent } from './pages/opd/opd-registration/opd-registration.component';
// import { OPDEntryComponent } from './pages/opd/opd-registration/entry/entry.component';
// import { OPDBookingComponent } from './pages/opd/opd-booking/opd-booking.component';
// import { OtStockComponent } from './pages/ot/ot-stock/ot-stock.component';
// import { OtCaseVoucherComponent } from './pages/ot/ot-case-voucher/ot-case-voucher.component';
// import { OPDVoucherComponent } from './pages/opd/opd-voucher/opd-voucher.component';
// import { AdmissionVoucherComponent } from './pages/admission/admission-voucher/admission-voucher.component';
// import { OpdDoctorAttachComponent } from './pages/opd/opd-doctor-attach/opd-doctor-attach.component';
// import { PharmacyCreateVoucherComponent } from './pages/pharmacy-voucher/create-voucher/create-voucher.component';
// import { PharmacyVoHistoryComponent } from './pages/pharmacy-voucher/history/history.component';
// import { StockItemComponent } from './pages/stock/stock-item/stock-item.component';
// import { AdmLabVoucherComponent } from './pages/admission/lab-voucher/lab-voucher.component';
// import { AdmissionDetailComponent } from './pages/admission/admission/detail/detail.component';

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
			{
				path: 'master',
				children: [
					// { path: 'accessories', component: AccessoryComponent, data: { title: 'Accessory' } },
					// { path: 'ecg-tests', component: EcgComponent, data: { title: 'ECG Test' } },
					// { path: 'ultrasound-tests', component: UltrasoundComponent, data: { title: 'Ultrasound Test' } },
					// { path: 'xray-tests', component: XrayComponent, data: { title: 'Xray Test' } },
					// { path: 'physiotherapies', component: PhysiotherapyComponent, data: { title: 'Physiotherapy' } },
					// { path: 'opd-services', component: OpdServiceComponent, data: { title: 'OPDService' } },
					// { path: 'accessories', component: AccessoryComponent, data: { title: 'Accessory' } },
					// { path: 'cash-title', component: CashTitleComponent, data: { title: 'Cash Title' } },
					// { path: 'room', component: RoomComponent, data: { title: 'Room' } },
					// {
					// 	path: 'admission-package',
					// 	component: AdmissionPackageComponent,
					// 	data: { title: 'Admission Package' }
					// },
					// { path: 'ot-service', component: OtServiceComponent, data: { title: 'OT Serivce' } },
					// { path: 'ward-service', component: WardServiceComponent, data: { title: 'Ward Service' } },
					// { path: 'lab-test', component: LabtestComponent, data: { title: 'Lab Test' } },
					{ path: 'supplier', component: SupplierComponent, data: { title: 'Supplier' } },
					// { path: 'laboratory', component: LaboratoryComponent, data: { title: 'laboratory' } },
					// { path: 'checkup-company', component: CheckupCompanyComponent, data: { title: 'Checkup Company' } },
					// { path: 'checkup-types', component: CheckuptypesComponent, data: { title: 'Checkup Types' } },
					// {
					// 	path: 'doctor',
					// 	children: [
					// 		{ path: '', component: DoctorComponent },
					// 		{ path: 'detail/:id', component: DoctorDetailComponent },
					// 		{ path: 'detail', component: DoctorDetailComponent },
					// 		{ path: 'doctor/detail', component: DoctorDetailComponent },
					// 		{ path: '', redirectTo: 'doctor', pathMatch: 'full' },
					// 	],
					// },
					// { path: 'lab-main-groups', component: LabMainGroupComponent, data: { title: 'Lab Main Group' } },
					// { path: 'lab-sub-groups', component: LabSubGroupComponent, data: { title: 'Lab Sub Group' } },


				],
				canActivate: [AuthGuardService],
				data: { title: 'Master' },
			},
			{
				path: 'stock',
				children: [
					// { path: 'stock-items', component: StockItemComponent, data: { title: 'Stock Item' } },
					{ path: 'packet-types', component: PacketTypeComponent, data: { title: 'Packet Type' } },
					{ path: 'main-stocks', component: MainStockComponent, data: { title: 'Main Stock' } },
					// { path: 'pharmacy-stocks', component: PharmacyStockComponent, data: { title: 'Pharmacy Stock' } },
					{
						path: 'stock-issue',
						children: [
							// { path: '', component: StockIssueComponent, data: { title: '' } },
							// { path: 'detail/:id', component: StockIssueDetailComponent, data: { title: 'Stock Issue Detail' } },
							{ path: '', redirectTo: 'stock-issue', pathMatch: 'full' },
						], data: { title: 'Stock Issue' }
					},
					{
						path: 'purchases',
						children: [
							// { path: '', component: PurchaseComponent, data: { title: '' } },
							{ path: '', redirectTo: 'purchases', pathMatch: 'full' }
						], data: { title: 'Purchases' }
					},
					{
						path: 'damage-vouchers',
						children: [
							// { path: '', component: DamageVoucherComponent },
							// { path: 'entry', component: DamageVoucherEntryComponent },
							// { path: 'entry/:id', component: DamageVoucherEntryComponent },
							// { path: '', redirectTo: 'damage-vouchers', pathMatch: 'full' }
						]
					}
				],
				canActivate: [AuthGuardService],
				data: { title: 'Stock' },
			},
			{
				path: 'lab-voucher',
				children: [
					// { path: 'create-vouchers', component: CreateVoucherComponent, data: { title: 'Create Voucher' } },
					// { path: 'histories', component: HistoryComponent, data: { title: 'History' } },

				],

				canActivate: [AuthGuardService],
				data: { title: 'Lab Voucher' }
			},
			{
				path: 'pharmacy-voucher',
				children: [
					// { path: 'create-vouchers', component: PharmacyCreateVoucherComponent, data: { title: 'Create Voucher' } },
					// { path: 'histories', component: PharmacyVoHistoryComponent, data: { title: 'History' } },

				],

				canActivate: [AuthGuardService],
				data: { title: 'Pharmacy Voucher' }
			},
			{
				path: 'opd',
				children: [
					{
						path: 'opd-registrations',
						children: [
							// { path: '', component: OPDRegisterComponent, data: { title: '' } },
							// { path: '', redirectTo: 'opd-registrations', pathMatch: 'full' }
						],
						data: { title: 'OPD Registration' },
					},
					// { path: 'opd-bookings', component: OPDBookingComponent, data: { title: 'OPD Booking' } },
					// { path: 'opd-vouchers', component: OPDVoucherComponent, data: { title: 'OPD Voucher' } },
					// { path: 'opd-doctor-attach', component: OpdDoctorAttachComponent, data: { title: 'OPD Doctor Attach' } },
				],
				canActivate: [AuthGuardService],
				data: { title: 'OPD' }
			},
			{
				path: 'ot',
				children: [
					// { path: 'ot-stock', component: OtStockComponent, data: { title: '' } },
					// { path: 'ot-case-voucher', component: OtCaseVoucherComponent, data: { title: '' } }
				],
				canActivate: [AuthGuardService],
				data: { title: 'OT' }
			}
		],
	}
];

