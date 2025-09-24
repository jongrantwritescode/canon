import { appStore } from "../state/app-store";
import type { AppState } from "../state/app-store";

class CanonHome extends HTMLElement {
  private unsubscribe?: () => void;
  private state: AppState | null = null;

  connectedCallback(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
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
    appStore.navigate({ view: "universes" });
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
            interconnected cultures.
          </p>
          <div class="hero-actions">
            <ds-button variant="primary" id="create-btn">Create a universe</ds-button>
            <ds-button variant="secondary" id="browse-btn">Browse existing universes</ds-button>
          </div>
        </div>
        <div class="feature-grid">
          <div class="feature-card">
            <h4>Build living worlds</h4>
            <p>
              Sketch continents, space stations, or hidden dimensions with spatial anchors and
              relationships that keep every location grounded in shared lore.
            </p>
          </div>
          <div class="feature-card">
            <h4>Create unforgettable characters</h4>
            <p>
              Define motivations, lineages, and alliances so your protagonists and villains stay
              connected to the worlds they inhabit.
            </p>
          </div>
          <div class="feature-card">
            <h4>Shape evolving societies</h4>
            <p>
              Capture cultures, factions, and rituals to explain how communities rise, clash, and
              cooperate across your universe.
            </p>
          </div>
        </div>
      </section>
    `;

    const createButton =
      this.shadowRoot.querySelector<HTMLButtonElement>("#create-btn");
    const browseButton =
      this.shadowRoot.querySelector<HTMLButtonElement>("#browse-btn");

    if (createButton) {
      createButton.onclick = this.handleCreateClick;
    }

    if (browseButton) {
      browseButton.onclick = this.handleBrowseClick;
    }
  }
}

if (!customElements.get("canon-home")) {
  customElements.define("canon-home", CanonHome);
}
