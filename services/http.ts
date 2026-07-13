function normalizeApiBaseUrl(rawBaseUrl?: string): string {
  const trimmed = (rawBaseUrl ?? "").trim().replace(/\/+$/, "");
  if (!trimmed) {
    return "/api/v1";
  }
  return trimmed.endsWith("/api/v1") ? trimmed : `${trimmed}/api/v1`;
}

export const apiBaseUrl = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

export function buildApiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

function extractApiPath(url: string): string {
  if (url.startsWith("/")) {
    return url;
  }
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

export function logApiRequest(method: string, url: string, status?: number, durationMs?: number) {
  const path = extractApiPath(url);
  const suffix = [
    `path=${path}`,
    status !== undefined ? `status=${status}` : "",
    durationMs !== undefined ? `duration=${durationMs}ms` : ""
  ]
    .filter(Boolean)
    .join(" ");

  if (status !== undefined && status >= 400) {
    console.error(`[frontend-api] ${method} ${url}${suffix ? ` ${suffix}` : ""}`);
    return;
  }

  console.info(`[frontend-api] ${method} ${url}${suffix ? ` ${suffix}` : ""}`);
}
