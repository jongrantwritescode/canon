import { appStore } from '../state/app-store';
import type { AppState } from '../state/app-store';
import type { UniversePageSummary } from '../services/api';

class CanonCategoryPanel extends HTMLElement {
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
    if (route.view !== 'category') {
      this.shadowRoot.innerHTML = '';
      return;
    }

    const universeId = route.universeId;
    const categoryName = route.categoryName;
    const key = `${universeId}::${categoryName.toLowerCase()}`;
    const pages = this.state.categoryPages[key] ?? [];
    const loading = this.state.loading.category;
    const error = this.state.errors.category;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        header {
          margin-bottom: 24px;
        }

        h1 {
          margin: 0;
          font-size: 28px;
        }

        .meta {
          margin: 8px 0 0 0;
          color: rgba(32, 33, 34, 0.65);
        }

        .pages {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 18px;
        }

        .page-card {
          background: #ffffff;
          border-radius: 14px;
          padding: 20px;
          border: 1px solid rgba(162, 169, 177, 0.24);
          box-shadow: 0 12px 26px rgba(18, 23, 40, 0.08);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .page-card h2 {
          margin: 0;
          font-size: 18px;
        }

        .page-card p {
          margin: 0;
          color: rgba(32, 33, 34, 0.72);
        }

        .page-card footer {
          margin-top: auto;
        }

        .loading,
        .error,
        .empty {
          margin-top: 20px;
          padding: 28px;
          border-radius: 14px;
          text-align: center;
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
        <header>
          <h1>${categoryName}</h1>
          <p class="meta">Entries connected to ${categoryName.toLowerCase()} in this universe.</p>
          <ds-button variant="secondary" id="back-btn">Back to universe</ds-button>
        </header>
        ${loading
          ? '<div class="loading">Loading category pages…</div>'
          : error
          ? `<div class="error">${error}</div>`
          : pages.length === 0
          ? '<div class="empty">No pages have been generated for this category yet.</div>'
          : `<div class="pages">${pages
              .map((page) => this.renderPageCard(page, universeId, categoryName))
              .join('')}</div>`}
      </section>
    `;

    const backButton = this.shadowRoot.querySelector<HTMLButtonElement>('#back-btn');
    if (backButton) {
      backButton.onclick = () => {
        appStore.navigate({ view: 'universe', universeId });
      };
    }

    const viewButtons = this.shadowRoot.querySelectorAll<HTMLButtonElement>('ds-button[data-page]');
    viewButtons.forEach((button) => {
      const pageId = button.getAttribute('data-page');
      if (!pageId) {
        return;
      }

      button.onclick = () => {
        appStore.navigate({
          view: 'page',
          pageId,
          universeId,
          categoryName,
        });
      };
    });
  }

  private renderPageCard(
    page: UniversePageSummary,
    universeId: string,
    categoryName: string
  ): string {
    return `
      <article class="page-card">
        <h2>${page.title ?? page.name ?? 'Untitled page'}</h2>
        <p>${page.type ? page.type : 'Page content'} — ${page.id}</p>
        <footer>
          <ds-button variant="secondary" data-page="${page.id}" data-universe="${universeId}" data-category="${categoryName}">
            View page
          </ds-button>
        </footer>
      </article>
    `;
  }
}

if (!customElements.get('canon-category-panel')) {
  customElements.define('canon-category-panel', CanonCategoryPanel);
}
