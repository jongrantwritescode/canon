import {
  CreateContentResponse,
  CreateUniverseResponse,
  JobStatusResponse,
  QueueStatsResponse,
  UniverseCategory,
  UniverseDetails,
  UniversePageSummary,
  UniverseSummary,
  createContentRequest,
  createUniverseRequest,
  fetchJobStatus,
  fetchQueueStats,
  fetchUniverseDetails,
  fetchUniverseEntities,
  fetchUniversePage,
  fetchUniverses,
} from "../services/api";
import { markdownToHtml } from "../utils/markdown";

export type AppView =
  | "home"
  | "universe"
  | "category"
  | "page"
  | "queue"
  | "job";

export type AppRoute =
  | { view: "home" }
  | { view: "queue" }
  | { view: "universe"; universeId: string }
  | { view: "category"; universeId: string; category: string }
  | { view: "page"; universeId: string; pageId: string }
  | { view: "job"; jobId: string; universeId?: string };

export interface SelectionState {
  universeId?: string;
  category?: string;
  pageId?: string;
  jobId?: string;
}

export interface LoadingState {
  universes: boolean;
  universe: boolean;
  category: boolean;
  page: boolean;
  queue: boolean;
  job: boolean;
  createUniverse: boolean;
  createContent: boolean;
}

export interface ErrorState {
  universes?: string;
  universe?: string;
  category?: string;
  page?: string;
  queue?: string;
  job?: string;
  createUniverse?: string;
  createContent?: string;
}

interface ModalState {
  createUniverse: boolean;
}

interface PollingState {
  queue: boolean;
}

interface UniverseContentMap {
  [category: string]: UniversePageSummary[];
}

interface PageContentState {
  page: UniversePageSummary;
  html: string;
}

export interface AppState {
  route: AppRoute;
  view: AppView;
  universes: UniverseSummary[];
  universesLoaded: boolean;
  selection: SelectionState;
  universeDetails: UniverseDetails | null;
  universeContent: UniverseContentMap;
  pageContent: PageContentState | null;
  jobStatus: JobStatusResponse | null;
  jobMessage?: string;
  queueStats: QueueStatsResponse | null;
  queueStatsUpdatedAt?: number;
  loading: LoadingState;
  errors: ErrorState;
  modal: ModalState;
  polling: PollingState;
}

export interface NavigationOptions {
  skipNavigation?: boolean;
  replace?: boolean;
}

export interface RouterAdapter {
  navigate(route: AppRoute, options?: { replace?: boolean }): void;
}

type Listener = (state: AppState) => void;

const initialState: AppState = {
  route: { view: "home" },
  view: "home",
  universes: [],
  universesLoaded: false,
  selection: {},
  universeDetails: null,
  universeContent: {},
  pageContent: null,
  jobStatus: null,
  jobMessage: undefined,
  queueStats: null,
  queueStatsUpdatedAt: undefined,
  loading: {
    universes: false,
    universe: false,
    category: false,
    page: false,
    queue: false,
    job: false,
    createUniverse: false,
    createContent: false,
  },
  errors: {},
  modal: {
    createUniverse: false,
  },
  polling: {
    queue: false,
  },
};

function mapUniverseContent(content: UniverseCategory[]): UniverseContentMap {
  return content.reduce<UniverseContentMap>((acc, entry) => {
    if (!entry || !entry.category) {
      return acc;
    }

    const pages = Array.isArray(entry.pages)
      ? entry.pages.filter((page): page is UniversePageSummary => Boolean(page && page.id))
      : [];

    acc[entry.category] = pages;
    return acc;
  }, {});
}

export class AppStore {
  private state: AppState = initialState;
  private listeners = new Set<Listener>();
  private router: RouterAdapter | null = null;
  private queuePollingTimer: number | null = null;

  readonly actions = {
    initialize: async () => {
      await Promise.all([
        this.actions.loadUniverses(),
        this.actions.refreshQueueStats({ silent: true }),
      ]);
    },

    loadUniverses: async () => {
      if (this.state.loading.universes) {
        return;
      }

      this.setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, universes: true },
        errors: { ...prev.errors, universes: undefined },
      }));

      try {
        const universes = await fetchUniverses();
        this.setState((prev) => ({
          ...prev,
          universes,
          universesLoaded: true,
          loading: { ...prev.loading, universes: false },
        }));
      } catch (error) {
        console.error("Failed to load universes", error);
        this.setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, universes: false },
          errors: {
            ...prev.errors,
            universes:
              error instanceof Error ? error.message : "Failed to load universes",
          },
        }));
      }
    },

    showHome: (options: NavigationOptions = {}) => {
      this.stopQueuePolling();
      const route: AppRoute = { view: "home" };
      if (!options.skipNavigation) {
        this.router?.navigate(route, { replace: options.replace });
      }

      this.setState((prev) => ({
        ...prev,
        route,
        view: "home",
        selection: {},
        pageContent: null,
        jobStatus: null,
        jobMessage: undefined,
      }));
    },

    showQueue: async (options: NavigationOptions = {}) => {
      this.stopQueuePolling();
      const route: AppRoute = { view: "queue" };
      if (!options.skipNavigation) {
        this.router?.navigate(route, { replace: options.replace });
      }

      this.setState((prev) => ({
        ...prev,
        route,
        view: "queue",
        selection: { ...prev.selection, category: undefined, pageId: undefined },
        errors: { ...prev.errors, queue: undefined },
      }));

      await this.actions.refreshQueueStats();
    },

    selectUniverse: async (
      universeId: string,
      options: NavigationOptions = {}
    ) => {
      this.stopQueuePolling();

      if (!this.state.universesLoaded) {
        await this.actions.loadUniverses();
      }

      const route: AppRoute = { view: "universe", universeId };
      if (!options.skipNavigation) {
        this.router?.navigate(route, { replace: options.replace });
      }

      this.setState((prev) => ({
        ...prev,
        route,
        view: "universe",
        selection: {
          universeId,
          category: undefined,
          pageId: undefined,
          jobId: prev.selection.jobId,
        },
        loading: { ...prev.loading, universe: true },
        errors: { ...prev.errors, universe: undefined },
        jobMessage: prev.jobMessage,
      }));

      try {
        const [details, content] = await Promise.all([
          fetchUniverseDetails(universeId),
          fetchUniverseEntities(universeId),
        ]);

        this.setState((prev) => ({
          ...prev,
          universeDetails: details,
          universeContent: mapUniverseContent(content),
          loading: { ...prev.loading, universe: false },
          errors: { ...prev.errors, universe: undefined },
        }));
      } catch (error) {
        console.error("Failed to load universe", error);
        this.setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, universe: false },
          errors: {
            ...prev.errors,
            universe: error instanceof Error ? error.message : "Failed to load universe",
          },
        }));
      }
    },

    viewCategory: async (
      category: string,
      options: NavigationOptions = {}
    ) => {
      const universeId = this.state.selection.universeId;
      if (!universeId) {
        return;
      }

      const route: AppRoute = { view: "category", universeId, category };
      if (!options.skipNavigation) {
        this.router?.navigate(route, { replace: options.replace });
      }

      this.setState((prev) => ({
        ...prev,
        route,
        view: "category",
        selection: {
          ...prev.selection,
          universeId,
          category,
          pageId: undefined,
        },
        loading: { ...prev.loading, category: true },
        errors: { ...prev.errors, category: undefined },
      }));

      try {
        // Ensure the latest content is loaded
        const content = await fetchUniverseEntities(universeId);
        this.setState((prev) => ({
          ...prev,
          universeContent: mapUniverseContent(content),
          loading: { ...prev.loading, category: false },
        }));
      } catch (error) {
        console.error("Failed to load category", error);
        this.setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, category: false },
          errors: {
            ...prev.errors,
            category: error instanceof Error ? error.message : "Failed to load category",
          },
        }));
      }
    },

    viewPage: async (pageId: string, options: NavigationOptions = {}) => {
      const universeId = this.state.selection.universeId;
      if (!universeId) {
        return;
      }

      const route: AppRoute = { view: "page", universeId, pageId };
      if (!options.skipNavigation) {
        this.router?.navigate(route, { replace: options.replace });
      }

      this.setState((prev) => ({
        ...prev,
        route,
        view: "page",
        selection: {
          ...prev.selection,
          universeId,
          pageId,
        },
        loading: { ...prev.loading, page: true },
        errors: { ...prev.errors, page: undefined },
      }));

      try {
        const page = await fetchUniversePage(pageId);
        const markdown = page.markdown || "";
        const html = markdownToHtml(markdown);
        this.setState((prev) => ({
          ...prev,
          pageContent: { page, html },
          loading: { ...prev.loading, page: false },
        }));
      } catch (error) {
        console.error("Failed to load page", error);
        this.setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, page: false },
          errors: {
            ...prev.errors,
            page: error instanceof Error ? error.message : "Failed to load page",
          },
        }));
      }
    },

    viewJobStatus: async (
      jobId: string,
      options: NavigationOptions = {}
    ) => {
      if (!jobId) {
        return;
      }

      this.stopQueuePolling();

      const route: AppRoute = {
        view: "job",
        jobId,
        universeId: this.state.selection.universeId,
      };

      if (!options.skipNavigation) {
        this.router?.navigate(route, { replace: options.replace });
      }

      this.setState((prev) => ({
        ...prev,
        route,
        view: "job",
        selection: { ...prev.selection, jobId },
        loading: { ...prev.loading, job: true },
        errors: { ...prev.errors, job: undefined },
      }));

      try {
        const status = await fetchJobStatus(jobId);
        this.setState((prev) => ({
          ...prev,
          jobStatus: status,
          loading: { ...prev.loading, job: false },
        }));
      } catch (error) {
        console.error("Failed to load job status", error);
        this.setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, job: false },
          errors: {
            ...prev.errors,
            job: error instanceof Error ? error.message : "Failed to load job status",
          },
        }));
      }
    },

    createUniverse: async (name: string) => {
      if (!name || this.state.loading.createUniverse) {
        return;
      }

      this.setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, createUniverse: true },
        errors: { ...prev.errors, createUniverse: undefined },
      }));

      try {
        const response: CreateUniverseResponse = await createUniverseRequest(name);
        await this.actions.loadUniverses();

        this.setState((prev) => ({
          ...prev,
          modal: { ...prev.modal, createUniverse: false },
          loading: { ...prev.loading, createUniverse: false },
          errors: { ...prev.errors, createUniverse: undefined },
        }));

        if (response.universe?.id) {
          await this.actions.selectUniverse(response.universe.id);
        }
      } catch (error) {
        console.error("Failed to create universe", error);
        this.setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, createUniverse: false },
          errors: {
            ...prev.errors,
            createUniverse:
              error instanceof Error ? error.message : "Failed to create universe",
          },
        }));
      }
    },

    createContent: async (type: string) => {
      const universeId = this.state.selection.universeId;
      if (!universeId || this.state.loading.createContent) {
        return;
      }

      this.stopQueuePolling();

      this.setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, createContent: true },
        errors: { ...prev.errors, createContent: undefined },
      }));

      try {
        const response: CreateContentResponse = await createContentRequest(
          universeId,
          type
        );

        this.setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, createContent: false },
          jobMessage: response.message,
        }));

        if (response.jobId) {
          const route: AppRoute = {
            view: "job",
            jobId: response.jobId,
            universeId,
          };

          this.setState((prev) => ({
            ...prev,
            route,
            view: "job",
            selection: { ...prev.selection, universeId, jobId: response.jobId },
            jobStatus: response.status
              ? {
                  jobId: response.jobId,
                  status: response.status,
                  data: { type },
                }
              : prev.jobStatus,
          }));

          this.router?.navigate(route, { replace: true });
          await this.actions.viewJobStatus(response.jobId, { skipNavigation: true });
        }
      } catch (error) {
        console.error("Failed to queue content creation", error);
        this.setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, createContent: false },
          errors: {
            ...prev.errors,
            createContent:
              error instanceof Error
                ? error.message
                : "Failed to queue content creation",
          },
        }));
      }
    },

    refreshQueueStats: async (options: { silent?: boolean } = {}) => {
      if (!options.silent) {
        this.setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, queue: true },
          errors: { ...prev.errors, queue: undefined },
        }));
      }

      try {
        const stats = await fetchQueueStats();
        this.setState((prev) => ({
          ...prev,
          queueStats: stats,
          queueStatsUpdatedAt: Date.now(),
          loading: { ...prev.loading, queue: false },
        }));
      } catch (error) {
        console.error("Failed to load queue stats", error);
        this.setState((prev) => ({
          ...prev,
          loading: { ...prev.loading, queue: false },
          errors: {
            ...prev.errors,
            queue: error instanceof Error ? error.message : "Failed to load queue status",
          },
        }));
      }
    },

    toggleQueuePolling: () => {
      if (this.state.polling.queue) {
        this.stopQueuePolling();
      } else {
        this.startQueuePolling();
      }
    },

    openUniverseModal: () => {
      this.setState((prev) => ({
        ...prev,
        modal: { ...prev.modal, createUniverse: true },
        errors: { ...prev.errors, createUniverse: undefined },
      }));
    },

    closeUniverseModal: () => {
      this.setState((prev) => ({
        ...prev,
        modal: { ...prev.modal, createUniverse: false },
      }));
    },
  } as const;

  getState(): AppState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  registerRouter(router: RouterAdapter) {
    this.router = router;
  }

  private startQueuePolling() {
    if (this.queuePollingTimer) {
      return;
    }

    this.queuePollingTimer = window.setInterval(() => {
      void this.actions.refreshQueueStats({ silent: true });
    }, 4000);

    this.setState((prev) => ({
      ...prev,
      polling: { ...prev.polling, queue: true },
    }));
  }

  private stopQueuePolling() {
    if (this.queuePollingTimer) {
      window.clearInterval(this.queuePollingTimer);
      this.queuePollingTimer = null;
    }

    if (this.state.polling.queue) {
      this.setState((prev) => ({
        ...prev,
        polling: { ...prev.polling, queue: false },
      }));
    }
  }

  private setState(updater: (prev: AppState) => AppState) {
    this.state = updater(this.state);
    this.listeners.forEach((listener) => listener(this.state));
  }
}

export const appStore = new AppStore();

export const actions = appStore.actions;

export const registerRouter = (router: RouterAdapter) => {
  appStore.registerRouter(router);
};
