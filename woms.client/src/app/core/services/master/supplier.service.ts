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

  get(hospitalId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/supplier?hospitalId=${hospitalId}`);
  }

  getById(id: number, hospitalId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/supplier/${id}?hospitalId=${hospitalId}`);
  }

  getAutoId(hospitalId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/supplier/auto-id?hospitalid=${hospitalId}`);
  }

  create(model: SupplierModel) {
    return this.httpClient.post<RootModel>(`${environment.main_url}/master/supplier`, model);
  }

  update(model: SupplierModel) {
    return this.httpClient.put<RootModel>(`${environment.main_url}/master/supplier`, model);
  }

  delete(id: number) {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/master/supplier/${id}`, {});
  }
}
