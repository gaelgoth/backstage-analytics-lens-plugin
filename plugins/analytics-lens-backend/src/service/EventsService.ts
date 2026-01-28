import { LoggerService, SchedulerService } from '@backstage/backend-plugin-api';
import { EventPayload } from '@internal/backstage-plugin-analytics-lens-common';
import { EventsDatabase } from './persistence/EventsDatabase';
import { EventsQueue } from './persistence/EventsQueue';

export class EventsService {
  private readonly queue: EventsQueue;

  private constructor(
    private readonly logger: LoggerService,
    private readonly database: EventsDatabase,
    private readonly scheduler: SchedulerService,
  ) {
    this.queue = new EventsQueue(this.logger, this.database);
  }

  static async create(options: {
    logger: LoggerService;
    database: EventsDatabase;
    scheduler: SchedulerService;
  }): Promise<EventsService> {
    const service = new EventsService(
      options.logger,
      options.database,
      options.scheduler,
    );
    await service.initialize();
    return service;
  }

  private async initialize() {
    await this.scheduler.scheduleTask({
      id: 'analytics-lens_events_queue_flush',
      frequency: { seconds: 5 },
      timeout: { seconds: 15 },
      fn: async () => {
        this.queue.flush();
      },
      scope: 'local',
    });
  }

  async persistEvent(event: EventPayload): Promise<void> {
    this.queue.enqueue(event);
  }
}
