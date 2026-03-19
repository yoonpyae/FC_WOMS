import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RootModel } from '@core_models/root.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReceptionDashboardService {

  constructor(private httpClient: HttpClient) { }

  getKpis(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/reception-dashboard/kpis?branchId=${branchId}`);
  }

  getUpcomingAppointments(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/reception-dashboard/upcoming-appointments?branchId=${branchId}`);
  }
}