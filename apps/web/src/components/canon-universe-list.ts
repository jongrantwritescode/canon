import { appStore } from '../state/app-store';
import type { AppState } from '../state/app-store';
import type { UniverseSummary } from '../services/api';

class CanonUniverseList extends HTMLElement {
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

  private navigateToUniverse(universe: UniverseSummary): void {
    appStore.navigate({ view: 'universe', universeId: universe.id });
  }

  private handleCreateClick = (): void => {
    appStore.openUniverseModal();
  };

  private render(): void {
    if (!this.shadowRoot || !this.state) {
      return;
    }

    const { loading, errors, universes } = this.state;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
        }

        h1 {
          margin: 0;
          font-size: 28px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
        }

        .card {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid rgba(162, 169, 177, 0.28);
          box-shadow: 0 12px 34px rgba(18, 23, 40, 0.08);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .card h2 {
          margin: 0;
          font-size: 20px;
        }

        .card p {
          margin: 0;
          color: rgba(32, 33, 34, 0.7);
          line-height: 1.6;
        }

        .meta {
          font-size: 13px;
          color: rgba(32, 33, 34, 0.55);
        }

        .loading,
        .error,
        .empty {
          padding: 32px;
          border-radius: 12px;
          text-align: center;
          background: rgba(51, 102, 204, 0.08);
          color: #202122;
        }

        .error {
          background: rgba(215, 51, 51, 0.12);
          color: #861616;
        }

        .empty {
          background: rgba(20, 134, 109, 0.1);
          color: #0b6952;
        }
      </style>
      <section>
        <header>
          <div>
            <h1>Universe catalog</h1>
            <p class="meta">Browse every universe that Canon has indexed.</p>
          </div>
          <ds-button variant="primary" id="create-btn">Create universe</ds-button>
        </header>
        ${loading.universes
          ? '<div class="loading">Loading universes…</div>'
          : errors.universes
          ? `<div class="error">${errors.universes}</div>`
          : universes.length === 0
          ? '<div class="empty">Start by creating your first universe.</div>'
          : `<div class="grid">${universes
              .map((universe) => this.renderUniverseCard(universe))
              .join('')}</div>`}
      </section>
    `;

    const createButton = this.shadowRoot.querySelector<HTMLButtonElement>('#create-btn');
    if (createButton) {
      createButton.onclick = this.handleCreateClick;
    }

    const cardButtons = this.shadowRoot.querySelectorAll<HTMLButtonElement>('ds-button[data-universe]');
    cardButtons.forEach((button) => {
      const universeId = button.getAttribute('data-universe');
      if (!universeId) {
        return;
      }

      button.onclick = () => {
        const universe = universes.find((item) => item.id === universeId);
        if (universe) {
          this.navigateToUniverse(universe);
        }
      };
    });
  }

  private renderUniverseCard(universe: UniverseSummary): string {
    const createdAt = typeof universe.createdAt === 'number'
      ? new Date(universe.createdAt).toLocaleDateString()
      : undefined;

    return `
      <div class="card">
        <h2>${universe.name}</h2>
        <p>${universe.description || 'No description yet.'}</p>
        <div class="meta">${createdAt ? `Created ${createdAt}` : 'Creation date unavailable'}</div>
        <div>
          <ds-button variant="secondary" data-universe="${universe.id}">
            View details
          </ds-button>
        </div>
      </div>
    `;
  }
}

if (!customElements.get('canon-universe-list')) {
  customElements.define('canon-universe-list', CanonUniverseList);
}
