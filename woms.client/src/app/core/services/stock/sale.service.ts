import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RootModel } from '@core_models/root.model';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  constructor(private httpClient: HttpClient) { }
  
  get(branchId: number, sDate: string, eDate: string): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/stock/sales?BranchId=${branchId}&startDate=${sDate}&endDate=${eDate}`);
  }

  getById(id: string, branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/stock/sales/${id}?BranchId=${branchId}`);
  }

  getByIdDetail(): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/stock/sales/bydetails`);
  }

  create(model: any): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/stock/sales`, model);
  }

  delete(id: string, remark: string): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/stock/sales/${id}?remark=${remark}`);
  }
}
