import styles from "./canon-app.css?inline";
import type { UniverseCategory, UniverseSummary } from "../data/universes";
import {
  actions,
  AppState,
  RouteName,
  selectActiveCategory,
  selectActiveUniverse,
  selectUniverses,
  store,
} from "../state/store";

class CanonApp extends HTMLElement {
  private unsubscribe?: () => void;

  private state: AppState = store.getState();

  private readonly onStoreUpdate = (nextState: AppState) => {
    this.state = nextState;
    this.render();
  };

  private readonly boundHandleClick = (event: Event) => this.handleClick(event);

  private readonly boundHandleKeydown = (event: KeyboardEvent) =>
    this.handleKeydown(event);

  private readonly boundHandleShadowKeydown = (event: KeyboardEvent) =>
    this.handleShadowKeydown(event);

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      return;
    }

    this.shadowRoot.addEventListener("click", this.boundHandleClick);
    this.shadowRoot.addEventListener("keydown", this.boundHandleShadowKeydown);
    window.addEventListener("keydown", this.boundHandleKeydown);

    this.unsubscribe = store.subscribe(this.onStoreUpdate);
  }

  disconnectedCallback(): void {
    this.shadowRoot?.removeEventListener("click", this.boundHandleClick);
    this.shadowRoot?.removeEventListener("keydown", this.boundHandleShadowKeydown);
    window.removeEventListener("keydown", this.boundHandleKeydown);
    this.unsubscribe?.();
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape" && this.state.isUniverseModalOpen) {
      actions.closeUniverseModal();
    }
  }

  private handleShadowKeydown(event: KeyboardEvent): void {
    if (!this.state) {
      return;
    }

    if (event.key === "Escape" && this.state.isUniverseModalOpen) {
      event.preventDefault();
      actions.closeUniverseModal();
      return;
    }

    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (target?.getAttribute("role") === "button") {
      event.preventDefault();
      target.click();
    }
  }

  private handleClick(event: Event): void {
    const target = event.target as HTMLElement | null;

    if (!target) {
      return;
    }

    const routeTarget = target.closest<HTMLElement>("[data-route]");

    if (routeTarget?.dataset.route) {
      event.preventDefault();
      this.navigate(routeTarget.dataset.route as RouteName);
      return;
    }

    const openModalTarget = target.closest<HTMLElement>("[data-action=open-modal]");
    if (openModalTarget) {
      actions.openUniverseModal();
      return;
    }

    const closeModalTarget = target.closest<HTMLElement>("[data-action=close-modal]");
    if (closeModalTarget) {
      actions.closeUniverseModal();
      return;
    }

    const universeTarget = target.closest<HTMLElement>("[data-action=select-universe]");
    if (universeTarget?.dataset.universeId) {
      actions.selectUniverse(universeTarget.dataset.universeId);
      return;
    }

    const categoryTarget = target.closest<HTMLElement>("[data-action=select-category]");
    if (categoryTarget?.dataset.universeId && categoryTarget.dataset.categoryId) {
      actions.selectCategory(
        categoryTarget.dataset.universeId,
        categoryTarget.dataset.categoryId
      );
      return;
    }

    const overlay = target.closest<HTMLElement>(".modal-overlay");
    if (overlay && overlay === target) {
      actions.closeUniverseModal();
    }
  }

  private navigate(route: RouteName): void {
    if (route === "home") {
      actions.navigate({ name: "home" });
      return;
    }

    const activeUniverse = selectActiveUniverse(this.state);
    const universes = selectUniverses();
    const universeToLoad = activeUniverse ?? universes[0];

    if (universeToLoad) {
      actions.selectUniverse(universeToLoad.id);
    }
  }

  private render(): void {
    if (!this.shadowRoot) {
      return;
    }

    const universes = selectUniverses();
    const activeUniverse = selectActiveUniverse(this.state) ?? undefined;
    const activeCategory = selectActiveCategory(this.state) ?? undefined;

    const sidebar = this.renderSidebar(universes, activeUniverse, activeCategory);
    const main = this.renderMain(universes, activeUniverse, activeCategory);
    const modal = this.state.isUniverseModalOpen
      ? this.renderModal(activeUniverse)
      : "";

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <ds-shell>
        <header class="shell-header">
          ${this.renderHeader()}
        </header>
        <div class="shell-body">
          ${sidebar}
          <main class="shell-main" data-route="${this.state.route.name}">
            ${main}
          </main>
        </div>
      </ds-shell>
      ${modal}
    `;
  }

  private renderHeader(): string {
    const activeRoute = this.state.route.name;
    const isUniverseRoute = activeRoute === "universe" || activeRoute === "category";

    return `
      <div class="header-content">
        <a class="brand" href="#" data-route="home">
          <span class="brand-mark" aria-hidden="true">C</span>
          <span class="brand-title">Canon Builder</span>
        </a>
        <nav class="primary-nav" aria-label="Primary">
          ${this.renderNavButton("home", "Overview", activeRoute === "home")}
          ${this.renderNavButton("universe", "Universes", isUniverseRoute)}
        </nav>
        <div class="primary-actions">
          <ds-button variant="primary" data-action="open-modal">New universe</ds-button>
        </div>
      </div>
    `;
  }

  private renderNavButton(route: RouteName, label: string, isActive: boolean): string {
    return `
      <button
        type="button"
        data-route="${route}"
        ${isActive ? 'aria-current="page"' : ""}
      >
        ${label}
      </button>
    `;
  }

  private renderSidebar(
    universes: UniverseSummary[],
    activeUniverse?: UniverseSummary,
    activeCategory?: UniverseCategory
  ): string {
    const universeButtons = universes
      .map((universe) => {
        const isActive = activeUniverse?.id === universe.id;
        return `
          <button
            type="button"
            class="universe-button ${isActive ? "active" : ""}"
            data-action="select-universe"
            data-universe-id="${universe.id}"
          >
            <span>${universe.name}</span>
            <span aria-hidden="true">↗</span>
          </button>
        `;
      })
      .join("");

    const categoryList = activeUniverse
      ? `
          <div class="category-list">
            <h3>Categories</h3>
            ${activeUniverse.categories
              .map((category) => `
                <button
                  type="button"
                  class="category-button ${
                    category.id === activeCategory?.id ? "active" : ""
                  }"
                  data-action="select-category"
                  data-universe-id="${activeUniverse.id}"
                  data-category-id="${category.id}"
                >
                  ${category.name}
                </button>
              `)
              .join("")}
          </div>
        `
      : "";

    return `
      <aside class="shell-sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">Universes</h2>
          <span class="sidebar-meta">${universes.length} worlds</span>
        </div>
        <div class="sidebar-nav" role="list">
          ${universeButtons}
        </div>
        ${categoryList}
      </aside>
    `;
  }

  private renderMain(
    universes: UniverseSummary[],
    activeUniverse?: UniverseSummary,
    activeCategory?: UniverseCategory
  ): string {
    switch (this.state.route.name) {
      case "home":
        return this.renderHome(universes);
      case "category":
        if (activeUniverse && activeCategory) {
          return this.renderCategory(activeUniverse, activeCategory);
        }
        return this.renderUniverse(activeUniverse ?? universes[0]);
      case "universe":
        return this.renderUniverse(activeUniverse ?? universes[0]);
      default:
        return this.renderHome(universes);
    }
  }

  private renderHome(universes: UniverseSummary[]): string {
    const featureCards = universes
      .map(
        (universe) => `
          <article
            class="category-card"
            data-action="select-universe"
            data-universe-id="${universe.id}"
            role="button"
            tabindex="0"
          >
            <h3>${universe.name}</h3>
            <p>${universe.tagline}</p>
          </article>
        `
      )
      .join("");

    return `
      <section class="hero">
        <h1>Canon Universe Builder</h1>
        <p>
          Curate lore, keep collaborators aligned, and explore expansive settings with
          responsive navigation powered by a DataStar-inspired store.
        </p>
        <div class="hero-footer">
          <span><strong>${universes.length}</strong> curated universes ready to explore</span>
          <span>Jump into a world to inspect its factions, heroes, and anomalies.</span>
        </div>
      </section>
      <section aria-label="Featured universes">
        <ds-row class="category-grid">
          ${featureCards}
        </ds-row>
      </section>
    `;
  }

  private renderUniverse(universe?: UniverseSummary): string {
    if (!universe) {
      return this.renderEmptyState();
    }

    const categoryCards = universe.categories
      .map(
        (category) => `
          <article
            class="category-card"
            data-action="select-category"
            data-universe-id="${universe.id}"
            data-category-id="${category.id}"
            role="button"
            tabindex="0"
          >
            <h3>${category.name}</h3>
            <p>${category.summary}</p>
          </article>
        `
      )
      .join("");

    return `
      <section class="hero">
        <h1>${universe.name}</h1>
        <p>${universe.description}</p>
        <div class="hero-footer">
          <span><strong>${universe.categories.length}</strong> narrative pillars</span>
          <span>${universe.callToAction}</span>
        </div>
      </section>
      <section aria-label="${universe.name} categories">
        <ds-row class="category-grid">
          ${categoryCards}
        </ds-row>
      </section>
    `;
  }

  private renderCategory(
    universe: UniverseSummary,
    category: UniverseCategory
  ): string {
    const bulletPoints = category.body
      .map((entry) => `<li>${entry}</li>`)
      .join("");

    return `
      <section class="hero">
        <h1>${universe.name}</h1>
        <p>${universe.tagline}</p>
        <div class="hero-footer">
          <span><strong>${category.name}</strong> focus</span>
          <span>${universe.callToAction}</span>
        </div>
      </section>
      <section class="detail-section" aria-label="${category.name} details">
        <h2>${category.name}</h2>
        <p>${category.summary}</p>
        <ul>
          ${bulletPoints}
        </ul>
      </section>
    `;
  }

  private renderModal(activeUniverse?: UniverseSummary): string {
    const contextLabel = activeUniverse
      ? `Currently viewing <strong>${activeUniverse.name}</strong>.`
      : "Select a universe to preview its structure before creating your own.";

    return `
      <div class="modal-overlay" data-action="close-modal">
        <div
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="universe-modal-title"
        >
          <h2 id="universe-modal-title">Create a new universe</h2>
          <p>
            Canon's collaborative workflow will soon let you scaffold timelines,
            populate factions, and invite peers into shared storyboards. For now, take a
            tour of the sample universes and imagine how your setting might unfold.
          </p>
          <p>${contextLabel}</p>
          <div class="modal-actions">
            <ds-button variant="ghost" data-action="close-modal">Cancel</ds-button>
            <ds-button variant="primary" data-action="close-modal">Sounds great</ds-button>
          </div>
        </div>
      </div>
    `;
  }

  private renderEmptyState(): string {
    return `
      <section class="empty-state">
        <h2>No universes available</h2>
        <p>Start by creating a universe to explore categories, factions, and timelines.</p>
        <ds-button variant="primary" data-action="open-modal">Create universe</ds-button>
      </section>
    `;
  }
}

export default CanonApp;
