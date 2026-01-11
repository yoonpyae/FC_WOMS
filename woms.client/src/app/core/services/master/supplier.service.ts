import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SupplierModel } from '@core_models/master/supplier.model';
import { RootModel } from '@core_models/root.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  constructor(private httpClient: HttpClient) {
  }

  get(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/suppliers?branchId=${branchId}`);
  }

  getById(id: number, branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/suppliers/${id}?branchId=${branchId}`);
  }

  getAutoId(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/suppliers/auto-id?branchId=${branchId}`);
  }

  create(model: SupplierModel) {
    return this.httpClient.post<RootModel>(`${environment.main_url}/master/suppliers`, model);
  }

  update(model: SupplierModel) {
    return this.httpClient.put<RootModel>(`${environment.main_url}/master/suppliers`, model);
  }

  delete(id: number) {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/master/suppliers/${id}`, {});
  }
}
