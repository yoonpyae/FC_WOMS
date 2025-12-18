import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { StockItemModel } from '@core_models/stock/stock-item.model';
import { RootModel } from '@core_models/root.model';
import { RowToggler } from 'primeng/table';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StockItemService {

  constructor(private httpClient: HttpClient) { }

  get(clinicId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/stock/stockitems?clinicId=${clinicId}`);
  }

  getByAutoId(name: string, clinicId: number): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/stock/stockitems/auto-id?Name=${name}&clinicId=${clinicId}`)
  }

  getByItemCode(code: string, name: string): Observable<RootModel> {
    return this.httpClient.get<RootModel>(`${environment.main_url}/stock/stockitems/itemcode?itemCode=${code}&itemName=${name}`);
  }

  create(model: StockItemModel): Observable<RootModel> {
    return this.httpClient.post<RootModel>(`${environment.main_url}/stock/stockitems`, model);
  }

  update(model: StockItemModel): Observable<RootModel> {
    return this.httpClient.put<RootModel>(`${environment.main_url}/stock/stockitems`, model);
  }

  delete(code: string): Observable<RootModel> {
    return this.httpClient.delete<RootModel>(`${environment.main_url}/stock/stockitems/${code}`);
  }
}
