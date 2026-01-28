import {
  DatabaseService,
  LoggerService,
  resolvePackagePath,
} from '@backstage/backend-plugin-api';
import { EventsDatabase } from './EventsDatabase';

const migrationsDir = resolvePackagePath(
  '@internal/backstage-plugin-analytics-lens-backend',
  'migrations',
);

/**
 * A Container for persistence related components in Events lens backend
 *
 * @public
 */
export type PersistenceContext = {
  eventsDatabase: EventsDatabase;
};

/**
 * A factory method to construct persistence context.
 *
 * @public
 */
export const initializePersistenceContext = async (
  database: DatabaseService,
  logger: LoggerService,
): Promise<PersistenceContext> => {
  const client = await database.getClient();

  if (!database.migrations?.skip) {
    logger.info('Performing database migration');
    await client.migrate.latest({
      directory: migrationsDir,
    });
  }

  return {
    eventsDatabase: new EventsDatabase(client),
  };
};
