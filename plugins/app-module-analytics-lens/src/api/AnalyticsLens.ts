import {
  BackstageUserIdentity,
  DiscoveryApi,
  FetchApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import { AnalyticsApi, AnalyticsEvent } from '@backstage/frontend-plugin-api';
import { Config } from '@backstage/config';
import { WINDOW_SESSION_ID_STORAGE_KEY } from '@internal/backstage-plugin-analytics-lens-common';

type Options = {
  config: Config;
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
  identityApi: IdentityApi;
  sessionId: string;
  isDebugMode?: boolean;
};

export class AnalyticsLens implements AnalyticsApi {
  config: Config;
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
  identityApi: IdentityApi;
  sessionId: string;
  isDebugMode: boolean;

  private constructor(options: Options) {
    this.config = options.config;
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
    this.identityApi = options.identityApi;
    this.sessionId = AnalyticsLens.resolveSessionId();
    this.isDebugMode = options.isDebugMode ?? false;
  }

  captureEvent(event: AnalyticsEvent): void {
    throw new Error('Method not implemented.');
  }

  /**
   * Resolve the session ID. Session ID is stored in browser sessionStorage if available.
   * @returns The session ID.
   */
  private static resolveSessionId(): string {
    try {
      if (typeof window !== 'undefined' && window?.sessionStorage) {
        const key = WINDOW_SESSION_ID_STORAGE_KEY;
        let id = window.sessionStorage.getItem(key);
        if (!id) {
          id =
            crypto?.randomUUID?.() ||
            `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
          window.sessionStorage.setItem(key, id);
        }
        return id;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.debug(`Failed to resolve session ID: ${error}`);
    }
    return (
      crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    );
  }

  getSessionId(): string {
    return this.sessionId;
  }
}
