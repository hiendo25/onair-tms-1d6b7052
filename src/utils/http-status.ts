import { NextResponse } from "next/server";

export const ok = <T>(data?: T) => NextResponse.json({ success: true, data }, { status: 200 });

export const created = <T>(data?: T) => NextResponse.json({ success: true, data }, { status: 201 });

export const badRequest = (message = "Bad request") => NextResponse.json({ success: false, message }, { status: 400 });

export const unauthorized = () => NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

export const forbidden = () => NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });

export const internalServerError = (message = "Internal server error") =>
  NextResponse.json({ success: false, message }, { status: 500 });

export const http = {
  ok,
  created,
  badRequest,
  unauthorized,
  forbidden,
  internalServerError,
};
