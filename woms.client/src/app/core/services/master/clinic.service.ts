import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ClinicModel } from '@core_models/master/clinic.model';
import { RootModel } from '@core_models/root.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClinicService {

  constructor(private httpClient: HttpClient) { }

  get(): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/clinics`);
  }

  getById(id: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/clinics/${id}`);
  }

  create(model: ClinicModel) {
    return this.httpClient.post<RootModel>(`${environment.main_url}/clinics`, model);
  }

  update(model: ClinicModel) {
    return this.httpClient.put<RootModel>(`${environment.main_url}/clinics`, model);
  }

  delete(id: number) {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/clinics/${id}`, {});
  }
}
