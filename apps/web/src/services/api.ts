const DEFAULT_BASE_URL = "http://localhost:3000";

declare global {
  interface Window {
    __CANON_BFF_URL__?: string;
  }
}

function resolveBaseUrl(): string {
  const envBase =
    (typeof import.meta !== "undefined" &&
      import.meta.env &&
      (import.meta.env.VITE_BFF_URL as string | undefined)) ||
    (typeof window !== "undefined" ? window.__CANON_BFF_URL__ : undefined);

  const raw = envBase && envBase.trim().length > 0 ? envBase : DEFAULT_BASE_URL;
  return raw.replace(/\/?$/, "");
}

const BASE_URL = resolveBaseUrl();

type ParseMode = "json" | "text";

async function request<T>(
  path: string,
  options: RequestInit = {},
  parseMode: ParseMode = "json"
): Promise<T> {
  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      if (typeof errorBody === "object" && errorBody !== null) {
        errorMessage =
          (errorBody.message as string | undefined) ||
          (errorBody.error as string | undefined) ||
          errorMessage;
      }
    } catch (_) {
      // ignore JSON parsing errors and fall back to default message
    }
    throw new Error(errorMessage);
  }

  if (parseMode === "text") {
    return (await response.text()) as T;
  }

  return (await response.json()) as T;
}

export interface UniverseSummary {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: number | string | null;
}

export interface UniverseDetails extends UniverseSummary {
  categories: string[];
}

export interface UniversePageSummary {
  id: string;
  name?: string | null;
  title?: string | null;
  markdown?: string | null;
  type?: string | null;
}

export interface UniverseCategory {
  category: string;
  pages: UniversePageSummary[];
}

export interface CreateUniverseResponse {
  status: string;
  message: string;
  universe?: UniverseSummary;
  jobId?: string | null;
}

export interface CreateContentResponse {
  jobId?: string;
  status?: string;
  message?: string;
  rawHtml: string;
}

export interface JobStatusResponse {
  jobId: string;
  status: string;
  progress?: number;
  data?: Record<string, unknown> | null;
  result?: Record<string, unknown> | null;
  error?: string | null;
  createdAt?: number | string | null;
  processedAt?: number | string | null;
  finishedAt?: number | string | null;
}

export interface QueueStatsResponse {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  total: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

export async function fetchUniverses(): Promise<UniverseSummary[]> {
  const response = await request<ApiResponse<UniverseSummary[]>>("/api/universes");
  return response.data ?? [];
}

export async function fetchUniverseDetails(
  universeId: string
): Promise<UniverseDetails> {
  const response = await request<ApiResponse<UniverseDetails>>(
    `/api/universes/${encodeURIComponent(universeId)}`
  );
  return response.data;
}

export async function fetchUniverseEntities(
  universeId: string
): Promise<UniverseCategory[]> {
  const response = await request<ApiResponse<UniverseCategory[]>>(
    `/api/universes/${encodeURIComponent(universeId)}/entities`
  );
  return response.data ?? [];
}

export async function fetchUniversePage(
  pageId: string
): Promise<UniversePageSummary> {
  const response = await request<ApiResponse<UniversePageSummary>>(
    `/api/entities/${encodeURIComponent(pageId)}`
  );
  return response.data;
}

export async function createUniverseRequest(
  name: string
): Promise<CreateUniverseResponse> {
  return request<CreateUniverseResponse>(
    "/new",
    {
      method: "POST",
      body: JSON.stringify({ name }),
    },
    "json"
  );
}

function parseContentQueuedHtml(html: string): CreateContentResponse {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const container = doc.querySelector(".content-queued");
    if (!container) {
      return { rawHtml: html };
    }

    const jobParagraph = Array.from(container.querySelectorAll("p")).find((p) =>
      /job id/i.test(p.textContent ?? "")
    );
    const statusParagraph = Array.from(container.querySelectorAll("p")).find((p) =>
      /status/i.test(p.textContent ?? "")
    );
    const messageParagraph = Array.from(container.querySelectorAll("p")).find((p) =>
      !/job id/i.test(p.textContent ?? "") && !/status/i.test(p.textContent ?? "")
    );

    const jobId = jobParagraph?.textContent?.split(":").pop()?.trim();
    const status = statusParagraph?.textContent?.split(":").pop()?.trim();
    const message = messageParagraph?.textContent?.trim();

    return {
      jobId: jobId || undefined,
      status: status || undefined,
      message: message || undefined,
      rawHtml: html,
    };
  } catch (error) {
    console.error("Failed to parse content queued HTML:", error);
    return { rawHtml: html };
  }
}

export async function createContentRequest(
  universeId: string,
  type: string
): Promise<CreateContentResponse> {
  const html = await request<string>(
    "/content/create",
    {
      method: "POST",
      body: JSON.stringify({ universeId, type }),
    },
    "text"
  );
  return parseContentQueuedHtml(html);
}

export async function fetchJobStatus(jobId: string): Promise<JobStatusResponse> {
  return request<JobStatusResponse>(`/job/${encodeURIComponent(jobId)}/status`);
}

export async function fetchQueueStats(): Promise<QueueStatsResponse> {
  return request<QueueStatsResponse>("/queue/stats");
}
