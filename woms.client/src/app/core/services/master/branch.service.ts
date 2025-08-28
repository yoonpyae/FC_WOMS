import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RootModel } from '@core_models/root.model';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { BranchModel } from '@core_models/master/branch.model';

@Injectable({
  providedIn: 'root'
})
export class BranchService {

  constructor(private httpClient: HttpClient) { }

  get(): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/branches`);
  }

  getById(id: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/branches/${id}`);
  }

  create(model: BranchModel) {
    return this.httpClient.post<RootModel>(`${environment.main_url}/branches`, model);
  }

  update(model: BranchModel) {
    return this.httpClient.put<RootModel>(`${environment.main_url}/branches`, model);
  }

  delete(id: number) {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/branches/${id}`, {});
  }
}
