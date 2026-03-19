import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RootModel } from '@core_models/root.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private httpClient: HttpClient) { }

  getKpis(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/dashboard/kpis?branchId=${branchId}`);
  }

  getRevenueChart(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/dashboard/revenue-chart?branchId=${branchId}`);
  }
}