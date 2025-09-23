export type HomeRoute = { view: 'home' };
export type UniversesRoute = { view: 'universes' };
export type QueueRoute = { view: 'queue' };
export type HelpRoute = { view: 'help' };
export type UniverseRoute = { view: 'universe'; universeId: string };
export type CategoryRoute = {
  view: 'category';
  universeId: string;
  categoryName: string;
};
export type PageRoute = {
  view: 'page';
  pageId: string;
  universeId?: string;
  categoryName?: string;
};

export type Route =
  | HomeRoute
  | UniversesRoute
  | QueueRoute
  | HelpRoute
  | UniverseRoute
  | CategoryRoute
  | PageRoute;

export type NavigateOptions = {
  replace?: boolean;
  skipHistory?: boolean;
};

function decodeSegment(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  try {
    return decodeURIComponent(value);
  } catch (error) {
    console.warn('Failed to decode route segment', value, error);
    return value;
  }
}

export function parseLocation(location: Location = window.location): Route {
  const path = location.pathname.replace(/\/+$/, '');
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { view: 'home' };
  }

  if (segments[0] === 'universes') {
    return { view: 'universes' };
  }

  if (segments[0] === 'queue') {
    return { view: 'queue' };
  }

  if (segments[0] === 'help') {
    return { view: 'help' };
  }

  if (segments[0] === 'universe' && segments[1]) {
    const universeId = decodeSegment(segments[1]) ?? segments[1];

    if (segments[2] === 'category' && segments[3]) {
      return {
        view: 'category',
        universeId,
        categoryName: decodeSegment(segments[3]) ?? segments[3],
      };
    }

    return { view: 'universe', universeId };
  }

  if (segments[0] === 'page' && segments[1]) {
    const urlSearch = location.search ? new URLSearchParams(location.search) : null;
    const universeId = urlSearch?.get('universe') ?? undefined;
    const categoryName = urlSearch?.get('category') ?? undefined;

    return {
      view: 'page',
      pageId: decodeSegment(segments[1]) ?? segments[1],
      universeId: universeId ? decodeSegment(universeId) : undefined,
      categoryName: categoryName ? decodeSegment(categoryName) : undefined,
    };
  }

  return { view: 'home' };
}

export function routeToPath(route: Route): string {
  switch (route.view) {
    case 'home':
      return '/';
    case 'universes':
      return '/universes';
    case 'queue':
      return '/queue';
    case 'help':
      return '/help';
    case 'universe':
      return `/universe/${encodeURIComponent(route.universeId)}`;
    case 'category':
      return `/universe/${encodeURIComponent(route.universeId)}/category/${encodeURIComponent(
        route.categoryName
      )}`;
    case 'page': {
      const base = `/page/${encodeURIComponent(route.pageId)}`;
      const params = new URLSearchParams();
      if (route.universeId) {
        params.set('universe', route.universeId);
      }
      if (route.categoryName) {
        params.set('category', route.categoryName);
      }
      const query = params.toString();
      return query ? `${base}?${query}` : base;
    }
    default:
      return '/';
  }
}
