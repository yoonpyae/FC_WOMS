import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RootModel } from '@core_models/root.model';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  constructor(private httpClinet: HttpClient) { }

  get(branchId: number): Observable<RootModel> {
    return this.httpClinet.get<RootModel>(`${environment.main_url}/master/patients?branchId=${branchId}`);
  }

  getById(id:string, branchId: number): Observable<RootModel> {
    return this.httpClinet.get<RootModel>(`${environment.main_url}/master/patients/${id}?branchId=${branchId}`);
  }

  create(model: any) {
    return this.httpClinet.post<RootModel>(`${environment.main_url}/master/patients`, model);
  }

  update(model: any) {
    return this.httpClinet.put<RootModel>(`${environment.main_url}/master/patients`, model);
  }

  delete(id: string) {
    return this.httpClinet.delete<RootModel>(`${environment.main_url}/master/patients/${id}`, {});
  }
}
