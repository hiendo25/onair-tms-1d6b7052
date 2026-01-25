import { NextResponse } from "next/server";

import { DomainError } from "../errors/DomainError";

type SuccessResponse<T> = {
  success: true;
  data: T;
};

type ErrorResponse<E> = {
  success: false;
  message: string;
  code: string;
  meta?: E;
  data: null;
};

export type HttpResponse<TSuccess, TError = unknown> = SuccessResponse<TSuccess> | ErrorResponse<TError>;

const ok = <T>(data: T) => NextResponse.json<SuccessResponse<T>>({ success: true, data }, { status: 200 });

const created = <T>(data: T) => NextResponse.json<SuccessResponse<T>>({ success: true, data }, { status: 201 });

const fail = <M>(status: number, message: string, code = "INTERNAL_ERROR", meta?: M) =>
  NextResponse.json<ErrorResponse<M>>({ success: false, message, code, meta, data: null }, { status });

const fromDomainError = (error: DomainError) => fail(error.status, error.message, error.code, error.meta);

export const http = {
  ok,
  created,
  fromDomainError,

  badRequest: (message = "Bad request", code = "BAD_REQUEST", errors?: unknown) => fail(400, message, code, errors),

  unauthorized: (message = "Unauthorized", code = "UNAUTHORIZED") => fail(401, message, code),

  forbidden: (message = "Forbidden", code = "FORBIDDEN") => fail(403, message, code),

  notFound: (message = "Not found", code = "NOT_FOUND") => fail(404, message, code),

  conflict: (message = "Conflict", code = "CONFLICT") => fail(409, message, code),

  serverError: (message = "Internal server error", code = "INTERNAL_ERROR") => fail(500, message, code),
};
