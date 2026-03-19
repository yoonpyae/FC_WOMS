import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RootModel } from '@core_models/root.model';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private httpClient: HttpClient) { }

  get(): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/users`);
  }

  create(model: any): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/master/users`, model);
  }
  update(id: string, model: any): Observable<RootModel> {
    return this.httpClient.put<RootModel>(`${environment.main_url}/master/users/${id}`, model);
  }

  delete(id: string): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/master/users/${id}`);
  }
}