import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppointmentModel } from '@core_models/master/appointment.model';
import { RootModel } from '@core_models/root.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  constructor(private httpClient: HttpClient) { }

  get(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/appointments?branchId=${branchId}`);
  }

  getDoctorsOnDuty(branchId: number, dayOfWeek: string): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/appointments/doctors-on-duty?branchId=${branchId}&dayOfWeek=${dayOfWeek}`);
  }

  getDoctorAppointments(branchId: number, date: string): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/appointments/doctor-appointments?branchId=${branchId}&appointmentDate=${date}`);
  }

  getById(id: string, branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/appointments/${id}?BranchId=${branchId}`);
  }

  getAutoId(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/appointments/auto-id?branchId=${branchId}`);
  }

  getByPatientId(patientId: string, branchId: number, doctorId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/appointments/${patientId}?branchId=${branchId}&doctorId=${doctorId}`);
  }

  create(model: AppointmentModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/master/appointments`, model);
  }

  update(model: AppointmentModel): Observable<RootModel> {
    return this.httpClient.put<RootModel>(`${environment.main_url}/master/appointments`, model);
  }

  delete(ano: number, branchId: number): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(
      `${environment.main_url}/master/appointments/${ano}/${branchId}`
    );
  }

  getReport(branchId: number, startDate?: string, endDate?: string): Observable<RootModel> {
    let url = `${environment.main_url}/master/appointments/report?branchId=${branchId}`;
    if (startDate) url += `&startDate=${startDate}`;
    if (endDate) url += `&endDate=${endDate}`;
    return this.httpClient.get<RootModel>(url);
  }
}
