import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PacketTypeModel } from '@core_models/stock/packet-type.model';
import { RootModel } from '@core_models/root.model';
import { RowToggler } from 'primeng/table';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PacketTypeService {

  constructor(private httpClient: HttpClient) { }

  get(clinicId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/stock/packettypes?clinicId=${clinicId}`);
  }

  getByAutoCode(clinicId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/stock/packettypes/auto-code?clinicId=${clinicId}`);
  }

  create(model: PacketTypeModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/stock/packettypes`, model);
  }

  update(model: PacketTypeModel): Observable<RootModel> {
    return this.httpClient.put<RootModel>(`${environment.main_url}/stock/packettypes`, model);
  }

  delete(code: number): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/stock/packettypes/${code}`);
  }
}
