import { HttpAuthService } from '@backstage/backend-plugin-api';
import express from 'express';
import { createOpenApiRouter } from './schema/openapi';

export async function createRouter({
  httpAuth: _httpAuth,
}: {
  httpAuth: HttpAuthService;
}): Promise<express.Router> {
  const router = await createOpenApiRouter();
  router.use(express.json());

  router.get('/health', async (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  return router;
}
