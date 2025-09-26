import type { NavigateOptions, Route } from "../router";
import {
  createContent,
  createUniverse,
  fetchPageFragment,
  fetchPageMetadata,
  fetchQueueStats,
  fetchAllJobs,
  fetchUniverse,
  fetchUniverseCategories,
  fetchUniverseGraph,
  fetchUniverses,
  type CreateUniverseResponse,
  type JobInfo,
  type PageMetadata,
  type QueueStats,
  type UniverseCategory,
  type UniverseDetail,
  type UniversePageSummary,
  type UniverseSummary,
  type UniverseGraph,
} from "../services/api";

type Listener = (state: AppState) => void;

type LoadingKey = keyof AppState["loading"];
type ErrorKey = keyof AppState["errors"];

type CategoryKey = string;

type QueuePollingHandle = ReturnType<typeof window.setInterval> | undefined;

export interface PageContent {
  metadata?: PageMetadata;
  html?: string;
}

export interface QueueSnapshot extends QueueStats {
  fetchedAt: number;
}

export interface AppState {
  route: Route;
  universes: UniverseSummary[];
  universesLoaded: boolean;
  universeDetails: Record<string, UniverseDetail>;
  universeCategories: Record<string, UniverseCategory[]>;
  categoryPages: Record<CategoryKey, UniversePageSummary[]>;
  universeGraphs: Record<string, UniverseGraph | undefined>;
  pages: Record<string, PageContent>;
  queue?: QueueSnapshot;
  jobs: JobInfo[];
  loading: {
    universes: boolean;
    universe: boolean;
    category: boolean;
    page: boolean;
    queue: boolean;
    graph: boolean;
  };
  errors: {
    universes?: string;
    universe?: string;
    category?: string;
    page?: string;
    queue?: string;
    graph?: string;
    modal?: string;
  };
  modal: {
    open: boolean;
    submitting: boolean;
    error?: string;
  };
  lastContentHtml?: string;
}

const initialState: AppState = {
  route: { view: "home" },
  universes: [],
  universesLoaded: false,
  universeDetails: {},
  universeCategories: {},
  categoryPages: {},
  universeGraphs: {},
  pages: {},
  queue: undefined,
  jobs: [],
  loading: {
    universes: false,
    universe: false,
    category: false,
    page: false,
    queue: false,
    graph: false,
  },
  errors: {},
  modal: {
    open: false,
    submitting: false,
    error: undefined,
  },
  lastContentHtml: undefined,
};

export class AppStore {
  private state: AppState = initialState;
  private listeners = new Set<Listener>();
  private navigator?: (route: Route, options?: NavigateOptions) => void;
  private queuePollingHandle: QueuePollingHandle;
  private pendingUniverses = false;
  private pendingUniverseDetails = new Set<string>();
  private pendingUniverseCategories = new Set<string>();
  private pendingUniverseGraphs = new Set<string>();
  private pendingPageLoads = new Set<string>();

  initialize(): void {
    this.ensureDataForRoute(this.state.route);
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getState(): AppState {
    return this.state;
  }

  bindNavigator(
    navigator: (route: Route, options?: NavigateOptions) => void
  ): void {
    this.navigator = navigator;
  }

  navigate(route: Route, options?: NavigateOptions): void {
    if (this.navigator) {
      this.navigator(route, options);
      return;
    }

    this.applyRoute(route);
  }

  setRouteFromRouter(route: Route): void {
    this.applyRoute(route);
  }

  openUniverseModal(): void {
    this.patch({
      modal: {
        open: true,
        submitting: false,
        error: undefined,
      },
    });
  }

  closeUniverseModal(): void {
    this.patch({
      modal: {
        open: false,
        submitting: false,
        error: undefined,
      },
    });
  }

  async submitUniverse(name: string): Promise<CreateUniverseResponse | void> {
    const trimmedName = name.trim();
    if (!trimmedName) {
      this.patch({
        modal: {
          ...this.state.modal,
          error: "Universe name is required.",
        },
      });
      return;
    }

    this.patch({
      modal: {
        ...this.state.modal,
        submitting: true,
        error: undefined,
      },
    });

    try {
      const response = await createUniverse(trimmedName);
      await this.loadUniverses();

      this.patch({
        modal: {
          open: false,
          submitting: false,
          error: undefined,
        },
      });

      if (response?.universe?.id) {
        this.navigate({ view: "universe", universeId: response.universe.id });
      }

      return response;
    } catch (error) {
      this.patch({
        modal: {
          ...this.state.modal,
          submitting: false,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    }
  }

  refreshQueue(): void {
    void this.loadQueueStats();
  }

  async queueContent(universeId: string, type: string): Promise<void> {
    this.setError("category");

    try {
      const html = await createContent(universeId, type);
      this.patch({ lastContentHtml: html });
      await this.hydrateUniverseCategories(universeId);
    } catch (error) {
      this.setError(
        "category",
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  private applyRoute(route: Route): void {
    const previousRoute = this.state.route;
    this.patch({ route });

    if (route.view === "queue") {
      this.ensureQueuePolling();
    } else if (previousRoute.view === "queue") {
      this.stopQueuePolling();
    }

    this.ensureDataForRoute(route);
  }

  private ensureDataForRoute(route: Route): void {
    if (!this.state.universesLoaded && !this.pendingUniverses) {
      void this.loadUniverses();
    }

    if (
      route.view === "universe" ||
      route.view === "category" ||
      route.view === "page"
    ) {
      const universeId =
        route.view === "page"
          ? (route.universeId ?? undefined)
          : route.universeId;
      if (universeId) {
        if (!this.state.universeDetails[universeId]) {
          void this.loadUniverse(universeId);
        }

        if (!this.state.universeCategories[universeId]) {
          void this.hydrateUniverseCategories(universeId);
        }
      }
    }

    if (route.view === "category") {
      void this.ensureCategoryPages(route.universeId, route.categoryName);
    }

    if (route.view === "page") {
      if (!this.state.pages[route.pageId]) {
        void this.loadPage(route.pageId);
      }
    }

    if (route.view === "queue") {
      void this.loadQueueStats();
    }
  }

  private async loadUniverses(): Promise<void> {
    if (this.pendingUniverses) {
      return;
    }

    this.pendingUniverses = true;
    this.updateLoading("universes", true);
    this.setError("universes");

    try {
      const universes = await fetchUniverses();
      this.patch({
        universes,
        universesLoaded: true,
      });
    } catch (error) {
      this.patch({ universesLoaded: false });
      this.setError(
        "universes",
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      this.pendingUniverses = false;
      this.updateLoading("universes", false);
    }
  }

  private async loadUniverse(universeId: string): Promise<void> {
    if (this.pendingUniverseDetails.has(universeId)) {
      return;
    }

    this.pendingUniverseDetails.add(universeId);
    this.updateLoading("universe", true);
    this.setError("universe");

    try {
      const detail = await fetchUniverse(universeId);
      if (!detail) {
        throw new Error("Universe not found");
      }

      this.patch({
        universeDetails: {
          ...this.state.universeDetails,
          [universeId]: detail,
        },
      });
    } catch (error) {
      this.setError(
        "universe",
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      this.pendingUniverseDetails.delete(universeId);
      this.updateLoading("universe", false);
    }
  }

  private async hydrateUniverseCategories(universeId: string): Promise<void> {
    if (this.pendingUniverseCategories.has(universeId)) {
      return;
    }

    this.pendingUniverseCategories.add(universeId);
    this.updateLoading("category", true);

    try {
      const categories = await fetchUniverseCategories(universeId);
      const updatedPages: Record<CategoryKey, UniversePageSummary[]> = {
        ...this.state.categoryPages,
      };

      for (const category of categories) {
        updatedPages[this.getCategoryKey(universeId, category.category)] =
          category.pages ?? [];
      }

      this.patch({
        universeCategories: {
          ...this.state.universeCategories,
          [universeId]: categories,
        },
        categoryPages: updatedPages,
      });
    } catch (error) {
      this.setError(
        "category",
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      this.pendingUniverseCategories.delete(universeId);
      this.updateLoading("category", false);
    }
  }

  private async ensureCategoryPages(
    universeId: string,
    categoryName: string
  ): Promise<void> {
    const key = this.getCategoryKey(universeId, categoryName);
    if (this.state.categoryPages[key]) {
      return;
    }

    if (this.state.universeCategories[universeId]) {
      const match = this.state.universeCategories[universeId].find(
        (category) =>
          category.category.toLowerCase() === categoryName.toLowerCase()
      );
      if (match) {
        this.patch({
          categoryPages: {
            ...this.state.categoryPages,
            [key]: match.pages ?? [],
          },
        });
        return;
      }
    }

    await this.hydrateUniverseCategories(universeId);
  }

  ensureUniverseGraph(universeId: string): void {
    if (!universeId) {
      return;
    }

    if (this.state.universeGraphs[universeId]) {
      return;
    }

    void this.loadUniverseGraph(universeId);
  }

  private async loadUniverseGraph(universeId: string): Promise<void> {
    if (this.pendingUniverseGraphs.has(universeId)) {
      return;
    }

    this.pendingUniverseGraphs.add(universeId);
    this.updateLoading("graph", true);
    this.setError("graph");

    try {
      const graph = await fetchUniverseGraph(universeId);
      this.patch({
        universeGraphs: {
          ...this.state.universeGraphs,
          [universeId]: graph,
        },
      });
    } catch (error) {
      this.setError(
        "graph",
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      this.pendingUniverseGraphs.delete(universeId);
      this.updateLoading("graph", false);
    }
  }

  private async loadPage(pageId: string): Promise<void> {
    if (this.pendingPageLoads.has(pageId)) {
      return;
    }

    this.pendingPageLoads.add(pageId);
    this.updateLoading("page", true);
    this.setError("page");

    try {
      const [metadata, html] = await Promise.all([
        fetchPageMetadata(pageId),
        fetchPageFragment(pageId),
      ]);

      this.patch({
        pages: {
          ...this.state.pages,
          [pageId]: { metadata, html },
        },
      });
    } catch (error) {
      this.setError(
        "page",
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      this.pendingPageLoads.delete(pageId);
      this.updateLoading("page", false);
    }
  }

  private async loadQueueStats(): Promise<void> {
    this.updateLoading("queue", true);
    this.setError("queue");

    try {
      const [stats, jobs] = await Promise.all([
        fetchQueueStats(),
        fetchAllJobs(),
      ]);
      this.patch({
        queue: {
          ...stats,
          fetchedAt: Date.now(),
        },
        jobs,
      });
    } catch (error) {
      this.setError(
        "queue",
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      this.updateLoading("queue", false);
    }
  }

  private ensureQueuePolling(): void {
    if (this.queuePollingHandle) {
      return;
    }

    void this.loadQueueStats();

    this.queuePollingHandle = window.setInterval(() => {
      void this.loadQueueStats();
    }, 5000);
  }

  private stopQueuePolling(): void {
    if (this.queuePollingHandle) {
      window.clearInterval(this.queuePollingHandle);
      this.queuePollingHandle = undefined;
    }
  }

  private getCategoryKey(
    universeId: string,
    categoryName: string
  ): CategoryKey {
    return `${universeId}::${categoryName.toLowerCase()}`;
  }

  private updateLoading(key: LoadingKey, value: boolean): void {
    this.patch({
      loading: {
        ...this.state.loading,
        [key]: value,
      },
    });
  }

  private setError(key: ErrorKey, value?: string): void {
    const nextErrors = { ...this.state.errors };
    if (value) {
      nextErrors[key] = value;
    } else {
      delete nextErrors[key];
    }

    this.patch({ errors: nextErrors });
  }

  private patch(partial: Partial<AppState>): void {
    this.state = {
      ...this.state,
      ...partial,
    };
    this.notify();
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export const appStore = new AppStore();
