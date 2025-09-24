import { NVL } from "@neo4j-nvl/base";
import {
  ClickInteraction,
  DragNodeInteraction,
  PanInteraction,
  ZoomInteraction,
  HoverInteraction,
} from "@neo4j-nvl/interaction-handlers";

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
  startNodeId: string;
  endNodeId: string;
  start?: string;
  end?: string;
  source?: string;
  target?: string;
  caption?: string;
  properties: Record<string, unknown>;
};

type NVLGraphPayload = {
  nodes: NVLNodePayload[];
  relationships: NVLRelationshipPayload[];
};

type NVLInstance =
  | NVL
  | {
      destroy?: () => void;
      render?: (graph: NVLGraphPayload) => void;
      update?: (graph: NVLGraphPayload) => void;
      setData?: (graph: NVLGraphPayload) => void;
      updateWithData?: (graph: NVLGraphPayload) => void;
      setGraph?: (graph: NVLGraphPayload) => void;
      setGraphData?: (graph: NVLGraphPayload) => void;
      [key: string]: unknown;
    };

type NVLModule = {
  createVisualization?: (config: NVLVisualizationConfig) => NVLInstance;
  create?: (config: NVLVisualizationConfig) => NVLInstance;
  Visualization?: new (config: NVLVisualizationConfig) => NVLInstance;
  default?: NVLModule | ((config: NVLVisualizationConfig) => NVLInstance);
  [key: string]: unknown;
};

type NVLVisualizationConfig = {
  container: HTMLElement;
  initialGraph?: NVLGraphPayload;
  data?: NVLGraphPayload;
  graph?: NVLGraphPayload;
  style?: {
    nodes?: {
      caption?: string;
    };
  };
};

type NVLCreateFn = (config: NVLVisualizationConfig) => NVLInstance;

class CanonFullscreenModal extends HTMLElement {
  private isOpen = false;
  private graphData?: NVLGraphPayload;
  private nvlModule?: NVLModule | null;
  private nvlModulePromise?: Promise<NVLModule | null>;
  private viewer?: NVLInstance;
  private container?: HTMLElement;

  static get observedAttributes(): string[] {
    return ["open"];
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: "open" });
    }
    this.render();
    this.setupEventListeners();
  }

  disconnectedCallback(): void {
    this.close();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    if (name === "open") {
      this.isOpen = newValue !== null;
      this.render();
      if (this.isOpen) {
        this.renderGraph();
      } else {
        this.destroyViewer();
      }
    }
  }

  open(graphData: NVLGraphPayload): void {
    this.graphData = graphData;
    this.setAttribute("open", "");
  }

  close(): void {
    this.removeAttribute("open");
    this.destroyViewer();
  }

  private render(): void {
    if (!this.shadowRoot) return;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: ${this.isOpen ? "block" : "none"};
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.8);
          z-index: 1000;
          font-family: 'Helvetica Neue', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .modal-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background: white;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: white;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(162, 169, 177, 0.2);
          flex-shrink: 0;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 600;
          color: #202122;
        }

        .close-btn {
          background: rgba(215, 51, 51, 0.1);
          border: 1px solid rgba(215, 51, 51, 0.2);
          border-radius: 8px;
          padding: 8px;
          cursor: pointer;
          color: #d73333;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-btn:hover {
          background: rgba(215, 51, 51, 0.15);
          border-color: rgba(215, 51, 51, 0.3);
        }

        .modal-canvas {
          flex: 1;
          background: white;
          overflow: hidden;
          width: 100%;
          height: calc(100vh - 60px);
          min-height: 400px;
        }
      </style>
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">Universe Graph - Fullscreen View</div>
          <button class="close-btn" id="close-btn" title="Close fullscreen">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-canvas" id="canvas"></div>
      </div>
    `;
  }

  private setupEventListeners(): void {
    const closeBtn = this.shadowRoot?.getElementById("close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    // Close on escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    };
    document.addEventListener("keydown", handleEscape);
  }

  private async renderGraph(): Promise<void> {
    if (!this.graphData) return;

    this.container = this.shadowRoot?.getElementById("canvas") as HTMLElement;
    if (!this.container) return;

    // Ensure proper dimensions
    this.container.style.height = "100%";
    this.container.style.minHeight = "400px";

    // Wait for layout
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const module = await this.loadNVLModule();
    if (!module) return;

    const instance = this.createNVLInstance(
      module,
      this.graphData,
      this.container
    );
    if (!instance) return;

    this.viewer = instance;
    this.setupInteractions(instance);
  }

  private async loadNVLModule(): Promise<NVLModule | null> {
    if (this.nvlModule) {
      return this.nvlModule;
    }

    if (!this.nvlModulePromise) {
      this.nvlModulePromise = (async () => {
        try {
          // Use the same approach as the original graph component
          const module = await import("@neo4j-nvl/base");
          return this.normalizeModule(module);
        } catch (error) {
          console.error("Failed to load NVL module", error);
          return null;
        }
      })();
    }

    const resolved = await this.nvlModulePromise;
    this.nvlModule = resolved;
    return resolved || null;
  }

  private normalizeModule(module: any): NVLModule {
    if (module.default && typeof module.default === "function") {
      return {
        createVisualization: module.default,
        create: module.default,
        Visualization: module.default,
        default: module.default,
      };
    }

    if (module.NVL && typeof module.NVL === "function") {
      return {
        createVisualization: module.NVL,
        create: module.NVL,
        Visualization: module.NVL,
        default: module.NVL,
      };
    }

    return module as NVLModule;
  }

  private createNVLInstance(
    module: NVLModule,
    payload: NVLGraphPayload,
    container: HTMLElement
  ): NVLInstance | undefined {
    // Try the direct NVL constructor approach first
    try {
      if (module.default && typeof module.default === "function") {
        const config = {
          container,
          nodes: payload.nodes,
          relationships: payload.relationships,
        };
        return new (module.default as any)(config);
      }
    } catch (error) {
      console.warn("Direct NVL constructor failed", error);
    }

    // Fallback to configuration-based approach
    const config: NVLVisualizationConfig = {
      container,
      initialGraph: payload,
      data: payload,
      graph: payload,
      style: {
        nodes: {
          caption: "caption",
        },
      },
    };

    const factories: Array<NVLCreateFn | undefined> = [
      typeof module.createVisualization === "function"
        ? module.createVisualization
        : undefined,
      typeof module.create === "function" ? module.create : undefined,
    ];

    if (typeof module.default === "function") {
      factories.push(module.default as NVLCreateFn);
    } else if (
      module.default &&
      typeof module.default === "object" &&
      typeof (module.default as NVLModule).createVisualization === "function"
    ) {
      factories.push(
        (module.default as NVLModule).createVisualization as NVLCreateFn
      );
    }

    for (const factory of factories) {
      if (!factory) {
        continue;
      }

      try {
        return factory(config);
      } catch (error) {
        console.warn("NVL factory invocation failed", error);
      }
    }

    if (module.Visualization && typeof module.Visualization === "function") {
      try {
        return new module.Visualization(config);
      } catch (error) {
        console.warn("NVL Visualization constructor failed", error);
      }
    }

    if (typeof module === "function") {
      try {
        return (module as NVLCreateFn)(config);
      } catch (error) {
        console.warn("NVL module invocation failed", error);
      }
    }

    return undefined;
  }

  private setupInteractions(instance: NVLInstance): void {
    if (!instance || !(instance instanceof NVL)) return;

    const clickInteraction = new ClickInteraction(instance);
    const dragInteraction = new DragNodeInteraction(instance);
    const panInteraction = new PanInteraction(instance);
    const zoomInteraction = new ZoomInteraction(instance);
    const hoverInteraction = new HoverInteraction(instance);

    clickInteraction.updateCallback("onNodeClick", (node: any) => {
      console.log("Node clicked in fullscreen:", node);
    });

    hoverInteraction.updateCallback("onHover", (element: any) => {
      console.log("Element hovered:", element);
    });

    panInteraction.updateCallback("onPan", (panning: any) => {
      console.log("Panning:", panning);
    });

    zoomInteraction.updateCallback("onZoom", (zoomLevel: any) => {
      console.log("Zoom level:", zoomLevel);
    });
  }

  private destroyViewer(): void {
    if (this.viewer && typeof this.viewer.destroy === "function") {
      try {
        this.viewer.destroy();
      } catch (error) {
        console.warn("Failed to destroy viewer cleanly", error);
      }
    }
    this.viewer = undefined;
  }
}

if (!customElements.get("canon-fullscreen-modal")) {
  customElements.define("canon-fullscreen-modal", CanonFullscreenModal);
}

export { CanonFullscreenModal };
