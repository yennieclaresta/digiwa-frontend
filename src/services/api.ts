type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH';
  token?: string;
  body?: Record<string, unknown>;
};

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim().replace(/\/+$/, '');

function toNetworkErrorMessage(error: unknown, url: string) {
  const fallback = 'Gagal terhubung ke server.';
  if (!(error instanceof Error)) {
    return `${fallback} Target: ${url}`;
  }
  if (!error.message) {
    return `${fallback} Target: ${url}`;
  }
  return `${fallback} Target: ${url}. Detail: ${error.message}`;
}

function baseUrl() {
  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL belum diatur.');
  }
  return API_BASE_URL;
}

async function apiRequest<T>(path: string, options: RequestOptions = {}) {
  const url = `${baseUrl()}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    throw new Error(toNetworkErrorMessage(error, url));
  }

  const payload = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || 'Gagal terhubung ke server.');
  }

  return payload as T;
}

export function getApiBaseUrl() {
  return baseUrl();
}

export function login(identifier: string, password: string) {
  return apiRequest<{ token: string; user: unknown }>('/auth/login', {
    method: 'POST',
    body: { identifier, password },
  });
}

export function register(body: Record<string, unknown>) {
  return apiRequest<{ token: string; user: unknown }>('/auth/register', {
    method: 'POST',
    body,
  });
}

export function getMe(token: string) {
  return apiRequest<{ user: unknown }>('/me', { token });
}

export function updateMe(token: string, body: Record<string, unknown>) {
  return apiRequest<{ user: unknown; message: string }>('/me', {
    method: 'PATCH',
    token,
    body,
  });
}

export function updateMyPassword(token: string, body: Record<string, unknown>) {
  return apiRequest<{ message: string }>('/me/password', {
    method: 'POST',
    token,
    body,
  });
}

export function listRequests(token: string, query?: Record<string, string>) {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });
  const suffix = params.size ? `?${params.toString()}` : '';
  return apiRequest<{ requests: unknown[] }>(`/requests${suffix}`, { token });
}

export function getRequest(token: string, requestId: string) {
  return apiRequest<{ request: unknown }>(`/requests/${requestId}`, { token });
}

export function createRequest(token: string, body: Record<string, unknown>) {
  return apiRequest<{ request: unknown }>('/requests', {
    method: 'POST',
    token,
    body,
  });
}

export function listNotifications(token: string) {
  return apiRequest<{ notifications: unknown[] }>('/notifications', { token });
}

export function markNotificationRead(token: string, notificationId: string) {
  return apiRequest<{ ok: boolean }>(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
    token,
  });
}

export function getAdminDashboard(token: string) {
  return apiRequest<{ stats: Record<string, unknown>; recentRequests: unknown[]; recentActivity: unknown[] }>(
    '/admin/dashboard',
    { token },
  );
}

export function updateRequestStatus(token: string, requestId: string, body: Record<string, unknown>) {
  return apiRequest<{ request: unknown; message: string }>(`/admin/requests/${requestId}/status`, {
    method: 'PATCH',
    token,
    body,
  });
}

export function requestUploadSignature(token: string, serviceType: string) {
  return apiRequest<{
    cloudName: string;
    apiKey: string;
    timestamp: number;
    folder: string;
    signature: string;
    uploadUrl: string;
  }>('/uploads/signature', {
    method: 'POST',
    token,
    body: { serviceType },
  });
}

export function generateDocument(
  token: string,
  requestId: string,
  overrides?: { publicId?: string; fileName?: string; documentLabel?: string },
) {
  return apiRequest<{ document: unknown }>('/documents/mock', {
    method: 'POST',
    token,
    body: { requestId, ...overrides },
  });
}
