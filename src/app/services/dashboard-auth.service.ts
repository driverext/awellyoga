import { Injectable } from '@angular/core';

export type DashboardScope = 'admin' | 'retreat';

@Injectable({ providedIn: 'root' })
export class DashboardAuthService {
  private readonly namespace = 'awell_dashboard';

  getAuthHeader(scope: DashboardScope): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return window.sessionStorage.getItem(this.authHeaderKey(scope));
  }

  isAuthed(scope: DashboardScope): boolean {
    return !!this.getAuthHeader(scope);
  }

  setCredentials(scope: DashboardScope, username: string, password: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    const authHeader = `Basic ${btoa(`${username}:${password}`)}`;
    window.sessionStorage.setItem(this.authHeaderKey(scope), authHeader);
  }

  setAuthHeader(scope: DashboardScope, authHeader: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.sessionStorage.setItem(this.authHeaderKey(scope), authHeader);
  }

  clear(scope: DashboardScope): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.sessionStorage.removeItem(this.authHeaderKey(scope));
  }

  clearAll(): void {
    this.clear('admin');
    this.clear('retreat');
  }

  resolveScopeForPath(path: string | null | undefined): DashboardScope {
    const normalized = (path || '').trim().toLowerCase();
    return normalized.startsWith('/dashboard/retreats') ? 'retreat' : 'admin';
  }

  private authHeaderKey(scope: DashboardScope): string {
    return `${this.namespace}_${scope}_auth_header`;
  }
}
