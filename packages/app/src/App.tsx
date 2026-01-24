import { createApp } from '@backstage/frontend-defaults';
import catalogPlugin from '@backstage/plugin-catalog/alpha';
import { navModule } from './modules/nav';
import analyticsLensModule from '@internal/backstage-plugin-app-module-analytics-lens/alpha';
import homeModule from './modules/home';

export default createApp({
  features: [catalogPlugin, homeModule, navModule, analyticsLensModule],
});
