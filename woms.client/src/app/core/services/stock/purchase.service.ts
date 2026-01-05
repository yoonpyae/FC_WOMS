import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RootModel } from '@core_models/root.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PurchaseEntryModel } from '@core_models/stock/purchase/purchase-entry.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  constructor(private httpClient: HttpClient) { }

  get(branchId: number, sDate: string, eDate: string): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/stock/purchases?BranchId=${branchId}&startDate=${sDate}&endDate=${eDate}`);
  }

  getById(id: string, branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/stock/purchases/${id}?BranchId=${branchId}`);
  }

  getByIdDetail(): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/stock/purchases/bydetails`);
  }

  create(model: PurchaseEntryModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/stock/purchases`, model);
  }

  update(model: PaymentRequest): Observable<RootModel> {
    return this.httpClient.put<RootModel>(`${environment.main_url}/stock/purchases`, model);
  }

  delete(id: string, remark: string): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/stock/purchases/${id}?remark=${remark}`);
  }

}
