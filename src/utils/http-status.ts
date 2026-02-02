// import { NextResponse } from "next/server";

// type SuccessResponse<T> = {
//   success: true;
//   data?: T;
// };

// type ErrorResponse = {
//   success: false;
//   message: string;
//   code: string;
//   errors?: unknown;
// };

// const ok = <T>(data?: T) => NextResponse.json<SuccessResponse<T>>({ success: true, data }, { status: 200 });

// const created = <T>(data?: T) => NextResponse.json<SuccessResponse<T>>({ success: true, data }, { status: 201 });

// const error = (status: number, message: string, code = "INTERNAL_ERROR", errors?: unknown) =>
//   NextResponse.json<ErrorResponse>({ success: false, message, code, errors }, { status });

// export const http = {
//   ok,
//   created,

//   badRequest: (message = "Bad request", code = "BAD_REQUEST", errors?: unknown) => error(400, message, code, errors),

//   unauthorized: (message = "Unauthorized", code = "UNAUTHORIZED") => error(401, message, code),

//   forbidden: (message = "Forbidden", code = "FORBIDDEN") => error(403, message, code),

//   notFound: (message = "Not found", code = "NOT_FOUND") => error(404, message, code),

//   conflict: (message = "Conflict", code = "CONFLICT") => error(409, message, code),

//   serverError: (message = "Internal server error", code = "INTERNAL_ERROR") => error(500, message, code),
//   error,
// };
