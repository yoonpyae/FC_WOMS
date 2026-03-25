import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServiceModel } from '@core_models/master/service.model';
import { RootModel } from '@core_models/root.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  constructor(private httpClinet: HttpClient) { }

  get(branchId: number): Observable<RootModel> {
    return this.httpClinet.get<RootModel>(`${environment.main_url}/master/services?branchId=${branchId}`);
  }

  getById(id: number, branchId: number): Observable<RootModel> {
    return this.httpClinet.get<RootModel>(`${environment.main_url}/master/services/${id}?branchId=${branchId}`);
  }

  getAutoId(branchId: number): Observable<RootModel> {
    return this.httpClinet.get<RootModel>(`${environment.main_url}/master/services/auto-id?branchId=${branchId}`);
  }

  create(model: ServiceModel): Observable<RootModel> {
    return this.httpClinet.post<RootModel>(`${environment.main_url}/master/services`, model);
  }

  update(model: ServiceModel): Observable<RootModel> {
    return this.httpClinet.put<RootModel>(`${environment.main_url}/master/services`, model);
  }

  delete(id: number, branchId: number): Observable<any> {
    return this.httpClinet.delete<RootModel>(`${environment.main_url}/master/services/${id}/${branchId}`);
  }
}
