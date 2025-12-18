import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RootModel } from '@core_models/root.model';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TownshipService {
  constructor(private httpClient: HttpClient) { }

  get(): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/townships`);
  }

  getByStateId(stateId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/master/townships/by-state?stateId=${stateId}`);
  }
}
