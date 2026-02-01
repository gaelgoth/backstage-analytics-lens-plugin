import { EventPayload } from '@internal/backstage-plugin-analytics-lens-common';
import { Knex } from 'knex';
import { DateTime } from 'luxon';

const eventsTable = 'events';

const eventsColumns = [
  'id',
  'action',
  'subject',
  'attributes',
  'context',
  'user_entity_ref',
  'session_id',
  'timestamp',
  'created_at',
] as const;

export type DbEvents = {
  id: number;
  action: string;
  subject: string;
  attributes: string | null;
  context: string;
  user_entity_ref: string;
  session_id: string;
  timestamp: string;
  created_at: string;
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
  timestamp: DateTime.fromISO(event.timestamp).toSQLDate()!,
});

/**
 * Database service for analytics events.
 *
 * @internal
 */
export class EventsDatabase {
  constructor(private readonly db: Knex) {}

  async insertEvents(events: EventPayload[]): Promise<DbEvents[]> {
    if (events.length === 0) {
      return [];
    }
    const dbEvents = events.map(EventsToDb);
    return this.db<DbEvents>(eventsTable)
      .insert(dbEvents)
      .returning(eventsColumns);
  }
}
