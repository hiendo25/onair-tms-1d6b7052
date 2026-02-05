type RequestInit = globalThis.RequestInit;

import { HttpError } from "../errors/HttpError";

import { http } from "./http-status";

type QueryParams = Record<string, any>;
import * as qs from "qs";

const buildObjectToQueryString = (params?: QueryParams, prefix?: string) => {
  return params ? `?${qs.stringify(params)}` : "";
};

const buildUrl = (url: string) => (url.startsWith("http") ? url : url.startsWith("/") ? `/api${url}` : `/api/${url}`);

const buildBody = (body?: unknown): RequestInit["body"] | undefined => {
  if (body === undefined) return undefined;
  if (body instanceof FormData) return body;
  if (typeof body === "string") return body;
  return JSON.stringify(body);
};

const request = async <T>(url: string, init: RequestInit = {}): Promise<T> => {
  const finalUrl = buildUrl(url);

  const isFormData = init.body instanceof FormData;

  try {
    const response = await fetch(finalUrl, {
      ...init,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...init.headers,
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new HttpError(response.status, data?.error?.code || response.statusText, data?.error?.message || "", data);
    }

    return data as T;
  } catch (error: any) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw http.serverError("Network error");
  }
};

const get = <T>(url: string, queryParams?: QueryParams, init?: RequestInit) =>
  request<T>(`${url}${buildObjectToQueryString(queryParams)}`, {
    ...init,
    method: "GET",
  });

const post = <T, B = unknown>(url: string, body?: B, init?: RequestInit) =>
  request<T>(url, {
    ...init,
    method: "POST",
    body: buildBody(body),
  });

const put = <T = HttpError, B = unknown>(url: string, body?: B, init?: RequestInit) =>
  request<T>(url, {
    ...init,
    method: "PUT",
    body: buildBody(body),
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
