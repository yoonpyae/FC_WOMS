import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OPDVoucherEntryModel } from '@core_models/master/opd-voucher.model';
import { RootModel } from '@core_models/root.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OPDVoucherService {

  constructor(private httpClient: HttpClient) { }

  get(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/opdvouchers/${branchId}`);
  }

  getById(id: string, branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/opdvouchers/${id}?BranchId=${branchId}`);
  }

  getByDateRange(branchId: number, sDate: string, eDate: string): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/opdvouchers/get-by-dateRange?BranchId=${branchId}&startDate=${sDate}&endDate=${eDate}`);
  }

  GetByDetails(id: string, branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/opdvouchers/details/${id}?BranchId=${branchId}`);
  }

  create(model: OPDVoucherEntryModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/master/opdvouchers`, model);
  }

  update(model: OPDVoucherEntryModel): Observable<RootModel> {
    return this.httpClient.put<RootModel>(`${environment.main_url}/master/opdvouchers`, model);
  }

  delete(id: string): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/master/opdvouchers/${id}`);
  }
}
