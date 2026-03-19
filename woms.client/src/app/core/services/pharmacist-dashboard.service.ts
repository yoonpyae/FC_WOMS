import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RootModel } from '@core_models/root.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PharmacistDashboardService {

  constructor(private httpClient: HttpClient) { }

  getKpis(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/pharmacy/dashboard/kpis?branchId=${branchId}`);
  }

  getSalesChart(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/pharmacy/dashboard/sales-chart?branchId=${branchId}`);
  }
}