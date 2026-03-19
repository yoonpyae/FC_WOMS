import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RootModel } from '@core_models/root.model';
import { environment } from '@env/environment';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VoucherReportService {

  constructor(private httpClient: HttpClient) { }

  getAggregatedReports(branchId: number, startDate: string, endDate: string): Observable<[RootModel, RootModel, RootModel]> {

    const purchases$ = this.httpClient.get<RootModel>(
      `${environment.main_url}/stock/purchases?BranchId=${branchId}&startDate=${startDate}&endDate=${endDate}`
    );

    const pharmacy$ = this.httpClient.get<RootModel>(
      `${environment.main_url}/pharmacy/pharmacyvouchers/by-dateRange?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}`
    );

    const opd$ = this.httpClient.get<RootModel>(
      `${environment.main_url}/master/opdvouchers/by-dateRange?branchId=${branchId}&startDate=${startDate}&endDate=${endDate}`
    );

    return forkJoin([purchases$, pharmacy$, opd$]);
  }
}