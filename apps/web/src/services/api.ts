const API_BASE = (import.meta.env.VITE_CANON_API ?? 'http://localhost:3000').replace(/\/$/, '');

async function buildError(response: Response): Promise<Error> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      const json = await response.json();
      const message = json?.error ?? json?.message ?? response.statusText;
      return new Error(message || `Request failed with status ${response.status}`);
    } catch (error) {
      return new Error(response.statusText || `Request failed with status ${response.status}`);
    }
  }

  try {
    const text = await response.text();
    if (text) {
      return new Error(text);
    }
  } catch (error) {
    // ignore
  }

  return new Error(response.statusText || `Request failed with status ${response.status}`);
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      Accept: 'application/json, text/html;q=0.9, */*;q=0.8',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw await buildError(response);
  }

  return response;
}

export interface UniverseSummary {
  id: string;
  name: string;
  description?: string;
  createdAt?: number;
}

export interface UniverseDetail extends UniverseSummary {
  categories?: string[];
}

export interface UniversePageSummary {
  id: string;
  title: string;
  name?: string;
  markdown?: string;
  type?: string;
}

export interface UniverseCategory {
  category: string;
  pages: UniversePageSummary[];
}

export interface GraphNode {
  id: string;
  labels: string[];
  properties: Record<string, unknown>;
  caption?: string;
}

export interface GraphRelationship {
  id: string;
  type: string;
  start: string;
  end: string;
  properties: Record<string, unknown>;
}

export interface UniverseGraph {
  nodes: GraphNode[];
  relationships: GraphRelationship[];
}

export interface PageMetadata {
  id: string;
  name?: string;
  title: string;
  markdown?: string;
  labels?: string[];
}

export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
}

interface ApiListResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

interface ApiItemResponse<T> {
  success: boolean;
  data: T;
}

export interface CreateUniverseResponse {
  status: string;
  message: string;
  universe?: UniverseDetail;
  jobId?: string | null;
}

export interface JobStatusResponse {
  jobId: string;
  status: string;
  progress?: number;
  data?: Record<string, unknown>;
  result?: unknown;
  error?: string;
  createdAt?: number;
  processedAt?: number;
  finishedAt?: number;
}

export async function fetchUniverses(): Promise<UniverseSummary[]> {
  const response = await request('/api/universes');
  const payload = (await response.json()) as ApiListResponse<UniverseSummary[]>;
  return payload?.data ?? [];
}

export async function fetchUniverse(universeId: string): Promise<UniverseDetail> {
  const response = await request(`/api/universes/${encodeURIComponent(universeId)}`);
  const payload = (await response.json()) as ApiItemResponse<UniverseDetail>;
  return payload?.data;
}

export async function fetchUniverseCategories(
  universeId: string
): Promise<UniverseCategory[]> {
  const response = await request(`/api/universes/${encodeURIComponent(universeId)}/entities`);
  const payload = (await response.json()) as ApiItemResponse<UniverseCategory[]>;
  return payload?.data ?? [];
}

export async function fetchUniverseGraph(universeId: string): Promise<UniverseGraph> {
  const response = await request(`/api/universes/${encodeURIComponent(universeId)}/graph`);
  const payload = (await response.json()) as ApiItemResponse<UniverseGraph>;
  return payload?.data ?? { nodes: [], relationships: [] };
}

export async function fetchPageMetadata(pageId: string): Promise<PageMetadata> {
  const response = await request(`/api/entities/${encodeURIComponent(pageId)}`);
  const payload = (await response.json()) as ApiItemResponse<PageMetadata>;
  return payload?.data;
}

export async function fetchPageFragment(pageId: string): Promise<string> {
  const response = await request(`/universes/page/${encodeURIComponent(pageId)}/fragment`, {
    headers: {
      Accept: 'text/html, application/json;q=0.9, */*;q=0.8',
    },
  });
  return response.text();
}

export async function createUniverse(name: string): Promise<CreateUniverseResponse> {
  const response = await request('/universes/new', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

  return (await response.json()) as CreateUniverseResponse;
}

export async function fetchQueueStats(): Promise<QueueStats> {
  const response = await request('/queue/stats');
  return (await response.json()) as QueueStats;
}

export async function fetchJobStatus(jobId: string): Promise<JobStatusResponse> {
  const response = await request(`/job/${encodeURIComponent(jobId)}/status`);
  return (await response.json()) as JobStatusResponse;
}

export async function createContent(
  universeId: string,
  type: string
): Promise<string> {
  const response = await request('/content/create', {
    method: 'POST',
    body: JSON.stringify({ universeId, type }),
  });

  return response.text();
}
