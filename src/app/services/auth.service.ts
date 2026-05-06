import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Session, SupabaseClient, User, createClient } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  lastEvent: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly client: SupabaseClient | null;
  private readonly stateSubject = new BehaviorSubject<AuthState>({
    user: null,
    session: null,
    loading: true,
    lastEvent: null
  });

  readonly state$ = this.stateSubject.asObservable();

  constructor() {
    const url = this.readMeta('supabase-url');
    const publishableKey = this.readMeta('supabase-publishable-key');

    if (!url || !publishableKey) {
      this.client = null;
      this.stateSubject.next({ user: null, session: null, loading: false, lastEvent: null });
      return;
    }

    this.client = createClient(url, publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });

    void this.bootstrap();
  }

  get isConfigured(): boolean {
    return !!this.client;
  }

  get currentState(): AuthState {
    return this.stateSubject.value;
  }

  get currentUser(): User | null {
    return this.stateSubject.value.user;
  }

  get currentEmail(): string {
    return this.stateSubject.value.user?.email?.trim().toLowerCase() || '';
  }

  async signInWithPassword(email: string, password: string): Promise<void> {
    const client = this.requireClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });

    if (error) {
      throw error;
    }

    this.updateState(data.session, data.user, 'SIGNED_IN');
  }

  async signUp(email: string, password: string): Promise<{ requiresEmailConfirmation: boolean }> {
    const client = this.requireClient();
    const { data, error } = await client.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/schedule#membership-options`
      }
    });

    if (error) {
      throw error;
    }

    this.updateState(data.session ?? null, data.user ?? null, 'SIGNED_UP');

    return {
      requiresEmailConfirmation: !data.session
    };
  }

  async signOut(): Promise<void> {
    const client = this.requireClient();
    const { error } = await client.auth.signOut();
    if (error) {
      throw error;
    }

    this.updateState(null, null, 'SIGNED_OUT');
  }

  async resetPassword(email: string): Promise<void> {
    const client = this.requireClient();
    const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/schedule#membership-options`
    });

    if (error) {
      throw error;
    }
  }

  async updatePassword(password: string): Promise<void> {
    const client = this.requireClient();
    const { data, error } = await client.auth.updateUser({ password });

    if (error) {
      throw error;
    }

    this.updateState(this.currentState.session, data.user ?? this.currentUser, 'USER_UPDATED');
  }

  async getAccessToken(): Promise<string | null> {
    if (!this.client) {
      return null;
    }

    const { data, error } = await this.client.auth.getSession();
    if (error) {
      return null;
    }

    return data.session?.access_token || null;
  }

  private async bootstrap(): Promise<void> {
    const client = this.client;
    if (!client) {
      return;
    }

    const { data } = await client.auth.getSession();
    this.updateState(data.session ?? null, data.session?.user ?? null, 'INITIAL_SESSION');

    client.auth.onAuthStateChange((event, session) => {
      this.updateState(session ?? null, session?.user ?? null, event);
    });
  }

  private updateState(session: Session | null, user: User | null, _event: string): void {
    this.stateSubject.next({
      session,
      user,
      loading: false,
      lastEvent: _event
    });
  }

  private readMeta(name: string): string {
    return document.querySelector(`meta[name="${name}"]`)?.getAttribute('content')?.trim() || '';
  }

  private requireClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Membership login is not configured yet.');
    }

    return this.client;
  }
}
