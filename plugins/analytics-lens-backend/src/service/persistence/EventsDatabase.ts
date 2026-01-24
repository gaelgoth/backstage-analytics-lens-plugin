import { EventPayload } from '@internal/backstage-plugin-analytics-lens-common';
import { Knex } from 'knex';

const eventsTable = 'events';

type DbEvents = {
  id: number;
  action: string;
  subject: string;
  attributes: string | null;
  context: string;
  user_entity_ref: string;
  session_id: string;
  timestamp: Date;
  created_at: Date;
};

const EventsToDb = (
  event: EventPayload,
): Omit<DbEvents, 'id' | 'created_at'> => ({
  action: event.action,
  subject: event.subject,
  attributes: event.attributes ? JSON.stringify(event.attributes) : null,
  context: JSON.stringify(event.context),
  user_entity_ref: event.userEntityRef,
  session_id: event.sessionId,
  timestamp: new Date(event.timestamp),
});

/**
 * Database service for analytics events.
 *
 * @internal
 */
export class EventsDatabase {
  constructor(private readonly db: Knex) {}

  async insertEvents(events: EventPayload[]): Promise<void> {
    if (events.length === 0) {
      return;
    }
    const dbEvents = events.map(EventsToDb);
    await this.db(eventsTable).insert(dbEvents);
  }
}
