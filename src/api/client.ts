import config from '../config/config';

type QueryValue = string | number | boolean | undefined;

interface RequestOptions {
  body?: BodyInit | object;
  params?: Record<string, QueryValue>;
}

export function buildApiUrl(
  path: string,
  params?: Record<string, QueryValue>
) {
  const url = new URL(`${config.apiBaseUrl}${path}`);

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function request<T>(
  path: string,
  method: string,
  options?: RequestOptions
): Promise<T> {
  const headers = new Headers();
  let body: BodyInit | undefined;

  if (options?.body instanceof FormData) {
    body = options.body;
  } else if (options?.body !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(options.body);
  }

  const response = await fetch(buildApiUrl(path, options?.params), {
    method,
    headers,
    body,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`${response.status}: ${message || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, QueryValue>
) {
  return request<T>(path, 'GET', { params });
}

export async function apiGetText(
  path: string,
  params?: Record<string, QueryValue>
) {
  const response = await fetch(buildApiUrl(path, params));

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`${response.status}: ${message || response.statusText}`);
  }

  return response.text();
}

export async function apiPost<T>(path: string, body?: BodyInit | object) {
  return request<T>(path, 'POST', { body });
}

export async function apiPatch<T>(path: string, body?: BodyInit | object) {
  return request<T>(path, 'PATCH', { body });
}
