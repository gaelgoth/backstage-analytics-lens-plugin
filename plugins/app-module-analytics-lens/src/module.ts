// TODO
import { AnalyticsLens } from './api';
import {
  AnalyticsImplementationBlueprint,
  configApiRef,
  identityApiRef,
  createFrontendModule,
  fetchApiRef,
  discoveryApiRef,
} from '@backstage/frontend-plugin-api';

const AnalyticsLensApi = AnalyticsImplementationBlueprint.make({
  name: 'analytics-lens-api',
  params: defineParams =>
    defineParams({
      deps: {
        configApi: configApiRef,
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ configApi, identityApi, discoveryApi, fetchApi }) =>
        AnalyticsLens.fromConfig(configApi, {
          discoveryApi,
          fetchApi,
          identityApi,
        }),
    }),
});

/**
 * @public
 */
export const analyticsLensModule = createFrontendModule({
  pluginId: 'app',
  extensions: [AnalyticsLensApi],
});
