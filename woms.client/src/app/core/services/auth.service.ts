import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoggerService } from '../../shared/services/logger.service';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { RootModel } from '@core_models/root.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private logger: LoggerService,
    private cookieService: CookieService) {
  }

  private getStorageItem(key: string): string | null {
    return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
  }

  getUser(phone: string): Observable<RootModel> {
    let url: string = `${environment.main_url}/auth/get-user?phone=${phone}`;
    return this.http.get<RootModel>(url);
  }

  status(): Observable<RootModel> {
    let url: string = `${environment.main_url}/auth/status`;
    return this.http.get<RootModel>(url);
  }

  accessToken(username: string, password: string): Observable<RootModel> {
    let url: string = `${environment.main_url}/auth/access-token`;
    const body = {
      username: username,
      password: password,
    };
    return this.http.post<RootModel>(url, body);
  }

  refreshToken(): Observable<RootModel> {
    let url: string = `${environment.main_url}/auth/refresh-token`;
    const body = {
      access_token: this.getStorageItem('access_token'),
      refresh_token: this.getStorageItem('refresh_token')
    };
    return this.http.post<RootModel>(url, body);
  }

  isHasToken(): boolean {
    const token = this.getStorageItem('refresh_token');
    return (token !== undefined && token !== null && token !== '');
  }

  isLoggedIn(): boolean {
    return (
      this.cookieService.get('authorized_status') !== undefined &&
      this.cookieService.get('authorized_status') !== null &&
      this.cookieService.get('authorized_status') !== '')
  }

  logout(): void {
    this.cookieService.delete('authorized_status', '/');
  }

  logoutForce(): void {
    this.cookieService.delete('authorized_status', '/');
    this.cookieService.delete('username', '/');
    this.cookieService.delete('userrole', '/');
    this.cookieService.delete('userId', '/');
    this.cookieService.delete('doctorId', '/');
    this.cookieService.delete('doctorName', '/');

    window.localStorage.removeItem('access_token');
    window.localStorage.removeItem('refresh_token');
    window.localStorage.removeItem('default_company');
    window.localStorage.removeItem('default_branch');

    window.sessionStorage.removeItem('access_token');
    window.sessionStorage.removeItem('refresh_token');
    window.sessionStorage.removeItem('default_company');
    window.sessionStorage.removeItem('default_branch');
  }
}