import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './router';

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
        httpAuth: coreServices.httpAuth,
        httpRouter: coreServices.httpRouter,
      },
      async init({ httpAuth, httpRouter }) {
        httpRouter.use(
          await createRouter({
            httpAuth,
          }),
        );
      },
    });
  },
});
