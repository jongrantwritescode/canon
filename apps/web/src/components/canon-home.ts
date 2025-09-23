import { appStore } from '../state/app-store';
import type { AppState } from '../state/app-store';

class CanonHome extends HTMLElement {
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

  private handleCreateClick = (): void => {
    appStore.openUniverseModal();
  };

  private handleBrowseClick = (): void => {
    appStore.navigate({ view: 'universes' });
  };

  private render(): void {
    if (!this.shadowRoot) {
      return;
    }

    const totalUniverses = this.state?.universes.length ?? 0;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .hero {
          background: linear-gradient(135deg, rgba(51, 102, 204, 0.12), rgba(9, 45, 125, 0.08));
          border-radius: 16px;
          padding: 48px 40px;
          color: #202122;
          box-shadow: 0 20px 60px rgba(23, 43, 77, 0.08);
        }

        .hero h1 {
          margin: 0 0 16px 0;
          font-size: 36px;
          line-height: 1.2;
        }

        .hero p {
          margin: 0 0 32px 0;
          font-size: 18px;
          color: rgba(32, 33, 34, 0.78);
          max-width: 720px;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .metrics {
          margin-top: 40px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .metric-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 10px 30px rgba(18, 23, 40, 0.08);
        }

        .metric-card h3 {
          margin: 0;
          font-size: 32px;
          color: #3366cc;
        }

        .metric-card p {
          margin: 8px 0 0 0;
          font-size: 14px;
          color: rgba(32, 33, 34, 0.68);
        }

        .feature-grid {
          margin-top: 48px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .feature-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid rgba(162, 169, 177, 0.28);
          box-shadow: 0 12px 32px rgba(18, 23, 40, 0.06);
        }

        .feature-card h4 {
          margin: 0 0 12px 0;
          font-size: 20px;
        }

        .feature-card p {
          margin: 0;
          font-size: 15px;
          color: rgba(32, 33, 34, 0.72);
          line-height: 1.6;
        }

        @media (max-width: 640px) {
          .hero {
            padding: 32px 24px;
          }

          .hero h1 {
            font-size: 28px;
          }
        }
      </style>
      <section>
        <div class="hero">
          <h1>Canon</h1>
          <p>
            Compose entire fictional universes with shared lore, rich geography, and
            interconnected cultures. Canon orchestrates Standards UI components with
            DataStar-style stores so every view reacts to live graph data.
          </p>
          <div class="hero-actions">
            <ds-button variant="primary" id="create-btn">Create a universe</ds-button>
            <ds-button variant="secondary" id="browse-btn">Browse existing universes</ds-button>
          </div>
          <div class="metrics">
            <div class="metric-card">
              <h3>${totalUniverses}</h3>
              <p>Universes tracked in the graph</p>
            </div>
            <div class="metric-card">
              <h3>4</h3>
              <p>Story pillars (worlds, characters, cultures, technologies)</p>
            </div>
            <div class="metric-card">
              <h3>Queue aware</h3>
              <p>Live build queue monitoring keeps LLM jobs transparent</p>
            </div>
          </div>
        </div>
        <div class="feature-grid">
          <div class="feature-card">
            <h4>Component-first shell</h4>
            <p>
              Every surface is a dedicated web component that subscribes to the shared store.
              Layout, navigation, and modals follow Standards UI tokens rather than ad-hoc CSS.
            </p>
          </div>
          <div class="feature-card">
            <h4>Declarative data flows</h4>
            <p>
              The application state manages universes, routes, and queue stats so that
              components stay stateless and focused on rendering.
            </p>
          </div>
          <div class="feature-card">
            <h4>Markdown-aware reader</h4>
            <p>
              Page fragments render safely inside a shadow DOM with internal navigation handled
              by the router.
            </p>
          </div>
          <div class="feature-card">
            <h4>Extensible design tokens</h4>
            <p>
              Canon overrides the Standards UI token set to mirror its encyclopedia-inspired
              palette and spacing system.
            </p>
          </div>
        </div>
      </section>
    `;

    const createButton = this.shadowRoot.querySelector<HTMLButtonElement>('#create-btn');
    const browseButton = this.shadowRoot.querySelector<HTMLButtonElement>('#browse-btn');

    if (createButton) {
      createButton.onclick = this.handleCreateClick;
    }

    if (browseButton) {
      browseButton.onclick = this.handleBrowseClick;
    }
  }
}

if (!customElements.get('canon-home')) {
  customElements.define('canon-home', CanonHome);
}
