import { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
import express from 'express';
import { createOpenApiRouter } from './schema/openapi';
import { EventsService } from './service/EventsService';

export async function createRouter({
  httpAuth: _httpAuth,
  logger,
  eventsService,
}: {
  httpAuth: HttpAuthService;
  logger: LoggerService;
  eventsService: EventsService;
}): Promise<express.Router> {
  const router = await createOpenApiRouter();
  router.use(express.json());

  router.get('/health', async (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  router.post('/events', async (req, res) => {
    const events = req.body;
    try {
      if (Array.isArray(events)) {
        for (const event of events) {
          await eventsService.persistEvent(event);
        }
      }
      res.status(204).end();
    } catch (error) {
      logger.error(`Failed to process events: ${error}`);
      res.status(500).end();
    }
  });

  return router;
}
