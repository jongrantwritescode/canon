import 'standards-ui/styles.css';
import { DEFAULT_TOKENS, init as initStandardsUI } from 'standards-ui';

import { canonTokens } from './design-system/tokens';
import { appStore } from './state/app-store';
import { parseLocation, routeToPath, type NavigateOptions, type Route } from './router';

import './components/canon-home';
import './components/canon-universe-sidebar';
import './components/canon-universe-list';
import './components/canon-universe-detail';
import './components/canon-category-panel';
import './components/canon-page-viewer';
import './components/canon-queue-dashboard';
import './components/canon-help';
import './components/canon-universe-modal';
import './components/canon-app';

function mergeTokens() {
  const base = DEFAULT_TOKENS ?? {};
  const merged = {
    ...base,
    ...canonTokens,
    color: {
      ...(base.color ?? {}),
      ...(canonTokens.color ?? {}),
    },
    spacing: {
      ...(base.spacing ?? {}),
      ...(canonTokens.spacing ?? {}),
    },
    typography: {
      ...(base.typography ?? {}),
      ...(canonTokens.typography ?? {}),
    },
    layout: {
      ...(base.layout ?? {}),
      ...(canonTokens.layout ?? {}),
    },
    components: {
      ...(base.components ?? {}),
      ...(canonTokens.components ?? {}),
      button: {
        ...(base.components?.button ?? {}),
        ...(canonTokens.components?.button ?? {}),
        variants: {
          ...(base.components?.button?.variants ?? {}),
          ...(canonTokens.components?.button?.variants ?? {}),
        },
      },
      card: {
        ...(base.components?.card ?? {}),
        ...(canonTokens.components?.card ?? {}),
      },
      page: {
        ...(base.components?.page ?? {}),
        ...(canonTokens.components?.page ?? {}),
      },
    },
  };

  return merged;
}

initStandardsUI(mergeTokens());

function applyRoute(route: Route, options?: NavigateOptions & { skipHistory?: boolean }) {
  appStore.setRouteFromRouter(route);

  const path = routeToPath(route);

  if (options?.skipHistory) {
    window.history.replaceState(route, '', path);
    return;
  }

  if (options?.replace) {
    window.history.replaceState(route, '', path);
  } else {
    window.history.pushState(route, '', path);
  }
}

appStore.bindNavigator((route, options) => applyRoute(route, options));

const initialRoute = (window.history.state as Route | null) ?? parseLocation();
applyRoute(initialRoute, { replace: true });

window.addEventListener('popstate', (event) => {
  const route = (event.state as Route | null) ?? parseLocation();
  applyRoute(route, { skipHistory: true });
});

appStore.initialize();
