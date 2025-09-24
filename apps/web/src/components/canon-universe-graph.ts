import { appStore } from '../state/app-store';
import type { AppState } from '../state/app-store';
import type { UniverseGraph } from '../services/api';

type NVLCreateFn = (config: NVLVisualizationConfig) => NVLInstance;

type NVLVisualizationConfig = {
  container: HTMLElement;
  initialGraph?: NVLGraphPayload;
  data?: NVLGraphPayload;
  graph?: NVLGraphPayload;
  style?: Record<string, unknown>;
};

type NVLModule = {
  createVisualization?: NVLCreateFn;
  create?: NVLCreateFn;
  default?: NVLModule | NVLCreateFn;
  Visualization?: new (config: NVLVisualizationConfig) => NVLInstance;
  [key: string]: unknown;
};

type NVLInstance = {
  destroy?: () => void;
  render?: (graph: NVLGraphPayload) => void;
  update?: (graph: NVLGraphPayload) => void;
  setData?: (graph: NVLGraphPayload) => void;
  updateWithData?: (graph: NVLGraphPayload) => void;
  setGraph?: (graph: NVLGraphPayload) => void;
  setGraphData?: (graph: NVLGraphPayload) => void;
  [key: string]: unknown;
};

type NVLNodePayload = {
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
  caption?: string;
};

type NVLRelationshipPayload = {
  id: string;
  type: string;
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

class CanonUniverseGraph extends HTMLElement {
  private unsubscribe?: () => void;
  private state: AppState | null = null;
  private universeId?: string;
  private container?: HTMLElement;
  private viewer?: NVLInstance;
  private lastGraph?: UniverseGraph;
  private nvlModulePromise?: Promise<NVLModule | null>;
  private nvlModule?: NVLModule | null;
  private nvlError?: string;

  static get observedAttributes(): string[] {
    return ['universe-id'];
  }

  connectedCallback(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    this.universeId = this.getAttribute('universe-id') ?? undefined;
    this.ensureGraphRequest();

    this.unsubscribe = appStore.subscribe((state) => {
      this.state = state;
      this.render();
    });

    this.render();
  }

  disconnectedCallback(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }

    this.destroyViewer();
  }

  attributeChangedCallback(
    name: string,
    _oldValue: string | null,
    newValue: string | null
  ): void {
    if (name === 'universe-id') {
      this.universeId = newValue ?? undefined;
      this.ensureGraphRequest();
      this.render();
    }
  }

  private ensureGraphRequest(): void {
    if (this.universeId) {
      appStore.ensureUniverseGraph(this.universeId);
    }
  }

  private render(): void {
    if (!this.shadowRoot) {
      return;
    }

    const universeId = this.universeId;
    const state = this.state;
    const loadingGraph = state?.loading.graph ?? false;
    const storeError = state?.errors.graph;
    const graphData = universeId && state ? state.universeGraphs[universeId] : undefined;

    if (universeId && !graphData && !loadingGraph && !storeError) {
      this.ensureGraphRequest();
    }

    const libraryError = this.nvlError;

    let content = '';
    let shouldRenderCanvas = false;

    if (!universeId) {
      content = '<div class="empty">Select a universe to see its graph visualization.</div>';
    } else if (libraryError) {
      content = `
        <div class="error">
          <p>${libraryError}</p>
          <button type="button" data-action="retry">Retry</button>
        </div>
      `;
    } else if (storeError) {
      content = `<div class="error">${storeError}</div>`;
    } else if (loadingGraph && !graphData) {
      content = '<div class="loading">Loading graph…</div>';
    } else if (graphData && graphData.nodes.length === 0) {
      content = '<div class="empty">This universe does not have any graph data yet.</div>';
    } else if (graphData) {
      shouldRenderCanvas = true;
      const meta = this.renderMeta(graphData, loadingGraph);
      const overlay = loadingGraph
        ? '<div class="graph-overlay">Refreshing graph…</div>'
        : '';
      content = `
        <div class="graph-wrapper">
          ${meta}
          <div class="graph-canvas" role="application" aria-label="Universe graph visualization"></div>
          ${overlay}
        </div>
      `;
    } else {
      content = '<div class="loading">Loading graph…</div>';
    }

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
      </style>
      <div class="graph-shell">
        ${content}
      </div>
    `;

    if (libraryError) {
      const retry = this.shadowRoot.querySelector<HTMLButtonElement>('button[data-action="retry"]');
      if (retry) {
        retry.onclick = () => this.retryLibrary();
      }
      this.destroyViewer();
      return;
    }

    if (!shouldRenderCanvas || !graphData) {
      this.destroyViewer();
      this.container = undefined;
      this.lastGraph = undefined;
      return;
    }

    this.container = this.shadowRoot.querySelector<HTMLElement>('.graph-canvas') ?? undefined;
    if (!this.container) {
      return;
    }

    if (this.lastGraph === graphData && this.viewer) {
      return;
    }

    this.lastGraph = graphData;
    void this.renderVisualization(graphData);
  }

  private renderMeta(graph: UniverseGraph, loading: boolean): string {
    return `
      <div class="graph-meta">
        <span class="status-pill">${graph.nodes.length} nodes</span>
        <span class="status-pill">${graph.relationships.length} relationships</span>
        ${loading ? '<span class="status-pill">Updating…</span>' : ''}
      </div>
    `;
  }

  private async renderVisualization(graph: UniverseGraph): Promise<void> {
    if (!this.container) {
      return;
    }

    this.destroyViewer();

    const module = await this.loadNVLModule();
    if (!module) {
      this.nvlError =
        'Neo4j Visualization Library could not be loaded. Please check your network connection and try again.';
      queueMicrotask(() => this.render());
      return;
    }

    const payload = this.toNVLGraphPayload(graph);
    const instance = this.instantiateVisualization(module, payload);

    if (!instance) {
      this.nvlError =
        'Unable to initialize the Neo4j visualization. Ensure that the NVL bundle is available.';
      queueMicrotask(() => this.render());
      return;
    }

    this.viewer = instance;
    this.applyGraphData(instance, payload);
  }

  private async loadNVLModule(): Promise<NVLModule | null> {
    if (this.nvlModule) {
      return this.nvlModule;
    }

    if (!this.nvlModulePromise) {
      this.nvlModulePromise = (async () => {
        try {
          const module = await import(
            /* @vite-ignore */ 'https://cdn.jsdelivr.net/npm/@neo4j-nvl/vanilla/+esm'
          );
          return this.normalizeModule(module);
        } catch (error) {
          console.error('Failed to load NVL module', error);
          return null;
        }
      })();
    }

    const resolved = await this.nvlModulePromise;
    this.nvlModule = resolved;
    return resolved;
  }

  private normalizeModule(module: unknown): NVLModule | null {
    if (!module) {
      return null;
    }

    if (typeof module === 'function') {
      return { create: module as NVLCreateFn };
    }

    if (typeof module === 'object') {
      return module as NVLModule;
    }

    return null;
  }

  private instantiateVisualization(
    module: NVLModule,
    payload: NVLGraphPayload
  ): NVLInstance | undefined {
    if (!this.container) {
      return undefined;
    }

    const config: NVLVisualizationConfig = {
      container: this.container,
      initialGraph: payload,
      data: payload,
      graph: payload,
      style: {
        nodes: {
          caption: 'caption',
        },
      },
    };

    const factories: Array<NVLCreateFn | undefined> = [
      typeof module.createVisualization === 'function' ? module.createVisualization : undefined,
      typeof module.create === 'function' ? module.create : undefined,
    ];

    if (typeof module.default === 'function') {
      factories.push(module.default as NVLCreateFn);
    } else if (
      module.default &&
      typeof module.default === 'object' &&
      typeof (module.default as NVLModule).createVisualization === 'function'
    ) {
      factories.push((module.default as NVLModule).createVisualization as NVLCreateFn);
    }

    for (const factory of factories) {
      if (!factory) {
        continue;
      }

      try {
        return factory(config);
      } catch (error) {
        console.warn('NVL factory invocation failed', error);
      }
    }

    if (module.Visualization && typeof module.Visualization === 'function') {
      try {
        return new module.Visualization(config);
      } catch (error) {
        console.warn('NVL Visualization constructor failed', error);
      }
    }

    if (typeof module === 'function') {
      try {
        return (module as NVLCreateFn)(config);
      } catch (error) {
        console.warn('NVL module invocation failed', error);
      }
    }

    return undefined;
  }

  private applyGraphData(instance: NVLInstance, payload: NVLGraphPayload): void {
    const updateMethods: Array<keyof NVLInstance> = [
      'render',
      'update',
      'updateWithData',
      'setData',
      'setGraph',
      'setGraphData',
    ];

    for (const method of updateMethods) {
      const fn = instance[method];
      if (typeof fn === 'function') {
        try {
          (fn as (graph: NVLGraphPayload) => void).call(instance, payload);
          return;
        } catch (error) {
          console.warn(`NVL update method ${String(method)} failed`, error);
        }
      }
    }
  }

  private toNVLGraphPayload(graph: UniverseGraph): NVLGraphPayload {
    const nodes: NVLNodePayload[] = graph.nodes.map((node) => ({
      id: node.id,
      labels: [...node.labels],
      properties: { ...node.properties },
      caption: this.resolveCaption(node.caption, node.properties, node.id),
    }));

    const relationships: NVLRelationshipPayload[] = graph.relationships.map((relationship) => ({
      id: relationship.id,
      type: relationship.type,
      startNodeId: relationship.start,
      endNodeId: relationship.end,
      start: relationship.start,
      end: relationship.end,
      source: relationship.start,
      target: relationship.end,
      caption: relationship.type,
      properties: { ...relationship.properties },
    }));

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
      if (typeof candidate === 'string' && candidate.trim().length > 0) {
        return candidate.trim();
      }
    }

    return fallback;
  }

  private retryLibrary(): void {
    this.nvlError = undefined;
    this.nvlModule = undefined;
    this.nvlModulePromise = undefined;
    this.destroyViewer();
    this.ensureGraphRequest();
    this.render();
  }

  private destroyViewer(): void {
    if (this.viewer && typeof this.viewer.destroy === 'function') {
      try {
        this.viewer.destroy();
      } catch (error) {
        console.warn('Failed to destroy NVL viewer cleanly', error);
      }
    }

    this.viewer = undefined;
  }
}

if (!customElements.get('canon-universe-graph')) {
  customElements.define('canon-universe-graph', CanonUniverseGraph);
}
