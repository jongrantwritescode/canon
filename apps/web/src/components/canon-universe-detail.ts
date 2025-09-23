import { appStore } from '../state/app-store';
import type { AppState } from '../state/app-store';
import type { UniverseCategory, UniverseDetail } from '../services/api';

class CanonUniverseDetail extends HTMLElement {
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

  private render(): void {
    if (!this.shadowRoot || !this.state) {
      return;
    }

    const route = this.state.route;
    if (route.view !== 'universe') {
      this.shadowRoot.innerHTML = '';
      return;
    }

    const universeId = route.universeId;
    const detail = this.state.universeDetails[universeId];
    const categories = this.state.universeCategories[universeId] ?? [];
    const isLoading = this.state.loading.universe || this.state.loading.category;
    const error = this.state.errors.universe ?? this.state.errors.category;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .hero {
          background: #ffffff;
          border-radius: 18px;
          padding: 32px;
          border: 1px solid rgba(162, 169, 177, 0.28);
          box-shadow: 0 18px 40px rgba(18, 23, 40, 0.1);
          margin-bottom: 28px;
        }

        .hero h1 {
          margin: 0 0 12px 0;
          font-size: 32px;
        }

        .hero p {
          margin: 0;
          color: rgba(32, 33, 34, 0.72);
          line-height: 1.7;
          max-width: 720px;
        }

        .status {
          margin-top: 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 14px;
          color: rgba(32, 33, 34, 0.6);
        }

        .status span {
          background: rgba(51, 102, 204, 0.1);
          color: #1f409c;
          padding: 6px 10px;
          border-radius: 999px;
        }

        .categories {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .category-card {
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid rgba(162, 169, 177, 0.24);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 12px 30px rgba(18, 23, 40, 0.08);
        }

        .category-card h3 {
          margin: 0;
          font-size: 18px;
        }

        .category-card p {
          margin: 0;
          color: rgba(32, 33, 34, 0.72);
          line-height: 1.5;
        }

        .category-card footer {
          margin-top: auto;
        }

        .empty,
        .loading,
        .error {
          padding: 28px;
          border-radius: 14px;
          text-align: center;
          margin-top: 20px;
        }

        .loading {
          background: rgba(51, 102, 204, 0.08);
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
        ${this.renderHero(detail)}
        ${isLoading
          ? '<div class="loading">Loading universe details…</div>'
          : error
          ? `<div class="error">${error}</div>`
          : categories.length === 0
          ? '<div class="empty">This universe has no categories yet.</div>'
          : `<div class="categories">${categories
              .map((category) => this.renderCategoryCard(universeId, category))
              .join('')}</div>`}
      </section>
    `;

    const viewButtons = this.shadowRoot.querySelectorAll<HTMLButtonElement>('ds-button[data-category]');
    viewButtons.forEach((button) => {
      const category = button.getAttribute('data-category');
      if (!category) {
        return;
      }

      button.onclick = () => {
        appStore.navigate({ view: 'category', universeId, categoryName: category });
      };
    });
  }

  private renderHero(detail: UniverseDetail | undefined): string {
    if (!detail) {
      return `
        <div class="hero">
          <h1>Universe</h1>
          <p>The selected universe is loading.</p>
        </div>
      `;
    }

    return `
      <div class="hero">
        <h1>${detail.name}</h1>
        <p>${detail.description || 'This universe is ready for new lore and adventures.'}</p>
        <div class="status">
          <span>${detail.categories?.length ?? 0} categories</span>
          <span>ID: ${detail.id}</span>
        </div>
      </div>
    `;
  }

  private renderCategoryCard(universeId: string, category: UniverseCategory): string {
    const pageCount = category.pages?.length ?? 0;

    return `
      <article class="category-card">
        <h3>${category.category}</h3>
        <p>${pageCount} ${pageCount === 1 ? 'entry' : 'entries'} tracked for this category.</p>
        <footer>
          <ds-button variant="secondary" data-category="${category.category}" data-universe="${universeId}">
            Browse ${category.category}
          </ds-button>
        </footer>
      </article>
    `;
  }
}

if (!customElements.get('canon-universe-detail')) {
  customElements.define('canon-universe-detail', CanonUniverseDetail);
}
