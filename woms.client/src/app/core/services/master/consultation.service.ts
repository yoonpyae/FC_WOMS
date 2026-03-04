import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConsultationEntryModel } from '@core_models/master/prescription.model';
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

  getPrescriptionByConsultationId(id: string): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/prescriptions/${id}`);
  }

  getByPatientId(patientId: string, branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/consultations?patientId=${patientId}&branchId=${branchId}`);
  }

  getPatientInfo(patientId: string, branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/consultations/getpatient-info?patientId=${patientId}&branchId=${branchId}`);
  }

  create(model: ConsultationEntryModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/master/consultations`, model);
  }

  update(model: ConsultationEntryModel): Observable<RootModel> {
    return this.httpClient.put<RootModel>(`${environment.main_url}/master/consultations`, model);
  }

  delete(id: string): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/master/consultations/${id}`, {});
  }
}
