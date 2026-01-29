import type { NextRequest } from "next/server";

import { organizationMiddleware } from "./lib/organization-middleware";

export async function proxy(request: NextRequest) {
  return await organizationMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|manifest.webmanifest|sw.js|favicon.ico|.*\\.png$).*)"],
};
