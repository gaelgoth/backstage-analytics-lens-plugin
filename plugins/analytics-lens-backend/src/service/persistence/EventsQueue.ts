import { LoggerService } from '@backstage/backend-plugin-api';
import { EventPayload } from '@internal/backstage-plugin-analytics-lens-common';
import fastq from 'fastq';
import type { queueAsPromised } from 'fastq';
import { EventsDatabase } from './EventsDatabase';

type Task = {
  events: EventPayload[];
};

export class EventsQueue {
  private readonly queue: queueAsPromised<Task>;
  private buffer: EventPayload[] = [];
  private readonly batchSize: number = 50; // TODO: Set batch size via config to keep memory usage in check

  constructor(
    private readonly logger: LoggerService,
    private readonly database: EventsDatabase,
  ) {
    this.queue = fastq.promise(this.worker.bind(this), 1);
  }

  private async worker(task: Task): Promise<void> {
    try {
      if (task.events.length > 0) {
        await this.database.insertEvents(task.events);
        this.logger.debug(`Persisted ${task.events.length} events`);
      }
    } catch (error) {
      this.logger.error(`Failed to persist events: ${error}`);
    }
  }

  enqueue(event: EventPayload): void {
    this.buffer.push(event);
    this.logger.debug(
      `Enqueued event. Buffer size: ${this.buffer.length}/${this.batchSize}`,
    );
    if (this.buffer.length >= this.batchSize) {
      this.flush();
    }
  }

  flush(): void {
    if (this.buffer.length === 0) {
      return;
    }
    this.logger.debug(`Flushing ${this.buffer.length} events to queue`);
    const eventsToPersist = [...this.buffer];
    this.buffer = [];
    this.queue.push({ events: eventsToPersist }).catch(err => {
      this.logger.error(`Failed to push to queue: ${err}`);
    });
  }
}
