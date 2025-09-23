import { appStore } from '../state/app-store';
import type { AppState, QueueSnapshot } from '../state/app-store';

class CanonQueueDashboard extends HTMLElement {
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

  private handleRefresh = (): void => {
    appStore.refreshQueue();
  };

  private render(): void {
    if (!this.shadowRoot || !this.state) {
      return;
    }

    const queue = this.state.queue;
    const loading = this.state.loading.queue;
    const error = this.state.errors.queue;

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

        .meta {
          font-size: 14px;
          color: rgba(32, 33, 34, 0.65);
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
        }

        .card {
          background: #ffffff;
          border-radius: 14px;
          padding: 24px;
          border: 1px solid rgba(162, 169, 177, 0.24);
          box-shadow: 0 12px 32px rgba(18, 23, 40, 0.1);
        }

        .card h2 {
          margin: 0;
          font-size: 36px;
        }

        .card p {
          margin: 8px 0 0 0;
          color: rgba(32, 33, 34, 0.65);
        }

        .status {
          margin-top: 24px;
          padding: 20px;
          border-radius: 12px;
          background: rgba(51, 102, 204, 0.08);
        }

        .loading,
        .error,
        .empty {
          padding: 28px;
          border-radius: 12px;
          text-align: center;
        }

        .error {
          background: rgba(215, 51, 51, 0.12);
          color: #861616;
        }

        .loading {
          background: rgba(51, 102, 204, 0.08);
        }

        .empty {
          background: rgba(20, 134, 109, 0.1);
          color: #0b6952;
        }
      </style>
      <section>
        <header>
          <div>
            <h1>Queue dashboard</h1>
            <p class="meta">Monitor build jobs submitted to the universe generation pipeline.</p>
          </div>
          <ds-button variant="primary" id="refresh-btn" ${loading ? 'disabled' : ''}>Refresh now</ds-button>
        </header>
        ${loading && !queue
          ? '<div class="loading">Loading queue statistics…</div>'
          : error
          ? `<div class="error">${error}</div>`
          : queue
          ? `
              <div>
                ${this.renderStats(queue)}
                <div class="status">Last updated ${new Date(queue.fetchedAt).toLocaleTimeString()}</div>
              </div>
            `
          : '<div class="empty">Queue statistics will appear once jobs are running.</div>'}
      </section>
    `;

    const refreshButton = this.shadowRoot.querySelector<HTMLButtonElement>('#refresh-btn');
    if (refreshButton) {
      refreshButton.onclick = this.handleRefresh;
    }
  }

  private renderStats(queue: QueueSnapshot): string {
    return `
      <div class="grid">
        ${this.renderStatCard(queue.waiting, 'Waiting')}
        ${this.renderStatCard(queue.active, 'Active')}
        ${this.renderStatCard(queue.completed, 'Completed')}
        ${this.renderStatCard(queue.failed, 'Failed', true)}
      </div>
    `;
  }

  private renderStatCard(value: number, label: string, emphasize = false): string {
    return `
      <article class="card" style="${emphasize ? 'border-color: rgba(215, 51, 51, 0.35);' : ''}">
        <h2>${value}</h2>
        <p>${label}</p>
      </article>
    `;
  }
}

if (!customElements.get('canon-queue-dashboard')) {
  customElements.define('canon-queue-dashboard', CanonQueueDashboard);
}
