import { getCategoryById, getUniverseById, universes } from "../data/universes";

export type RouteName = "home" | "universe" | "category";

export interface RouteState {
  name: RouteName;
  universeId?: string;
  categoryId?: string;
}

export interface AppState {
  route: RouteState;
  selectedUniverseId: string | null;
  selectedCategoryId: string | null;
  isUniverseModalOpen: boolean;
}

export type StateListener = (state: AppState) => void;

type Action =
  | { type: "NAVIGATE"; payload: RouteState }
  | { type: "SELECT_UNIVERSE"; payload: { universeId: string } }
  | {
      type: "SELECT_CATEGORY";
      payload: { universeId: string; categoryId: string };
    }
  | { type: "OPEN_MODAL" }
  | { type: "CLOSE_MODAL" }
  | { type: "TOGGLE_MODAL"; payload?: { open: boolean } };

const initialRoute: RouteState = { name: "home" };

const initialState: AppState = {
  route: initialRoute,
  selectedUniverseId: null,
  selectedCategoryId: null,
  isUniverseModalOpen: false,
};

class DataStarStore {
  private state: AppState;

  private listeners: Set<StateListener> = new Set();

  constructor(initial: AppState) {
    this.state = initial;
  }

  getState(): AppState {
    return this.state;
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  dispatch(action: Action): void {
    const nextState = this.reduce(this.state, action);

    if (nextState === this.state) {
      return;
    }

    this.state = nextState;
    this.listeners.forEach((listener) => listener(this.state));
  }

  private reduce(state: AppState, action: Action): AppState {
    switch (action.type) {
      case "NAVIGATE": {
        const { name, universeId, categoryId } = action.payload;

        return {
          ...state,
          route: { name, universeId, categoryId },
          selectedUniverseId: universeId ?? state.selectedUniverseId,
          selectedCategoryId: categoryId ?? null,
          isUniverseModalOpen: name === "home" ? false : state.isUniverseModalOpen,
        };
      }
      case "SELECT_UNIVERSE": {
        const { universeId } = action.payload;
        const universeExists = Boolean(getUniverseById(universeId));

        if (!universeExists) {
          return state;
        }

        return {
          ...state,
          route: { name: "universe", universeId },
          selectedUniverseId: universeId,
          selectedCategoryId: null,
          isUniverseModalOpen: false,
        };
      }
      case "SELECT_CATEGORY": {
        const { universeId, categoryId } = action.payload;
        const categoryExists = Boolean(getCategoryById(universeId, categoryId));

        if (!categoryExists) {
          return state;
        }

        return {
          ...state,
          route: { name: "category", universeId, categoryId },
          selectedUniverseId: universeId,
          selectedCategoryId: categoryId,
          isUniverseModalOpen: false,
        };
      }
      case "OPEN_MODAL": {
        return { ...state, isUniverseModalOpen: true };
      }
      case "CLOSE_MODAL": {
        return { ...state, isUniverseModalOpen: false };
      }
      case "TOGGLE_MODAL": {
        const explicit = action.payload?.open;
        const isOpen = explicit ?? !state.isUniverseModalOpen;
        return { ...state, isUniverseModalOpen: isOpen };
      }
      default:
        return state;
    }
  }
}

export const store = new DataStarStore(initialState);

export const actions = {
  navigate: (route: RouteState) => store.dispatch({ type: "NAVIGATE", payload: route }),
  selectUniverse: (universeId: string) =>
    store.dispatch({ type: "SELECT_UNIVERSE", payload: { universeId } }),
  selectCategory: (universeId: string, categoryId: string) =>
    store.dispatch({
      type: "SELECT_CATEGORY",
      payload: { universeId, categoryId },
    }),
  openUniverseModal: () => store.dispatch({ type: "OPEN_MODAL" }),
  closeUniverseModal: () => store.dispatch({ type: "CLOSE_MODAL" }),
  toggleUniverseModal: (open?: boolean) =>
    store.dispatch({
      type: "TOGGLE_MODAL",
      payload: open === undefined ? undefined : { open },
    }),
};

export const selectUniverses = () => universes;

export const selectActiveUniverse = (state: AppState) =>
  state.selectedUniverseId
    ? getUniverseById(state.selectedUniverseId)
    : undefined;

export const selectActiveCategory = (state: AppState) =>
  state.selectedUniverseId && state.selectedCategoryId
    ? getCategoryById(state.selectedUniverseId, state.selectedCategoryId)
    : undefined;
