import { appStore } from "../state/app-store";
import type { AppState } from "../state/app-store";
import type { UniversePageSummary } from "../services/api";
import { createContent } from "../services/api";

class CanonCategoryPanel extends HTMLElement {
  private unsubscribe?: () => void;
  private state: AppState | null = null;
  private creatingContent: Set<string> = new Set();

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

  private render(): void {
    if (!this.shadowRoot || !this.state) {
      return;
    }

    const route = this.state.route;
    if (route.view !== "category") {
      this.shadowRoot.innerHTML = "";
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

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-top: 16px;
        }

        .create-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .create-buttons ds-button {
          font-size: 14px;
          padding: 8px 16px;
        }

        .create-buttons ds-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      </style>
      <section>
        <header>
          <h1>${categoryName}</h1>
          <p class="meta">Entries connected to ${categoryName.toLowerCase()} in this universe.</p>
          <div class="header-actions">
            <ds-button variant="secondary" id="back-btn">Back to universe</ds-button>
            ${this.renderCreateButtons(categoryName)}
          </div>
        </header>
        ${
          loading
            ? '<div class="loading">Loading category pages…</div>'
            : error
              ? `<div class="error">${error}</div>`
              : pages.length === 0
                ? '<div class="empty">No pages have been generated for this category yet.</div>'
                : `<div class="pages">${pages
                    .map((page) =>
                      this.renderPageCard(page, universeId, categoryName)
                    )
                    .join("")}</div>`
        }
      </section>
    `;

    const backButton =
      this.shadowRoot.querySelector<HTMLButtonElement>("#back-btn");
    if (backButton) {
      backButton.onclick = () => {
        appStore.navigate({ view: "universe", universeId });
      };
    }

    const viewButtons = this.shadowRoot.querySelectorAll<HTMLButtonElement>(
      "ds-button[data-page]"
    );
    viewButtons.forEach((button) => {
      const pageId = button.getAttribute("data-page");
      if (!pageId) {
        return;
      }

      button.onclick = () => {
        appStore.navigate({
          view: "page",
          pageId,
          universeId,
          categoryName,
        });
      };
    });

    const createButtons = this.shadowRoot.querySelectorAll<HTMLButtonElement>(
      "ds-button[data-create-type]"
    );
    createButtons.forEach((button) => {
      const createType = button.getAttribute("data-create-type");
      if (!createType) {
        return;
      }

      button.onclick = () => {
        this.handleCreateContent(universeId, createType);
      };
    });
  }

  private renderCreateButtons(categoryName: string): string {
    // Map category names to their corresponding content types
    const categoryToType: Record<
      string,
      { type: string; label: string; icon: string }
    > = {
      technologies: {
        type: "technology",
        label: "Create Technology",
        icon: "⚙️",
      },
      characters: { type: "character", label: "Create Character", icon: "👤" },
      worlds: { type: "world", label: "Create World", icon: "🌍" },
      societies: { type: "society", label: "Create Society", icon: "🏛️" },
      flora: { type: "flora", label: "Create Flora", icon: "🌿" },
      fauna: { type: "fauna", label: "Create Fauna", icon: "🐾" },
      events: { type: "event", label: "Create Event", icon: "📅" },
    };

    const categoryKey = categoryName.toLowerCase();
    console.log(
      "Category name:",
      categoryName,
      "Category key:",
      categoryKey,
      "Available keys:",
      Object.keys(categoryToType)
    );
    const contentType = categoryToType[categoryKey];

    if (!contentType) {
      // Fallback: show all buttons if category doesn't match
      const allContentTypes = [
        { type: "world", label: "Create World", icon: "🌍" },
        { type: "character", label: "Create Character", icon: "👤" },
        { type: "technology", label: "Create Technology", icon: "⚙️" },
        { type: "society", label: "Create Society", icon: "🏛️" },
        { type: "flora", label: "Create Flora", icon: "🌿" },
        { type: "fauna", label: "Create Fauna", icon: "🐾" },
        { type: "event", label: "Create Event", icon: "📅" },
      ];

      return `
        <div class="create-buttons">
          ${allContentTypes
            .map(
              ({ type, label, icon }) => `
            <ds-button 
              variant="primary" 
              data-create-type="${type}"
              ${this.creatingContent.has(type) ? "disabled" : ""}
            >
              ${icon} ${label}
            </ds-button>
          `
            )
            .join("")}
        </div>
      `;
    }

    return `
      <div class="create-buttons">
        <ds-button 
          variant="primary" 
          data-create-type="${contentType.type}"
          ${this.creatingContent.has(contentType.type) ? "disabled" : ""}
        >
          ${contentType.icon} ${contentType.label}
        </ds-button>
      </div>
    `;
  }

  private async handleCreateContent(
    universeId: string,
    type: string
  ): Promise<void> {
    if (this.creatingContent.has(type)) {
      return;
    }

    this.creatingContent.add(type);
    this.render(); // Re-render to show loading state

    try {
      const jobId = await createContent(universeId, type);
      console.log(
        `Content creation started for ${type} in universe ${universeId}, job ID: ${jobId}`
      );

      // TODO: Add job tracking and notification system
      // For now, just show a simple alert
      alert(`Creating ${type}... Job ID: ${jobId}`);

      // Refresh the category pages to show new content
      // We need to access the private method, so we'll trigger a route refresh instead
      const currentRoute = this.state?.route;
      if (currentRoute && currentRoute.view === "category") {
        // Trigger a re-navigation to refresh the data
        appStore.navigate(currentRoute);
      }
    } catch (error) {
      console.error(`Failed to create ${type}:`, error);
      alert(
        `Failed to create ${type}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      this.creatingContent.delete(type);
      this.render(); // Re-render to remove loading state
    }
  }

  private renderPageCard(
    page: UniversePageSummary,
    universeId: string,
    categoryName: string
  ): string {
    return `
      <article class="page-card">
        <h2>${page.title ?? page.name ?? "Untitled page"}</h2>
        <p>${page.type ? page.type : "Page content"} — ${page.id}</p>
        <footer>
          <ds-button variant="secondary" data-page="${page.id}" data-universe="${universeId}" data-category="${categoryName}">
            View page
          </ds-button>
        </footer>
      </article>
    `;
  }
}

if (!customElements.get("canon-category-panel")) {
  customElements.define("canon-category-panel", CanonCategoryPanel);
}
