import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DoctorModel } from '@core_models/master/doctor.model';
import { RootModel } from '@core_models/root.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DoctorService {

  constructor(private httpClient: HttpClient) {
  }

  get(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/doctors?branchId=${branchId}`);
  }

  getById(id: number, branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/doctors/${id}?branchId=${branchId}`);
  }

  getAutoId(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/doctors/auto-id?branchId=${branchId}`)
  }

  getByActive(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/doctors/active?branchId=${branchId}`);
  }

  getRound(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/doctors/round?branchId=${branchId}`);
  }

  create(model: DoctorModel) {
    return this.httpClient.post<RootModel>(`${environment.main_url}/master/doctors`, model);
  }

  update(model: DoctorModel) {
    return this.httpClient.put<RootModel>(`${environment.main_url}/master/doctors`, model);
  }

  delete(id: number) {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/master/doctors/${id}`, {});
  }

  uploadPhoto(id: number, base64: string): Observable<RootModel> {

    const model = {
      id: id,
      file: base64
    }

    return this.httpClient.put<RootModel>(
      `${environment.main_url}/master/doctors/uploadphoto`,
      model
    );
  }

  uploadSign(id: number, base64: string): Observable<RootModel> {

    const model = {
      id: id,
      file: base64
    }

    return this.httpClient.put<RootModel>(
      `${environment.main_url}/master/doctors/uploadsign`,
      model
    );
  }

}

