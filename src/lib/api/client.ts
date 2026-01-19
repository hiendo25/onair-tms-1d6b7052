type RequestInit = globalThis.RequestInit;

import { HttpError } from "./HttpError";

const request = async <T>(url: string, init: RequestInit = {}): Promise<T> => {
  const finalUrl = url.startsWith("/") ? `/api${url}` : `/api/${url}`;
  const response = await fetch(finalUrl, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    throw new Error("Fetch error from server");
  }

  if (!response.ok) {
    throw new HttpError(response.status, data?.message || response.statusText, data);
  }

  return data as T;
};

const get = <T>(url: string, init?: RequestInit) =>
  request<T>(url, {
    ...init,
    method: "GET",
  });

const post = <T, B = unknown>(url: string, body?: B, init?: RequestInit) =>
  request<T>(url, {
    ...init,
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });

const put = <T, B = unknown>(url: string, body?: B, init?: RequestInit) =>
  request<T>(url, {
    ...init,
    method: "PUT",
    body: body ? JSON.stringify(body) : undefined,
  });

const del = <T>(url: string, init?: RequestInit) =>
  request<T>(url, {
    ...init,
    method: "DELETE",
  });

export const client = {
  get,
  post,
  put,
  delete: del,
};
