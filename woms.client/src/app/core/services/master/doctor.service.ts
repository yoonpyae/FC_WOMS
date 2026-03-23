import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DoctorModel, ScheduleModel } from '@core_models/master/doctor.model';
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

  getScheduleAutoId(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/doctorschedules/auto-scheduleId?branchId=${branchId}`)
  }

  getByActive(branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/doctors/active?branchId=${branchId}`);
  }

  getByDoctor(doctorId: number, branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/doctorschedules?doctorId=${doctorId}&branchId=${branchId}`);
  }

  getScheduleByDoctorDay(doctorId: number, dayOfWeek: string, branchId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/doctorschedules/by-doctor-day?doctorId=${doctorId}&dayOfWeek=${dayOfWeek}&branchId=${branchId}`);
  }

  create(model: DoctorModel) {
    return this.httpClient.post<RootModel>(`${environment.main_url}/master/doctors`, model);
  }

  createSchedule(model: ScheduleModel) {
    return this.httpClient.post<RootModel>(`${environment.main_url}/master/doctorschedules`, model);
  }

  update(model: DoctorModel) {
    return this.httpClient.put<RootModel>(`${environment.main_url}/master/doctors`, model);
  }

  updateSchedule(schedule: ScheduleModel): Observable<RootModel> {
    const branchId = schedule.branchId;
    const scheduleId = schedule.scheduleId;

    return this.httpClient.put<RootModel>(`${environment.main_url}/master/doctorschedules/${scheduleId}?branchId=${branchId}`, schedule);
  }

  delete(id: number) {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/master/doctors/${id}`, {});
  }

  deleteSchedule(id: number, branchId: number) {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/master/doctorschedules/${id}?branchId=${branchId}`);
  }

  uploadPhoto(id: number, file: File): Observable<RootModel> {

    const formData = new FormData();
    formData.append('photo', file, file.name);

    return this.httpClient.put<RootModel>(
      `${environment.main_url}/master/doctors/uploadphoto?id=${id}`,
      formData
    );
  }

  uploadSign(id: number, file: File): Observable<RootModel> {

    const formData = new FormData();
    formData.append('sign', file, file.name);

    return this.httpClient.put<RootModel>(
      `${environment.main_url}/master/doctors/uploadsign?id=${id}`,
      formData
    );
  }
}

