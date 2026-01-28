import type {
  DefaultApiClient,
  EventPayload,
} from '@internal/backstage-plugin-analytics-lens-common';

/**
 * Queue that buffers analytics events and sends them to the analytics-lens-backend in batches.
 */
export class EventsQueue {
  private readonly events: EventPayload[] = [];
  private readonly client: DefaultApiClient;
  private readonly flushIntervalMs: number;
  private readonly maxBatchSize: number;
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private isDebugMode: boolean;

  constructor(options: {
    client: DefaultApiClient;
    flushIntervalMs?: number;
    maxBatchSize?: number;
    isDebugMode?: boolean;
  }) {
    this.client = options.client;
    this.flushIntervalMs = options.flushIntervalMs ?? 500;
    this.maxBatchSize = options.maxBatchSize ?? 10;
    this.isDebugMode = options.isDebugMode ?? true; // TODO: set to false by default and enabled via app-config.yaml

    this.startFlushTimer();
  }

  push(event: EventPayload): void {
    this.events.push(event);
    if (this.events.length >= this.maxBatchSize) {
      this.flush();
    }
  }

  private startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushIntervalMs);
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) {
      return;
    }

    const batch = [...this.events];
    this.events.length = 0;

    try {
      this.log(`Flushing ${batch.length} events...`);
      await this.client.eventsPost({ body: batch });
      this.log(`Successfully flushed ${batch.length} events.`);
    } catch (error) {
      this.log(`Failed to flush events: ${error}`);
    }
  }

  private log(message: string): void {
    if (this.isDebugMode) {
      // eslint-disable-next-line no-console
      console.log(`[EventsQueue] ${message}`);
    }
  }

  dispose(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.events.length > 0) {
      this.flush().catch(error =>
        this.log(`Failed to flush on dispose: ${error}`),
      );
    }
  }
}
