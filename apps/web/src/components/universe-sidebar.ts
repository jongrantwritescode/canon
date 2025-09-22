import { appStore } from "../state/app-store";
import { escapeHtml, formatDate } from "../utils/dom";

class UniverseSidebar extends HTMLElement {
  private unsubscribe?: () => void;

  private readonly handleClick = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const actionEl = target.closest<HTMLElement>("[data-action]");
    if (!actionEl) {
      return;
    }

    const { action, universeId } = actionEl.dataset;
    if (!action) {
      return;
    }

    event.preventDefault();

    switch (action) {
      case "select-universe":
        if (universeId) {
          void appStore.actions.selectUniverse(universeId);
        }
        break;
      case "open-universe-modal":
        appStore.actions.openUniverseModal();
        break;
      case "reload-universes":
        void appStore.actions.loadUniverses();
        break;
      case "refresh-queue":
        void appStore.actions.refreshQueueStats();
        break;
      case "show-queue":
        void appStore.actions.showQueue();
        break;
      default:
        break;
    }
  };

  connectedCallback() {
    this.unsubscribe = appStore.subscribe(() => this.render());
    this.render();
    this.addEventListener("click", this.handleClick);
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.removeEventListener("click", this.handleClick);
  }

  private renderUniverses(): string {
    const state = appStore.getState();
    if (state.loading.universes) {
      return '<div class="wiki-loading">Loading universes...</div>';
    }

    if (state.errors.universes) {
      return `<div class="wiki-error">${escapeHtml(state.errors.universes)}</div>`;
    }

    if (!state.universes.length) {
      return '<p class="empty">No universes found yet.</p>';
    }

    const { universeId: activeId } = state.selection;
    const items = state.universes
      .map((universe) => {
        const activeClass = activeId === universe.id ? "active" : "";
        const description = universe.description
          ? `<small>${escapeHtml(universe.description)}</small>`
          : "";
        return `
          <li class="universe-item ${activeClass}">
            <button type="button" class="universe-link" data-action="select-universe" data-universe-id="${
              universe.id
            }">
              <strong>${escapeHtml(universe.name)}</strong>
              ${description}
            </button>
          </li>
        `;
      })
      .join("");

    return `<ul class="universe-list">${items}</ul>`;
  }

  private renderQueueSummary(): string {
    const { queueStats, queueStatsUpdatedAt, polling } = appStore.getState();

    if (!queueStats) {
      return '<p class="empty">Queue metrics unavailable.</p>';
    }

    const updatedLabel = queueStatsUpdatedAt
      ? `<p class="queue-updated">Updated ${formatDate(queueStatsUpdatedAt)}</p>`
      : "";

    return `
      <div class="queue-summary">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">${queueStats.total}</div>
            <div class="stat-label">Total</div>
          </div>
          <div class="stat-card waiting">
            <div class="stat-number">${queueStats.waiting}</div>
            <div class="stat-label">Waiting</div>
          </div>
          <div class="stat-card active">
            <div class="stat-number">${queueStats.active}</div>
            <div class="stat-label">Active</div>
          </div>
          <div class="stat-card completed">
            <div class="stat-number">${queueStats.completed}</div>
            <div class="stat-label">Completed</div>
          </div>
          <div class="stat-card failed">
            <div class="stat-number">${queueStats.failed}</div>
            <div class="stat-label">Failed</div>
          </div>
        </div>
        ${updatedLabel}
        <ds-button
          variant="secondary"
          data-action="show-queue"
          size="sm">
          View Queue ${polling.queue ? "(Polling)" : ""}
        </ds-button>
      </div>
    `;
  }

  private render() {
    const state = appStore.getState();
    const createDisabledAttr = state.loading.createUniverse ? "disabled" : "";

    this.innerHTML = `
      <aside class="wiki-sidebar" id="wiki-sidebar">
        <ds-col gap="24px">
          <header>
            <h2>Universes</h2>
          </header>
          <nav>
            ${this.renderUniverses()}
          </nav>
          <div class="sidebar-actions">
            <ds-button
              variant="primary"
              data-action="open-universe-modal"
              ${createDisabledAttr}>
              Create Universe
            </ds-button>
            <ds-button
              variant="ghost"
              data-action="reload-universes"
              size="sm">
              Reload
            </ds-button>
          </div>
        </ds-col>
        <ds-divider></ds-divider>
        <section class="queue-mini">
          <header>
            <h3>Queue Snapshot</h3>
          </header>
          ${state.errors.queue ? `<div class="wiki-error">${escapeHtml(state.errors.queue)}</div>` : ""}
          ${state.loading.queue && !state.queueStats ? '<div class="wiki-loading">Loading queue...</div>' : this.renderQueueSummary()}
          <div class="sidebar-actions">
            <ds-button variant="ghost" data-action="refresh-queue" size="sm">
              Refresh
            </ds-button>
            <ds-button variant="ghost" data-action="show-queue" size="sm">
              Open Queue
            </ds-button>
          </div>
        </section>
      </aside>
    `;
  }
}

if (!customElements.get("universe-sidebar")) {
  customElements.define("universe-sidebar", UniverseSidebar);
}
