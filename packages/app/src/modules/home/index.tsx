import {
  PageBlueprint,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import { compatWrapper } from '@backstage/core-compat-api';
import { HomePage } from './HomePage';

export const homePage = PageBlueprint.make({
  params: {
    path: '/',
    loader: async () => compatWrapper(<HomePage />),
  },
});

export const homeModule = createFrontendModule({
  pluginId: 'app',
  extensions: [homePage],
});

export default homeModule;
