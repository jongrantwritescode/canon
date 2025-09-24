import { appStore } from '../state/app-store';
import type { AppState } from '../state/app-store';
import type { UniverseCategory, UniverseDetail } from '../services/api';

import './canon-universe-graph';

class CanonUniverseDetail extends HTMLElement {
  private unsubscribe?: () => void;
  private state: AppState | null = null;
  private activeTab: 'overview' | 'graph' = 'overview';
  private currentUniverseId?: string;

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
      this.currentUniverseId = undefined;
      this.activeTab = 'overview';
      return;
    }

    const universeId = route.universeId;
    if (this.currentUniverseId !== universeId) {
      this.currentUniverseId = universeId;
      this.activeTab = 'overview';
    }

    const detail = this.state.universeDetails[universeId];
    const categories = this.state.universeCategories[universeId] ?? [];
    const isOverviewLoading =
      this.state.loading.universe || this.state.loading.category;
    const overviewError = this.state.errors.universe ?? this.state.errors.category;
    const isGraphActive = this.activeTab === 'graph';

    if (isGraphActive) {
      appStore.ensureUniverseGraph(universeId);
    }

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

        .tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .tabs button {
          background: rgba(51, 102, 204, 0.08);
          border: none;
          border-radius: 999px;
          padding: 10px 18px;
          font: inherit;
          color: rgba(32, 33, 34, 0.72);
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
        }

        .tabs button[data-active="true"] {
          background: #3366cc;
          color: #ffffff;
          box-shadow: 0 12px 24px rgba(51, 102, 204, 0.28);
        }

        .tab-content {
          min-height: 320px;
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
          background: #ffffff;
          border: 1px solid rgba(162, 169, 177, 0.24);
          box-shadow: 0 12px 30px rgba(18, 23, 40, 0.08);
        }

        .loading {
          color: #1f409c;
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
        <div class="tabs" role="tablist" aria-label="Universe views">
          <button
            type="button"
            role="tab"
            data-tab="overview"
            data-active="${this.activeTab === 'overview'}"
            aria-selected="${this.activeTab === 'overview'}"
          >
            Overview
          </button>
          <button
            type="button"
            role="tab"
            data-tab="graph"
            data-active="${isGraphActive}"
            aria-selected="${isGraphActive}"
          >
            Graph
          </button>
        </div>
        <div class="tab-content">
          ${isGraphActive
            ? `<canon-universe-graph universe-id="${universeId}"></canon-universe-graph>`
            : this.renderOverviewContent(
                universeId,
                categories,
                isOverviewLoading,
                overviewError
              )}
        </div>
      </section>
    `;

    this.bindTabEvents(universeId);
    if (!isGraphActive) {
      this.bindOverviewCategoryEvents(universeId);
    }
  }

  private renderOverviewContent(
    universeId: string,
    categories: UniverseCategory[],
    isLoading: boolean,
    error?: string
  ): string {
    if (isLoading) {
      return '<div class="loading">Loading universe details…</div>';
    }

    if (error) {
      return `<div class="error">${error}</div>`;
    }

    if (categories.length === 0) {
      return '<div class="empty">This universe has no categories yet.</div>';
    }

    return `<div class="categories">${categories
      .map((category) => this.renderCategoryCard(universeId, category))
      .join('')}</div>`;
  }

  private bindTabEvents(universeId: string): void {
    if (!this.shadowRoot) {
      return;
    }

    const buttons = this.shadowRoot.querySelectorAll<HTMLButtonElement>(
      'button[data-tab]'
    );

    buttons.forEach((button) => {
      const tab = button.getAttribute('data-tab');
      if (tab !== 'overview' && tab !== 'graph') {
        return;
      }

      button.dataset.active = this.activeTab === tab ? 'true' : 'false';
      button.onclick = () => this.switchTab(tab, universeId);
    });
  }

  private bindOverviewCategoryEvents(universeId: string): void {
    if (!this.shadowRoot) {
      return;
    }

    const viewButtons = this.shadowRoot.querySelectorAll<HTMLButtonElement>(
      'ds-button[data-category]'
    );

    viewButtons.forEach((button) => {
      const category = button.getAttribute('data-category');
      if (!category) {
        return;
      }

      button.onclick = () => {
        appStore.navigate({
          view: 'category',
          universeId,
          categoryName: category,
        });
      };
    });
  }

  private switchTab(tab: 'overview' | 'graph', universeId: string): void {
    if (this.activeTab === tab) {
      if (tab === 'graph') {
        appStore.ensureUniverseGraph(universeId);
      }
      return;
    }

    this.activeTab = tab;
    if (tab === 'graph') {
      appStore.ensureUniverseGraph(universeId);
    }
    this.render();
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
