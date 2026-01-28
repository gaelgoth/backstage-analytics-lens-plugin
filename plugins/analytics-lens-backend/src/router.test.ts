import { mockErrorHandler, mockServices } from '@backstage/backend-test-utils';
import { wrapInOpenApiTestServer } from '@backstage/backend-openapi-utils/testUtils';
import express from 'express';
import { Server } from 'node:http';
import request from 'supertest';

import { createRouter } from './router';

describe('createRouter', () => {
  let app: express.Express | Server;

  beforeEach(async () => {
    const eventsService = {
      persistEvent: jest.fn(),
    };
    const router = await createRouter({
      httpAuth: mockServices.httpAuth(),
      logger: mockServices.logger.mock(),
      eventsService: eventsService as any,
    });
    app = wrapInOpenApiTestServer(
      express().use(router).use(mockErrorHandler()),
    );
  });

  it('should respond OK on health', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('should accept event batch', async () => {
    const response = await request(app)
      .post('/events')
      .set('content-type', 'application/json')
      .send([
        {
          action: 'navigate',
          subject: '/',
          attributes: {},
          context: { pluginId: 'app', extensionId: 'app' },
          userEntityRef: 'user:development/guest',
          sessionId: '3ebc9cc1-fe12-4e21-84c9-5ea0014f58ad',
          timestamp: '2026-01-07T12:14:04.078Z',
        },
      ]);

    expect(response.status).toBe(204);
  });

  it('should reject invalid event batch', async () => {
    // TODO: Will not reject but store in poison queue in next iteration
    const response = await request(app)
      .post('/events')
      .set('content-type', 'application/json')
      .send([
        {
          // Missing required 'action' field
          subject: '/',
          userEntityRef: 'user:development/guest',
          sessionId: '3ebc9cc1-fe12-4e21-84c9-5ea0014f58ad',
          timestamp: '2026-01-07T12:14:04.078Z',
          context: { pluginId: 'app', extensionId: 'app' },
        },
      ]);

    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
