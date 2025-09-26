import { appStore } from "../state/app-store";
import type { AppState, QueueSnapshot } from "../state/app-store";
import type { JobInfo } from "../services/api";

class CanonQueueDashboard extends HTMLElement {
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

  private handleRefresh = (): void => {
    appStore.refreshQueue();
  };

  private render(): void {
    if (!this.shadowRoot || !this.state) {
      return;
    }

    const queue = this.state.queue;
    const jobs = this.state.jobs;
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

        .jobs-list {
          max-height: 600px;
          overflow-y: auto;
          border: 1px solid rgba(162, 169, 177, 0.24);
          border-radius: 14px;
          background: #ffffff;
        }

        .job-item {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr auto;
          gap: 16px;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(162, 169, 177, 0.12);
          transition: background-color 0.2s ease;
        }

        .job-item:last-child {
          border-bottom: none;
        }

        .job-item:hover {
          background: rgba(51, 102, 204, 0.04);
        }

        .job-universe {
          font-weight: 500;
          color: #202122;
        }

        .job-id {
          font-family: monospace;
          font-size: 13px;
          color: rgba(32, 33, 34, 0.65);
        }

        .job-type {
          text-transform: capitalize;
          color: #202122;
        }

        .job-status {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .job-status.waiting {
          background: rgba(255, 193, 7, 0.15);
          color: #856404;
        }

        .job-status.active {
          background: rgba(51, 102, 204, 0.15);
          color: #1f409c;
        }

        .job-status.completed {
          background: rgba(20, 134, 109, 0.15);
          color: #0b6952;
        }

        .job-status.failed {
          background: rgba(215, 51, 51, 0.15);
          color: #861616;
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
          <ds-button variant="primary" id="refresh-btn" ${loading ? "disabled" : ""}>Refresh now</ds-button>
        </header>
        ${
          loading && jobs.length === 0
            ? '<div class="loading">Loading jobs…</div>'
            : error
              ? `<div class="error">${error}</div>`
              : jobs.length > 0
                ? `
              <div class="jobs-list">
                ${jobs.map((job) => this.renderJobItem(job)).join("")}
              </div>
              ${queue ? `<div class="status">Last updated ${new Date(queue.fetchedAt).toLocaleTimeString()}</div>` : ""}
            `
                : '<div class="empty">No jobs found. Jobs will appear here once content generation is started.</div>'
        }
      </section>
    `;

    const refreshButton =
      this.shadowRoot.querySelector<HTMLButtonElement>("#refresh-btn");
    if (refreshButton) {
      refreshButton.onclick = this.handleRefresh;
    }
  }

  private renderJobItem(job: JobInfo): string {
    return `
      <div class="job-item">
        <div>
          <div class="job-universe">${job.universeId || "Unknown"}</div>
          <div class="job-id">${job.jobId}</div>
        </div>
        <div class="job-type">${job.type}</div>
        <div class="job-status ${job.status}">${job.status}</div>
      </div>
    `;
  }
}

if (!customElements.get("canon-queue-dashboard")) {
  customElements.define("canon-queue-dashboard", CanonQueueDashboard);
}
