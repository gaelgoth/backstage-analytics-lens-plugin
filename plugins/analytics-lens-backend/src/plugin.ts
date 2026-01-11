import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';
import { initializePersistenceContext } from './service/persistence';
import { EventsService } from './service/EventsService';

/**
 * analyticsLensPlugin backend plugin
 *
 * @public
 */
export const analyticsLensPlugin = createBackendPlugin({
  pluginId: 'analytics-lens',
  register(env) {
    env.registerInit({
      deps: {
        database: coreServices.database,
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        scheduler: coreServices.scheduler,
      },
      async init({ database, httpAuth, httpRouter, logger, scheduler }) {
        const { eventsDatabase } = await initializePersistenceContext(
          database,
          logger,
        );

        const eventsService = await EventsService.create({
          logger,
          database: eventsDatabase,
          scheduler,
        });

        httpRouter.use(
          await createRouter({
            httpAuth,
            logger,
            eventsService,
          }),
        );
      },
    });
  },
});
