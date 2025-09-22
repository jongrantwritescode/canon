import { appStore } from "../state/app-store";
import { escapeHtml } from "../utils/dom";
import { extractSummary } from "../utils/markdown";

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  Worlds: "Explore planets, space stations, and other locations",
  Characters: "Meet intelligent beings and their stories",
  Cultures: "Discover societies and their values",
  Technologies: "Learn about advanced innovations",
};

const CATEGORY_ICONS: Record<string, string> = {
  Worlds: "🌍",
  Characters: "👥",
  Cultures: "🏛️",
  Technologies: "⚡",
};

const CATEGORY_SINGULAR: Record<string, string> = {
  worlds: "world",
  characters: "character",
  cultures: "culture",
  technologies: "technology",
};

function singularFor(category: string): string {
  const lower = category.toLowerCase();
  return CATEGORY_SINGULAR[lower] || lower;
}

class MainView extends HTMLElement {
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

    const action = actionEl.dataset.action;
    if (!action) {
      return;
    }

    event.preventDefault();

    switch (action) {
      case "open-universe-modal":
        appStore.actions.openUniverseModal();
        break;
      case "show-home":
        appStore.actions.showHome();
        break;
      case "show-queue":
        void appStore.actions.showQueue();
        break;
      case "view-category": {
        const category = actionEl.dataset.category;
        if (category) {
          void appStore.actions.viewCategory(category);
        }
        break;
      }
      case "view-page": {
        const pageId = actionEl.dataset.pageId;
        if (pageId) {
          void appStore.actions.viewPage(pageId);
        }
        break;
      }
      case "create-content": {
        const type = actionEl.dataset.contentType;
        if (type) {
          void appStore.actions.createContent(type);
        }
        break;
      }
      case "refresh-universe": {
        const universeId = appStore.getState().selection.universeId;
        if (universeId) {
          void appStore.actions.selectUniverse(universeId, { replace: true });
        }
        break;
      }
      case "refresh-queue":
        void appStore.actions.refreshQueueStats();
        break;
      case "toggle-queue-polling":
        appStore.actions.toggleQueuePolling();
        break;
      case "check-job-status": {
        const jobId = actionEl.dataset.jobId;
        if (jobId) {
          void appStore.actions.viewJobStatus(jobId, { replace: true });
        }
        break;
      }
      case "view-universe": {
        const universeId = actionEl.dataset.universeId;
        if (universeId) {
          void appStore.actions.selectUniverse(universeId);
        }
        break;
      }
      case "select-universe": {
        const universeId = actionEl.dataset.universeId;
        if (universeId) {
          void appStore.actions.selectUniverse(universeId);
        }
        break;
      }
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

  private renderHome(): string {
    return `
      <section id="homepage" class="wiki-homepage">
        <div class="hero">
          <h1>Canon</h1>
          <p>Build living science fiction universes in minutes.</p>
          <div class="hero-actions">
            <button class="wiki-btn wiki-btn-primary" data-action="open-universe-modal">
              Create New Universe
            </button>
            <button class="wiki-btn wiki-btn-secondary" data-action="show-queue">
              View Queue
            </button>
          </div>
        </div>
        <div class="wiki-cards">
          <div class="wiki-card">
            <h3>🌍 Worlds</h3>
            <p>Design planets, space stations, and frontier outposts with rich detail.</p>
          </div>
          <div class="wiki-card">
            <h3>👥 Characters</h3>
            <p>Create heroes, villains, and every compelling personality between.</p>
          </div>
          <div class="wiki-card">
            <h3>🏛️ Cultures</h3>
            <p>Define societies, belief systems, and political structures.</p>
          </div>
          <div class="wiki-card">
            <h3>⚡ Technologies</h3>
            <p>Invent powerful artifacts, starships, and cutting-edge breakthroughs.</p>
          </div>
        </div>
      </section>
    `;
  }

  private renderUniverse(): string {
    const state = appStore.getState();
    const { universeDetails, universeContent, loading, errors } = state;

    if (loading.universe && !universeDetails) {
      return '<div class="wiki-loading">Loading universe...</div>';
    }

    if (errors.universe) {
      return `<div class="wiki-error">${escapeHtml(errors.universe)}</div>`;
    }

    if (!universeDetails) {
      return '<div class="wiki-error">Universe not found.</div>';
    }

    const categoryEntries = Object.entries(universeContent);

    const categoryCards = categoryEntries
      .map(([category]) => {
        const icon = CATEGORY_ICONS[category] || "📄";
        const description = CATEGORY_DESCRIPTIONS[category] || "Explore this category";
        return `
          <div class="category-card" data-action="view-category" data-category="${escapeHtml(
            category
          )}">
            <h3>${icon} ${escapeHtml(category)}</h3>
            <p>${escapeHtml(description)}</p>
          </div>
        `;
      })
      .join("");

    const categorySections = categoryEntries
      .map(([category, pages]) => {
        const icon = CATEGORY_ICONS[category] || "📄";
        const description = CATEGORY_DESCRIPTIONS[category] || "Explore this category";
        const pageItems = pages
          .slice(0, 3)
          .map((page) => {
            const title = page.title || page.name || "Untitled";
            const markdown = page.markdown || "";
            const summary = markdown ? extractSummary(markdown, 140) : "Tap to read more.";
            return `
              <article class="content-item" data-action="view-page" data-page-id="${escapeHtml(
                page.id
              )}">
                <h3>${escapeHtml(title)}</h3>
                <p>${escapeHtml(summary)}</p>
              </article>
            `;
          })
          .join("");

        const createType = category.toLowerCase();
        const singular = singularFor(category);

        return `
          <section class="category-section" data-category="${escapeHtml(category)}">
            <header class="category-section-header">
              <div>
                <h2>${icon} ${escapeHtml(category)}</h2>
                <p>${escapeHtml(description)}</p>
              </div>
              <button class="wiki-btn wiki-btn-secondary" data-action="view-category" data-category="${escapeHtml(
                category
              )}">
                View all ${escapeHtml(category.toLowerCase())}
              </button>
            </header>
            <div class="category-section-content">
              ${pageItems || `<p class="empty-category">No ${escapeHtml(
                category.toLowerCase()
              )} yet.</p>`}
            </div>
            <footer class="category-section-footer">
              <button class="wiki-btn wiki-btn-primary" data-action="create-content" data-content-type="${escapeHtml(
                createType
              )}">
                Create ${escapeHtml(singular)}
              </button>
            </footer>
          </section>
        `;
      })
      .join("");

    return `
      <section id="universe-content" class="wiki-article" data-universe-id="${escapeHtml(
        universeDetails.id
      )}">
        <div class="hero">
          <h1>${escapeHtml(universeDetails.name)}</h1>
          <p>${escapeHtml(universeDetails.description || "A universe waiting to be explored.")}</p>
          <div class="hero-actions">
            <button class="wiki-btn wiki-btn-secondary" data-action="show-home">← Back to Home</button>
            <button class="wiki-btn" data-action="refresh-universe">Refresh</button>
          </div>
        </div>
        <div class="category-grid">
          ${categoryCards || '<p class="empty-category">No categories available.</p>'}
        </div>
        <div class="category-sections">
          ${categorySections || '<p class="empty-category">Generate content to populate this universe.</p>'}
        </div>
      </section>
    `;
  }

  private renderCategory(): string {
    const state = appStore.getState();
    const category = state.selection.category;
    if (!category) {
      return this.renderUniverse();
    }

    const pages = state.universeContent[category] || [];
    const loading = state.loading.category;
    const error = state.errors.category;

    if (loading && !pages.length) {
      return '<div class="wiki-loading">Loading category...</div>';
    }

    if (error) {
      return `<div class="wiki-error">${escapeHtml(error)}</div>`;
    }

    const pageItems = pages
      .map((page) => {
        const title = page.title || page.name || "Untitled";
        const summary = page.markdown ? extractSummary(page.markdown, 180) : "View details";
        return `
          <article class="content-item" data-action="view-page" data-page-id="${escapeHtml(
            page.id
          )}">
            <h3>${escapeHtml(title)}</h3>
            <p>${escapeHtml(summary)}</p>
          </article>
        `;
      })
      .join("");

    const createType = category.toLowerCase();
    const singular = singularFor(category);

    return `
      <section class="wiki-article">
        <header class="category-section-header">
          <div>
            <h1>${escapeHtml(category)}</h1>
            <p>${escapeHtml(CATEGORY_DESCRIPTIONS[category] || "Explore this category")}</p>
          </div>
          <button class="wiki-btn" data-action="select-universe" data-universe-id="${escapeHtml(
            state.selection.universeId || ""
          )}">
            ← Back to Universe
          </button>
        </header>
        <div class="category-section-content">
          ${pageItems || `<p class="empty-category">No ${escapeHtml(
            category.toLowerCase()
          )} yet.</p>`}
        </div>
        <footer class="category-section-footer">
          <button class="wiki-btn wiki-btn-primary" data-action="create-content" data-content-type="${escapeHtml(
            createType
          )}">
            Create ${escapeHtml(singular)}
          </button>
        </footer>
      </section>
    `;
  }

  private renderPage(): string {
    const state = appStore.getState();
    const loading = state.loading.page;
    const error = state.errors.page;

    if (loading && !state.pageContent) {
      return '<div class="wiki-loading">Loading page...</div>';
    }

    if (error) {
      return `<div class="wiki-error">${escapeHtml(error)}</div>`;
    }

    if (!state.pageContent) {
      return '<div class="wiki-error">Page not found.</div>';
    }

    const { page, html } = state.pageContent;
    const backAction = state.selection.category ? "view-category" : "select-universe";
    const backAttrs = state.selection.category
      ? `data-action="view-category" data-category="${escapeHtml(state.selection.category)}"`
      : `data-action="select-universe" data-universe-id="${escapeHtml(
          state.selection.universeId || ""
        )}"`;

    return `
      <section class="wiki-article page-view">
        <header class="category-section-header">
          <div>
            <h1>${escapeHtml(page.title || page.name || "Untitled")}</h1>
          </div>
          <button class="wiki-btn" ${backAttrs}>
            ← Back
          </button>
        </header>
        <div class="markdown-content">${html}</div>
      </section>
    `;
  }

  private renderQueue(): string {
    const state = appStore.getState();
    const { queueStats, loading, errors, polling } = state;

    if (loading.queue && !queueStats) {
      return '<div class="wiki-loading">Loading queue...</div>';
    }

    const error = errors.queue ? `<div class="wiki-error">${escapeHtml(errors.queue)}</div>` : "";

    const stats = queueStats
      ? `
        <div class="queue-stats">
          <div class="queue-summary">
            <h2>Queue Summary</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-number">${queueStats.total}</div>
                <div class="stat-label">Total Jobs</div>
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
          </div>
        </div>
      `
      : '<p class="empty">Queue metrics unavailable.</p>';

    return `
      <section class="wiki-article">
        <header class="category-section-header">
          <div>
            <h1>Build Queue</h1>
            <p>Monitor the current status of content generation jobs.</p>
          </div>
          <button class="wiki-btn" data-action="show-home">← Back to Home</button>
        </header>
        ${error}
        ${stats}
        <div class="queue-controls">
          <button class="wiki-btn" data-action="refresh-queue">Refresh</button>
          <button class="wiki-btn wiki-btn-secondary" data-action="toggle-queue-polling">
            ${polling.queue ? "Stop Auto-Refresh" : "Start Auto-Refresh"}
          </button>
        </div>
      </section>
    `;
  }

  private renderJob(): string {
    const state = appStore.getState();
    const { jobStatus, jobMessage, loading, errors } = state;
    const jobId = state.selection.jobId;

    if (loading.job && !jobStatus) {
      return '<div class="wiki-loading">Checking job status...</div>';
    }

    if (errors.job) {
      return `<div class="wiki-error">${escapeHtml(errors.job)}</div>`;
    }

    if (!jobStatus && !jobMessage) {
      return '<div class="wiki-error">No job information available.</div>';
    }

    const statusDetails = jobStatus
      ? `
        <ul class="job-detail-list">
          <li><strong>Status:</strong> ${escapeHtml(jobStatus.status)}</li>
          <li><strong>Progress:</strong> ${jobStatus.progress ?? 0}%</li>
          ${jobStatus.error ? `<li><strong>Error:</strong> ${escapeHtml(jobStatus.error)}</li>` : ""}
        </ul>
      `
      : "";

    const messageBlock = jobMessage
      ? `<p>${escapeHtml(jobMessage)}</p>`
      : "";

    const universeId = state.selection.universeId;

    return `
      <section class="wiki-article">
        <header class="category-section-header">
          <div>
            <h1>Job Status</h1>
            <p>Track the progress of generated content.</p>
          </div>
          <button class="wiki-btn" data-action="show-home">← Back to Home</button>
        </header>
        <div class="job-status">
          <h2>Job ${escapeHtml(jobId || jobStatus?.jobId || "")}</h2>
          ${messageBlock}
          ${statusDetails}
          <div class="queue-controls">
            <button class="wiki-btn" data-action="check-job-status" data-job-id="${escapeHtml(
              jobId || jobStatus?.jobId || ""
            )}">
              Check Again
            </button>
            ${
              universeId
                ? `<button class="wiki-btn wiki-btn-secondary" data-action="select-universe" data-universe-id="${escapeHtml(
                    universeId
                  )}">Return to Universe</button>`
                : ""
            }
          </div>
        </div>
      </section>
    `;
  }

  private renderView(): string {
    const state = appStore.getState();
    switch (state.view) {
      case "home":
        return this.renderHome();
      case "universe":
        return this.renderUniverse();
      case "category":
        return this.renderCategory();
      case "page":
        return this.renderPage();
      case "queue":
        return this.renderQueue();
      case "job":
        return this.renderJob();
      default:
        return this.renderHome();
    }
  }

  private render() {
    this.innerHTML = this.renderView();
  }
}

if (!customElements.get("main-view")) {
  customElements.define("main-view", MainView);
}
