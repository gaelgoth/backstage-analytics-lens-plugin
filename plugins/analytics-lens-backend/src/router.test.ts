import { mockErrorHandler, mockServices } from '@backstage/backend-test-utils';
import { wrapInOpenApiTestServer } from '@backstage/backend-openapi-utils/testUtils';
import express from 'express';
import { Server } from 'node:http';
import request from 'supertest';

import { createRouter } from './router';

describe('createRouter', () => {
  let app: express.Express | Server;

  beforeEach(async () => {
    const router = await createRouter({
      httpAuth: mockServices.httpAuth(),
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
});
