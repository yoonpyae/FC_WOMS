import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PharmacyVoucherModel } from '@core_models/pharmacy-voucher/pharmacy-voucher.model';
import { RootModel } from '@core_models/root.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PharmacyVoucherService {

  constructor(private httpClient: HttpClient) { }

  get(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/pharmacyVo/pharmacyVouchers?BranchId=${branchId}`);
  }

  getByDate(branchId: number, sDate: string, eDate: string): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/pharmacyvo/pharmacyvouchers/by-daterange?BranchId=${branchId}&startDate=${sDate}&endDate=${eDate}`);
  }

  getByCredit(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/pharmacyvo/pharmacyvouchers/credit?BranchId=${branchId}`);
  }

  getDetail(vno: string): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/pharmacyVo/pharmacyVouchers/${vno}`);
  }

  create(model: PharmacyVoucherModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/pharmacyvo/pharmacyvouchers`, model);
  }

  update(model: PharmacyVoucherModel): Observable<RootModel> {
    return this.httpClient.put<RootModel>(`${environment.main_url}/pharmacyvo/pharmacyvouchers`, model);
  }

  delete(vno: string): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/pharmacyvo/pharmacyvouchers/${vno}`);
  }
}
