import { appStore } from '../state/app-store';
import type { AppState } from '../state/app-store';
import type { Route } from '../router';

class CanonUniverseSidebar extends HTMLElement {
  private unsubscribe?: () => void;
  private state: AppState | null = null;

  connectedCallback(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    this.unsubscribe = appStore.subscribe((state) => {
      this.state = state;
      this.render();
    });
  }

  disconnectedCallback(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }

  private navigate(route: Route): void {
    appStore.navigate(route);
  }

  private handleCreateClick = (): void => {
    appStore.openUniverseModal();
  };

  private render(): void {
    if (!this.shadowRoot) {
      return;
    }

    const route = this.state?.route;
    const selectedUniverseId = this.getSelectedUniverseId(route);

    const universes = this.state?.universes ?? [];

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .sidebar {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(162, 169, 177, 0.3);
          padding: 24px;
          box-shadow: 0 16px 36px rgba(18, 23, 40, 0.08);
          position: sticky;
          top: 24px;
        }

        h2 {
          margin: 0 0 16px 0;
          font-size: 18px;
        }

        nav ul {
          list-style: none;
          margin: 0 0 16px 0;
          padding: 0;
          display: grid;
          gap: 8px;
        }

        nav button {
          width: 100%;
          text-align: left;
          border: none;
          background: transparent;
          font: inherit;
          color: #202122;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        nav button:hover {
          background: rgba(51, 102, 204, 0.1);
        }

        nav button[data-active="true"] {
          background: #3366cc;
          color: #ffffff;
        }

        .universes-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 24px 0 12px 0;
        }

        .universes-header h3 {
          margin: 0;
          font-size: 16px;
        }

        .universes-list {
          display: grid;
          gap: 4px;
          max-height: 320px;
          overflow-y: auto;
        }

        .empty-state {
          font-size: 14px;
          color: rgba(32, 33, 34, 0.65);
          padding: 12px 0;
        }

        .action {
          margin-top: 16px;
        }
      </style>
      <aside class="sidebar">
        <header>
          <h2>Navigation</h2>
        </header>
        <nav>
          <ul>
            <li>
              <button type="button" data-view="home">Home</button>
            </li>
            <li>
              <button type="button" data-view="universes">Universe catalog</button>
            </li>
            <li>
              <button type="button" data-view="queue">Queue dashboard</button>
            </li>
            <li>
              <button type="button" data-view="help">Help & docs</button>
            </li>
          </ul>
        </nav>
        <div class="universes">
          <div class="universes-header">
            <h3>Universes</h3>
            <ds-button variant="secondary" id="create-btn">New</ds-button>
          </div>
          <div class="universes-list">
            ${universes
              .map((universe) => `
                <button
                  type="button"
                  data-universe="${universe.id}"
                  data-active="${selectedUniverseId === universe.id}"
                >
                  ${universe.name}
                </button>
              `)
              .join('') || '<div class="empty-state">No universes yet</div>'}
          </div>
        </div>
      </aside>
    `;

    this.bindEvents(route);
  }

  private bindEvents(route: Route | undefined): void {
    if (!this.shadowRoot) {
      return;
    }

    const navButtons = Array.from(
      this.shadowRoot.querySelectorAll<HTMLButtonElement>('nav button[data-view]')
    );

    for (const button of navButtons) {
      const view = button.getAttribute('data-view');
      if (!view) {
        continue;
      }

      button.dataset.active = this.isViewActive(view, route) ? 'true' : 'false';
      button.onclick = () => {
        switch (view) {
          case 'home':
            this.navigate({ view: 'home' });
            break;
          case 'universes':
            this.navigate({ view: 'universes' });
            break;
          case 'queue':
            this.navigate({ view: 'queue' });
            break;
          case 'help':
            this.navigate({ view: 'help' });
            break;
          default:
            break;
        }
      };
    }

    const createButton = this.shadowRoot.querySelector<HTMLButtonElement>('#create-btn');
    if (createButton) {
      createButton.onclick = this.handleCreateClick;
    }

    const universeButtons = Array.from(
      this.shadowRoot.querySelectorAll<HTMLButtonElement>('.universes-list button[data-universe]')
    );

    for (const button of universeButtons) {
      const universeId = button.getAttribute('data-universe');
      if (!universeId) {
        continue;
      }

      button.onclick = () => {
        this.navigate({ view: 'universe', universeId });
      };
    }
  }

  private getSelectedUniverseId(route: Route | undefined): string | undefined {
    if (!route) {
      return undefined;
    }

    if (route.view === 'universe' || route.view === 'category') {
      return route.universeId;
    }

    if (route.view === 'page') {
      return route.universeId ?? undefined;
    }

    return undefined;
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

if (!customElements.get('canon-universe-sidebar')) {
  customElements.define('canon-universe-sidebar', CanonUniverseSidebar);
}
