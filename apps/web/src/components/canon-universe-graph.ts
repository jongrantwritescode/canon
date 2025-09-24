import { appStore } from "../state/app-store";
import type { AppState } from "../state/app-store";
import type { UniverseGraph } from "../services/api";
import { NVL } from "@neo4j-nvl/base";

type NVLInstance = NVL | { destroy?: () => void };

type NVLNodePayload = {
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
  caption?: string;
};

type NVLRelationshipPayload = {
  id: string;
  type: string;
  from: string;
  to: string;
  properties: Record<string, unknown>;
};

type NVLGraphPayload = {
  nodes: NVLNodePayload[];
  relationships: NVLRelationshipPayload[];
};

class CanonUniverseGraph extends HTMLElement {
  private unsubscribe?: () => void;
  private state: AppState | null = null;
  private universeId?: string;
  private container?: HTMLElement;
  private viewer?: NVLInstance;
  private lastGraph?: UniverseGraph;
  private nvlError?: string;
  private isFullscreen = false;

  static get observedAttributes(): string[] {
    return ["universe-id"];
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }

    this.universeId = this.getAttribute("universe-id") ?? undefined;
    this.ensureGraphRequest();

    this.unsubscribe = appStore.subscribe((state) => {
      this.state = state;
      void this.render();
    });

    void this.render();
  }

  disconnectedCallback(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }

    this.exitFullscreen();
    this.destroyViewer();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    if (name === "universe-id") {
      this.universeId = newValue ?? undefined;
      this.ensureGraphRequest();
      void this.render();
    }
  }

  private ensureGraphRequest(): void {
    if (this.universeId) {
      appStore.ensureUniverseGraph(this.universeId);
    }
  }

  private async render(): Promise<void> {
    if (!this.shadowRoot) {
      return;
    }

    const { universeId, graphData, loadingGraph, storeError, libraryError } =
      this.getRenderState();

    if (universeId && !graphData && !loadingGraph && !storeError) {
      this.ensureGraphRequest();
    }

    const content = this.renderContent(
      universeId,
      graphData,
      loadingGraph,
      storeError,
      libraryError
    );
    const shouldRenderCanvas = !!graphData && graphData.nodes.length > 0;

    this.renderHTML(content);

    if (libraryError) {
      this.setupRetryButton();
      this.destroyViewer();
      return;
    }

    this.setupFullscreenButton();

    if (shouldRenderCanvas && graphData) {
      await this.setupCanvas(graphData);
    } else {
      this.destroyViewer();
      this.container = undefined;
      this.lastGraph = undefined;
    }
  }

  private getRenderState() {
    const universeId = this.universeId;
    const state = this.state;
    const loadingGraph = state?.loading.graph ?? false;
    const storeError = state?.errors.graph;
    const graphData =
      universeId && state ? state.universeGraphs[universeId] : undefined;
    const libraryError = this.nvlError;

    return { universeId, graphData, loadingGraph, storeError, libraryError };
  }

  private renderContent(
    universeId: string | undefined,
    graphData: UniverseGraph | undefined,
    loadingGraph: boolean,
    storeError: string | undefined,
    libraryError: string | undefined
  ): string {
    if (!universeId) {
      return '<div class="empty">Select a universe to see its graph visualization.</div>';
    }

    const fullscreenIcon = this.renderFullscreenIcon();

    if (libraryError) {
      return `
        <div class="error">
          <p>${libraryError}</p>
          <button type="button" data-action="retry">Retry</button>
          ${fullscreenIcon}
        </div>
      `;
    }

    if (storeError) {
      return `
        <div class="error">
          ${storeError}
          ${fullscreenIcon}
        </div>
      `;
    }

    if (loadingGraph && !graphData) {
      return `
        <div class="loading">
          Loading graph…
          ${fullscreenIcon}
        </div>
      `;
    }

    if (graphData && graphData.nodes.length === 0) {
      return `
        <div class="empty">
          This universe does not have any graph data yet.
          ${fullscreenIcon}
        </div>
      `;
    }

    if (graphData) {
      const meta = this.renderMeta(graphData, loadingGraph);
      const overlay = loadingGraph
        ? '<div class="graph-overlay">Refreshing graph…</div>'
        : "";
      return `
        <div class="graph-wrapper">
          <div class="graph-header">
            ${meta}
            ${fullscreenIcon}
          </div>
          <div class="graph-canvas" role="application" aria-label="Universe graph visualization"></div>
          ${overlay}
        </div>
      `;
    }

    return `
      <div class="loading">
        Loading graph…
        ${fullscreenIcon}
      </div>
    `;
  }

  private renderHTML(content: string): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          min-height: 320px;
        }

        .graph-shell {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(162, 169, 177, 0.24);
          box-shadow: 0 16px 32px rgba(18, 23, 40, 0.08);
          padding: 20px;
          min-height: 320px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .graph-wrapper {
          position: relative;
          flex: 1;
          border-radius: 12px;
          border: 1px solid rgba(162, 169, 177, 0.2);
          background: linear-gradient(180deg, rgba(248, 249, 253, 0.9), #ffffff);
          overflow: hidden;
          min-height: 280px;
          display: flex;
          flex-direction: column;
        }

        .graph-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(162, 169, 177, 0.1);
        }

        .fullscreen-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          color: rgba(32, 33, 34, 0.68);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fullscreen-button:hover {
          background: rgba(51, 102, 204, 0.12);
          color: #1f409c;
        }

        .fullscreen-icon {
          width: 18px;
          height: 18px;
          fill: currentColor;
        }

        .graph-canvas {
          flex: 1;
          min-height: 260px;
        }

        .graph-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          font-size: 14px;
          color: rgba(32, 33, 34, 0.68);
          flex-wrap: wrap;
          border-bottom: 1px solid rgba(162, 169, 177, 0.2);
          background: rgba(255, 255, 255, 0.85);
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(51, 102, 204, 0.12);
          color: #1f409c;
        }

        .loading,
        .error,
        .empty {
          padding: 28px;
          text-align: center;
          border-radius: 12px;
          border: 1px solid rgba(162, 169, 177, 0.2);
          background: rgba(255, 255, 255, 0.96);
          box-shadow: 0 12px 24px rgba(18, 23, 40, 0.08);
          font-size: 15px;
          position: relative;
        }

        .loading .fullscreen-button,
        .error .fullscreen-button,
        .empty .fullscreen-button {
          position: absolute;
          top: 12px;
          right: 12px;
        }

        .loading {
          color: #1f409c;
          background: rgba(51, 102, 204, 0.08);
        }

        .empty {
          color: #0b6952;
          background: rgba(20, 134, 109, 0.08);
        }

        .error {
          color: #861616;
          background: rgba(215, 51, 51, 0.12);
          display: grid;
          gap: 12px;
        }

        .error button {
          justify-self: center;
          border: none;
          background: #3366cc;
          color: #ffffff;
          padding: 8px 18px;
          border-radius: 999px;
          font: inherit;
          cursor: pointer;
        }

        .graph-overlay {
          position: absolute;
          inset: 0;
          background: rgba(255, 255, 255, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          color: #1f409c;
          pointer-events: none;
        }

        /* Fullscreen styles */
        :host(.fullscreen) {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          background: #ffffff;
          border-radius: 0;
          box-shadow: none;
          border: none;
          padding: 0;
          min-height: 100vh;
        }

        :host(.fullscreen) .graph-shell {
          border-radius: 0;
          border: none;
          box-shadow: none;
          padding: 0;
          min-height: 100vh;
        }

        :host(.fullscreen) .graph-wrapper {
          border-radius: 0;
          border: none;
          min-height: 100vh;
        }

        :host(.fullscreen) .graph-canvas {
          min-height: calc(100vh - 60px);
        }
      </style>
      <div class="graph-shell">
        ${content}
      </div>
    `;
  }

  private setupRetryButton(): void {
    if (!this.shadowRoot) return;

    const retry = this.shadowRoot.querySelector<HTMLButtonElement>(
      'button[data-action="retry"]'
    );
    if (retry) {
      retry.onclick = () => this.retryLibrary();
    }
  }

  private setupFullscreenButton(): void {
    if (!this.shadowRoot) return;

    const fullscreenButton = this.shadowRoot.querySelector<HTMLButtonElement>(
      'button[data-action="fullscreen"]'
    );
    if (fullscreenButton) {
      fullscreenButton.onclick = () => this.toggleFullscreen();
    }
  }

  private async setupCanvas(graphData: UniverseGraph): Promise<void> {
    this.container =
      this.shadowRoot?.querySelector<HTMLElement>(".graph-canvas") ?? undefined;
    if (!this.container) {
      return;
    }

    // Ensure proper dimensions for NVL
    this.container.style.height = "100%";
    this.container.style.minHeight = "260px";
    this.container.style.width = "100%";

    if (this.lastGraph === graphData && this.viewer) {
      return;
    }

    this.lastGraph = graphData;
    // Wait for layout before rendering
    await new Promise((resolve) => requestAnimationFrame(resolve));
    void this.renderVisualization(graphData);
  }

  private renderMeta(graph: UniverseGraph, loading: boolean): string {
    return `
      <div class="graph-meta">
        <span class="status-pill">${graph.nodes.length} nodes</span>
        <span class="status-pill">${graph.relationships.length} relationships</span>
        ${loading ? '<span class="status-pill">Updating…</span>' : ""}
      </div>
    `;
  }

  private renderFullscreenIcon(): string {
    const iconPath = this.isFullscreen
      ? "M9 9V3H7v2.59L3.91 2.5 2.5 3.91 5.59 7H3v2h6V9zm8 0V7h-2.59l3.09-3.09L17.09 2.5 14 5.59V3h-2v6h6V9zM3 15h2v2.59l3.09-3.09 1.41 1.41L6.41 19H9v2H3v-6zm16 0v6h-6v-2h2.59l-3.09-3.09 1.41-1.41L17.59 17H15v-2h4z"
      : "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z";

    return `
      <button type="button" class="fullscreen-button" data-action="fullscreen" title="${this.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}">
        <svg class="fullscreen-icon" viewBox="0 0 24 24">
          <path d="${iconPath}"/>
        </svg>
      </button>
    `;
  }

  private async renderVisualization(graph: UniverseGraph): Promise<void> {
    if (!this.container) {
      return;
    }

    this.destroyViewer();

    const payload = this.toNVLGraphPayload(graph);
    const instance = this.instantiateVisualization(payload);

    if (!instance) {
      this.nvlError =
        "Unable to initialize the Neo4j visualization. Ensure that the NVL bundle is available.";
      queueMicrotask(() => void this.render());
      return;
    }

    this.viewer = instance;
  }

  private instantiateVisualization(
    payload: NVLGraphPayload
  ): NVLInstance | undefined {
    if (!this.container) {
      return undefined;
    }

    // Use the direct NVL constructor - simple and direct
    try {
      return new NVL(this.container, payload.nodes, payload.relationships);
    } catch (error) {
      console.error("Failed to create NVL instance", error);
      return undefined;
    }
  }

  private toNVLGraphPayload(graph: UniverseGraph): NVLGraphPayload {
    const nodes: NVLNodePayload[] = graph.nodes.map((node) => ({
      id: node.id,
      labels: [...node.labels],
      properties: { ...node.properties },
      caption: this.resolveCaption(node.caption, node.properties, node.id),
    }));

    const relationships: NVLRelationshipPayload[] = graph.relationships.map(
      (relationship) => ({
        id:
          relationship.id ||
          `rel_${relationship.start}_${relationship.end}_${Date.now()}`,
        type: relationship.type,
        from: relationship.start,
        to: relationship.end,
        properties: { ...relationship.properties },
      })
    );

    return { nodes, relationships };
  }

  private resolveCaption(
    explicitCaption: string | undefined,
    properties: Record<string, unknown>,
    fallback: string
  ): string {
    if (explicitCaption && explicitCaption.trim().length > 0) {
      return explicitCaption;
    }

    const candidates: Array<unknown> = [
      properties.title,
      properties.name,
      properties.id,
      properties.label,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim().length > 0) {
        return candidate.trim();
      }
    }

    return fallback;
  }

  private retryLibrary(): void {
    this.nvlError = undefined;
    this.destroyViewer();
    this.ensureGraphRequest();
    void this.render();
  }

  private toggleFullscreen(): void {
    if (this.isFullscreen) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }

  private enterFullscreen(): void {
    this.isFullscreen = true;
    this.classList.add("fullscreen");

    // Add escape key listener
    document.addEventListener("keydown", this.handleEscapeKey);

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    // Re-render to update the icon
    void this.render();
  }

  private exitFullscreen(): void {
    this.isFullscreen = false;
    this.classList.remove("fullscreen");

    // Remove escape key listener
    document.removeEventListener("keydown", this.handleEscapeKey);

    // Restore body scroll
    document.body.style.overflow = "";

    // Re-render to update the icon
    void this.render();
  }

  private handleEscapeKey = (event: KeyboardEvent): void => {
    if (event.key === "Escape" && this.isFullscreen) {
      this.exitFullscreen();
    }
  };

  private destroyViewer(): void {
    if (this.viewer && typeof this.viewer.destroy === "function") {
      try {
        this.viewer.destroy();
      } catch (error) {
        console.warn("Failed to destroy NVL viewer cleanly", error);
      }
    }

    this.viewer = undefined;
  }
}

if (!customElements.get("canon-universe-graph")) {
  customElements.define("canon-universe-graph", CanonUniverseGraph);
}
