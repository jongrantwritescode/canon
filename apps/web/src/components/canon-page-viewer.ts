import { appStore } from '../state/app-store';
import type { AppState } from '../state/app-store';
import type { PageContent } from '../state/app-store';

class CanonPageViewer extends HTMLElement {
  private unsubscribe?: () => void;
  private state: AppState | null = null;

  connectedCallback(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    this.shadowRoot.addEventListener('click', this.handleLinkClick);

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

    this.shadowRoot?.removeEventListener('click', this.handleLinkClick);
  }

  private handleLinkClick = (event: Event): void => {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const anchor = target.closest('a');
    if (!anchor) {
      return;
    }

    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#')) {
      return;
    }

    const url = new URL(href, window.location.origin);
    if (!url.pathname.startsWith('/page/')) {
      return;
    }

    event.preventDefault();
    const pageId = url.pathname.split('/')[2];
    const currentRoute = this.state?.route;

    appStore.navigate({
      view: 'page',
      pageId,
      universeId:
        currentRoute?.view === 'page'
          ? currentRoute.universeId
          : currentRoute?.view === 'category'
          ? currentRoute.universeId
          : undefined,
      categoryName:
        currentRoute?.view === 'page'
          ? currentRoute.categoryName
          : currentRoute?.view === 'category'
          ? currentRoute.categoryName
          : undefined,
    });
  };

  private render(): void {
    if (!this.shadowRoot || !this.state) {
      return;
    }

    const route = this.state.route;
    if (route.view !== 'page') {
      this.shadowRoot.innerHTML = '';
      return;
    }

    const pageId = route.pageId;
    const page = this.state.pages[pageId];
    const loading = this.state.loading.page;
    const error = this.state.errors.page;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .header {
          margin-bottom: 24px;
        }

        h1 {
          margin: 0;
          font-size: 30px;
        }

        .meta {
          margin-top: 8px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 14px;
          color: rgba(32, 33, 34, 0.6);
        }

        .content {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid rgba(162, 169, 177, 0.24);
          padding: 28px;
          box-shadow: 0 18px 42px rgba(18, 23, 40, 0.08);
          line-height: 1.7;
        }

        .content h1,
        .content h2,
        .content h3,
        .content h4,
        .content h5,
        .content h6 {
          font-family: inherit;
          color: inherit;
        }

        .loading,
        .error,
        .empty {
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
        ${this.renderHeader(pageId, page)}
        ${loading
          ? '<div class="loading">Loading page content…</div>'
          : error
          ? `<div class="error">${error}</div>`
          : !page?.html
          ? '<div class="empty">No content is available for this page.</div>'
          : `<article class="content">${page.html}</article>`}
      </section>
    `;
  }

  private renderHeader(pageId: string, page: PageContent | undefined): string {
    if (!page?.metadata) {
      return `
        <div class="header">
          <h1>Page ${pageId}</h1>
        </div>
      `;
    }

    const labels = page.metadata.labels ?? [];

    return `
      <div class="header">
        <h1>${page.metadata.title}</h1>
        <div class="meta">
          <span>Page ID: ${page.metadata.id}</span>
          ${labels.map((label) => `<span>${label}</span>`).join('')}
        </div>
      </div>
    `;
  }
}

if (!customElements.get('canon-page-viewer')) {
  customElements.define('canon-page-viewer', CanonPageViewer);
}
