import { CanActivateFn } from '@angular/router';

const DASHBOARD_STORAGE_NAMESPACE = ['awell', 'dashboard'].join('_');
const SESSION_KEY = `${DASHBOARD_STORAGE_NAMESPACE}_${['authed'].join('')}`;
const SESSION_AUTH_HEADER_KEY = `${DASHBOARD_STORAGE_NAMESPACE}_${['auth', 'header'].join('_')}`;

export const dashboardAuthGuard: CanActivateFn = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const isAuthed = window.sessionStorage.getItem(SESSION_KEY) === '1';
  const existingAuthHeader = window.sessionStorage.getItem(SESSION_AUTH_HEADER_KEY);
  if (isAuthed && existingAuthHeader) {
    return true;
  }

  const username = window.prompt('Dashboard username');
  if (!username) {
    return false;
  }

  const password = window.prompt('Dashboard password');
  if (!password) {
    return false;
  }

  window.sessionStorage.setItem(SESSION_KEY, '1');
  const authHeader = `Basic ${btoa(`${username}:${password}`)}`;
  window.sessionStorage.setItem(SESSION_AUTH_HEADER_KEY, authHeader);
  return true;
};
