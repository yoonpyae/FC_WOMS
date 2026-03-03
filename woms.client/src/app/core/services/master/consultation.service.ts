import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConsultationModel } from '@core_models/master/consultation.model';
import { RootModel } from '@core_models/root.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {

  constructor(private httpClient: HttpClient) { }

  get(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/consultations?branchId=${branchId}`);
  }

  getById(id: string, branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/consultations/${id}?BranchId=${branchId}`);
  }

  create(model: ConsultationModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/master/consultations`, model);
  }

  update(model: ConsultationModel): Observable<RootModel> {
    return this.httpClient.put<RootModel>(`${environment.main_url}/master/consultations`, model);
  }

  delete(id: string): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/master/consultations/${id}`, {});
  }
}
