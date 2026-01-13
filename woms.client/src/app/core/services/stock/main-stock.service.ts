import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MainStockModel } from '@core_models/stock/main-stock.model';
import { RootModel } from '@core_models/root.model';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MainStockService {

  constructor(private httpClient: HttpClient) { }

  get(clinicId: number, branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(
      `${environment.main_url}/stock/mainstocks?clinicId=${clinicId}&branchId=${branchId}`
    );
  }

  getByCode(code: string, clinicId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/stock/mainstocks/code?code=${code}&clinicId=${clinicId}`);
  }

  getByActive(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/stock/mainstocks/active?branchId=${branchId}`);
  }

  create(model: MainStockModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/stock/mainstocks`, model);
  }

  update(model: MainStockModel): Observable<RootModel> {
    return this.httpClient.put<RootModel>(`${environment.main_url}/stock/mainstocks`, model);
  }

  delete(code: string): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/stock/mainstocks/code?code=${code}`)
  }
}
