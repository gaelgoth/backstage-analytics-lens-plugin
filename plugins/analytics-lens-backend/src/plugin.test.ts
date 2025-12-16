import { startTestBackend } from '@backstage/backend-test-utils';
import { analyticsLensPlugin } from './plugin';
import request from 'supertest';

describe('plugin', () => {
  it('should respond OK on health', async () => {
    expect.hasAssertions();

    const { server } = await startTestBackend({
      features: [analyticsLensPlugin],
    });

    const response = await request(server).get('/api/analytics-lens/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
