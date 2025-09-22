import { appStore, registerRouter, AppRoute } from "./state/app-store";

function toUrl(route: AppRoute): string {
  switch (route.view) {
    case "home":
      return "/";
    case "queue":
      return "/queue";
    case "universe":
      return `/universe/${encodeURIComponent(route.universeId)}`;
    case "category":
      return `/universe/${encodeURIComponent(route.universeId)}/category/${encodeURIComponent(
        route.category
      )}`;
    case "page":
      return `/universe/${encodeURIComponent(route.universeId)}/page/${encodeURIComponent(
        route.pageId
      )}`;
    case "job": {
      const base = `/job/${encodeURIComponent(route.jobId)}`;
      if (route.universeId) {
        const params = new URLSearchParams({
          universe: route.universeId,
        });
        return `${base}?${params.toString()}`;
      }
      return base;
    }
    default:
      return "/";
  }
}

function parseLocation(loc: Location = window.location): AppRoute {
  const pathname = loc.pathname.replace(/\/+$/, "") || "/";
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { view: "home" };
  }

  if (segments[0] === "queue") {
    return { view: "queue" };
  }

  if (segments[0] === "job" && segments[1]) {
    const params = new URLSearchParams(loc.search ?? "");
    const universeParam = params.get("universe") || undefined;
    return {
      view: "job",
      jobId: decodeURIComponent(segments[1]),
      universeId: universeParam ? decodeURIComponent(universeParam) : undefined,
    };
  }

  if (segments[0] === "universe" && segments[1]) {
    const universeId = decodeURIComponent(segments[1]);

    if (segments[2] === "category" && segments[3]) {
      const category = decodeURIComponent(segments.slice(3).join("/"));
      return { view: "category", universeId, category };
    }

    if (segments[2] === "page" && segments[3]) {
      const pageId = decodeURIComponent(segments[3]);
      return { view: "page", universeId, pageId };
    }

    return { view: "universe", universeId };
  }

  return { view: "home" };
}

async function applyRoute(route: AppRoute) {
  switch (route.view) {
    case "home":
      appStore.actions.showHome({ skipNavigation: true });
      return;
    case "queue":
      await appStore.actions.showQueue({ skipNavigation: true });
      return;
    case "universe":
      await appStore.actions.selectUniverse(route.universeId, {
        skipNavigation: true,
        replace: true,
      });
      return;
    case "category":
      await appStore.actions.selectUniverse(route.universeId, {
        skipNavigation: true,
        replace: true,
      });
      await appStore.actions.viewCategory(route.category, { skipNavigation: true });
      return;
    case "page":
      await appStore.actions.selectUniverse(route.universeId, {
        skipNavigation: true,
        replace: true,
      });
      await appStore.actions.viewPage(route.pageId, { skipNavigation: true });
      return;
    case "job":
      if (route.universeId) {
        await appStore.actions.selectUniverse(route.universeId, {
          skipNavigation: true,
          replace: true,
        });
      }
      await appStore.actions.viewJobStatus(route.jobId, { skipNavigation: true });
      return;
    default:
      appStore.actions.showHome({ skipNavigation: true });
  }
}

export function initRouter() {
  registerRouter({
    navigate(route, options) {
      const url = toUrl(route);
      if (options?.replace) {
        window.history.replaceState(route, "", url);
      } else {
        window.history.pushState(route, "", url);
      }
    },
  });

  window.addEventListener("popstate", (event) => {
    const route = (event.state as AppRoute | undefined) ?? parseLocation();
    void applyRoute(route);
  });

  const initialRoute = parseLocation();
  window.history.replaceState(initialRoute, "", toUrl(initialRoute));
  void applyRoute(initialRoute);
}
