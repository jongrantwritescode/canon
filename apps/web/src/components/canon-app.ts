import { appStore } from '../state/app-store';
import type { AppState } from '../state/app-store';
import type { Route } from '../router';

class CanonApp extends HTMLElement {
  private unsubscribe?: () => void;
  private state: AppState | null = null;
  private contentEl?: HTMLElement;
  private navButtons = new Map<string, HTMLButtonElement>();
  private activeContentTag?: string;

  connectedCallback(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    this.renderBase();

    this.unsubscribe = appStore.subscribe((state) => {
      this.state = state;
      this.updateNavigation();
      this.renderContent();
    });
  }

  disconnectedCallback(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }

  private renderBase(): void {
    if (!this.shadowRoot) {
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          min-height: 100vh;
          background: linear-gradient(180deg, #f7f9fc 0%, #eef1f7 100%);
          color: #202122;
          font-family: 'Helvetica Neue', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .app-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .app-header {
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.9);
          border-bottom: 1px solid rgba(162, 169, 177, 0.3);
          padding: 16px 32px;
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .brand {
          font-size: 24px;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        nav {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
        }

        nav button {
          background: transparent;
          border: none;
          padding: 10px 14px;
          border-radius: 999px;
          font: inherit;
          color: rgba(32, 33, 34, 0.7);
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        nav button:hover {
          background: rgba(51, 102, 204, 0.12);
          color: #1f409c;
        }

        nav button[data-active="true"] {
          background: #3366cc;
          color: #ffffff;
        }

        .app-main {
          flex: 1;
          width: min(1200px, 100%);
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
          gap: 32px;
          padding: 32px 24px 64px;
          box-sizing: border-box;
        }

        .sidebar {
          min-width: 0;
        }

        .content {
          min-width: 0;
        }

        @media (max-width: 960px) {
          .app-main {
            grid-template-columns: 1fr;
          }

          .sidebar {
            order: 2;
          }

          .content {
            order: 1;
          }
        }
      </style>
      <div class="app-shell">
        <header class="app-header">
          <div class="brand">Canon</div>
          <nav>
            <button type="button" data-view="home">Home</button>
            <button type="button" data-view="universes">Universes</button>
            <button type="button" data-view="queue">Queue</button>
            <button type="button" data-view="help">Help</button>
          </nav>
          <ds-button variant="primary" id="header-create">New universe</ds-button>
        </header>
        <main class="app-main">
          <aside class="sidebar">
            <canon-universe-sidebar></canon-universe-sidebar>
          </aside>
          <section class="content" id="app-content"></section>
        </main>
      </div>
      <canon-universe-modal></canon-universe-modal>
    `;

    this.contentEl = this.shadowRoot.querySelector<HTMLElement>('#app-content') ?? undefined;

    const navButtons = this.shadowRoot.querySelectorAll<HTMLButtonElement>('nav button[data-view]');
    navButtons.forEach((button) => {
      const view = button.getAttribute('data-view');
      if (!view) {
        return;
      }

      this.navButtons.set(view, button);
      button.onclick = () => this.handleNavigation(view);
    });

    const createButton = this.shadowRoot.querySelector<HTMLButtonElement>('#header-create');
    if (createButton) {
      createButton.onclick = () => appStore.openUniverseModal();
    }
  }

  private handleNavigation(view: string): void {
    switch (view) {
      case 'home':
        appStore.navigate({ view: 'home' });
        break;
      case 'universes':
        appStore.navigate({ view: 'universes' });
        break;
      case 'queue':
        appStore.navigate({ view: 'queue' });
        break;
      case 'help':
        appStore.navigate({ view: 'help' });
        break;
      default:
        break;
    }
  }

  private updateNavigation(): void {
    const route = this.state?.route;
    this.navButtons.forEach((button, view) => {
      button.dataset.active = this.isViewActive(view, route) ? 'true' : 'false';
    });
  }

  private renderContent(): void {
    if (!this.contentEl || !this.state) {
      return;
    }

    const route = this.state.route;
    const tag = this.resolveContentTag(route);
    if (!tag) {
      return;
    }

    if (this.activeContentTag !== tag) {
      this.contentEl.innerHTML = `<${tag}></${tag}>`;
      this.activeContentTag = tag;
    }

    this.updateDocumentTitle(route);
  }

  private resolveContentTag(route: Route): string | undefined {
    switch (route.view) {
      case 'home':
        return 'canon-home';
      case 'universes':
        return 'canon-universe-list';
      case 'universe':
        return 'canon-universe-detail';
      case 'category':
        return 'canon-category-panel';
      case 'page':
        return 'canon-page-viewer';
      case 'queue':
        return 'canon-queue-dashboard';
      case 'help':
        return 'canon-help';
      default:
        return 'canon-home';
    }
  }

  private updateDocumentTitle(route: Route): void {
    const base = 'Canon – Universe Builder';
    let suffix = '';

    switch (route.view) {
      case 'home':
        suffix = 'Home';
        break;
      case 'universes':
        suffix = 'Universe catalog';
        break;
      case 'universe':
        suffix = `Universe ${route.universeId}`;
        break;
      case 'category':
        suffix = `${route.categoryName} · ${route.universeId}`;
        break;
      case 'page':
        suffix = `Page ${route.pageId}`;
        break;
      case 'queue':
        suffix = 'Queue dashboard';
        break;
      case 'help':
        suffix = 'Help & docs';
        break;
      default:
        suffix = '';
        break;
    }

    document.title = suffix ? `${suffix} – ${base}` : base;
  }

  private isViewActive(view: string, route: Route | undefined): boolean {
    if (!route) {
      return false;
    }

    switch (view) {
      case 'home':
        return route.view === 'home';
      case 'universes':
        return route.view === 'universes';
      case 'queue':
        return route.view === 'queue';
      case 'help':
        return route.view === 'help';
      default:
        return false;
    }
  }
}

if (!customElements.get('canon-app')) {
  customElements.define('canon-app', CanonApp);
}
