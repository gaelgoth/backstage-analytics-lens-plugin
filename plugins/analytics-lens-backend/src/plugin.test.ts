import {
  mockServices,
  startTestBackend,
  TestDatabases,
} from '@backstage/backend-test-utils';
import request from 'supertest';
import { analyticsLensPlugin } from './plugin';

describe('analyticsLensPlugin', () => {
  const databases = TestDatabases.create();

  it('should accept events and persist them', async () => {
    const knex = await databases.init('SQLITE_3');
    const scheduler = mockServices.scheduler.mock();

    const { server } = await startTestBackend({
      features: [
        analyticsLensPlugin,
        mockServices.database.factory({ knex }),
        mockServices.auth.factory(),
        mockServices.httpAuth.factory(),
        scheduler.factory,
      ],
    });

    const events = Array.from({ length: 55 }, (_, i) => ({
      action: 'navigate',
      subject: '/',
      attributes: {},
      context: { pluginId: 'app', extensionId: 'app' },
      userEntityRef: 'user:development/guest',
      sessionId: `test-session-${i}`,
      timestamp: new Date().toISOString(),
    }));

    await request(server)
      .post('/api/analytics-lens/events')
      .send(events)
      .expect(204);

    // Wait for async flush - this is a bit flaky without exposing internals or waiting
    // In a real integration test, we might want to check the DB content
    await scheduler.triggerTask('analytics-lens_events_flush');

    await new Promise(resolve => setTimeout(resolve, 500));

    const dbEvents = await knex('events').select('*');
    expect(dbEvents.length).toBeGreaterThan(0);
    expect(dbEvents[0]).toMatchObject({
      action: 'navigate',
      subject: '/',
    });
  });

  it('should respond OK on health', async () => {
    expect.hasAssertions();

    const knex = await databases.init('SQLITE_3');

    const { server } = await startTestBackend({
      features: [
        analyticsLensPlugin,
        mockServices.database.factory({ knex }),
        mockServices.auth.factory(),
        mockServices.httpAuth.factory(),
      ],
    });

    const response = await request(server).get('/api/analytics-lens/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
