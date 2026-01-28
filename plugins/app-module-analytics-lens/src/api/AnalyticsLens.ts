import {
  DiscoveryApi,
  FetchApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import { AnalyticsApi, AnalyticsEvent } from '@backstage/frontend-plugin-api';
import { Config } from '@backstage/config';
import {
  WINDOW_SESSION_ID_STORAGE_KEY,
  DefaultApiClient,
} from '@internal/backstage-plugin-analytics-lens-common';
import type { EventPayload } from '@internal/backstage-plugin-analytics-lens-common';
import { EventsQueue } from './EventsQueue';

type Options = {
  config: Config;
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
  identityApi: IdentityApi;
  isDebugMode?: boolean;
};

/**
 * @public
 * AnalyticsLens API implementation.
 */
export class AnalyticsLens implements AnalyticsApi {
  config: Config;
  discoveryApi: DiscoveryApi;
  fetchApi: FetchApi;
  identityApi: IdentityApi;
  sessionId: string;
  isDebugMode: boolean;

  private readonly eventsQueue: EventsQueue;

  private constructor(options: Options) {
    this.config = options.config;
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
    this.identityApi = options.identityApi;
    this.isDebugMode = options.isDebugMode ?? true; // TODO: set to false by default and enabled via app-config.yaml
    this.sessionId = this.resolveSessionId();

    const client = new DefaultApiClient({
      discoveryApi: this.discoveryApi,
      fetchApi: this.fetchApi,
    });

    this.eventsQueue = new EventsQueue({
      client,
      isDebugMode: this.isDebugMode,
    });
  }

  static fromConfig(
    config: Config,
    options: {
      discoveryApi: DiscoveryApi;
      fetchApi: FetchApi;
      identityApi: IdentityApi;
    },
  ): AnalyticsLens {
    return new AnalyticsLens({
      config,
      discoveryApi: options.discoveryApi,
      fetchApi: options.fetchApi,
      identityApi: options.identityApi,
      isDebugMode: true, // TODO: read from config
    });
  }

  captureEvent(event: AnalyticsEvent): void {
    this.handleCaptureEvent(event);
  }

  private async handleCaptureEvent(event: AnalyticsEvent): Promise<void> {
    try {
      const { action, subject, value, attributes, context } = event;

      const identity = await this.identityApi.getBackstageIdentity();
      const userEntityRef = identity?.userEntityRef || 'unknown';

      const payload: EventPayload = {
        action,
        subject,
        value,
        attributes,
        context,
        userEntityRef,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
      };
      this.log(`Captured event payload: ${JSON.stringify(payload)}`);
      this.eventsQueue.push(payload);
    } catch (error) {
      this.log(`Failed to capture event: ${error}`);
    }
  }

  private resolveSessionId(): string {
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
      this.log(`Failed to resolve session ID: ${error}`);
    }
    return (
      crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
    );
  }

  private log(message: string): void {
    if (this.isDebugMode) {
      // eslint-disable-next-line no-console
      console.log(message);
    }
  }
}
