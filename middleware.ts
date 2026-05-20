import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

import * as jose from "jose";

import { ROLE } from "./lib/enum";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;

  // ─── API Route Protection ─────────────────────────────────────────

  const protectedApiRoutes: { path: string; role: string | string[] }[] = [
    { path: "/api/admin", role: [ROLE.ADMIN, ROLE.SUPER_ADMIN] },

    { path: "/api/delegate/questions", role: [ROLE.USER, ROLE.GUEST, ROLE.ORGANIZER, ROLE.ADMIN, ROLE.SUPER_ADMIN] },

    { path: "/api/delegate/certificate-permissions", role: [ROLE.USER, ROLE.GUEST, ROLE.ORGANIZER, ROLE.ADMIN, ROLE.SUPER_ADMIN] },
  ];

  const apiRouteMatch = protectedApiRoutes.find((route) =>
    pathname.startsWith(route.path),
  );

  if (apiRouteMatch) {
    if (!accessToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_ACCESS_TOKEN_SECRET,
      );

      const { payload } = await jose.jwtVerify(accessToken, secret);

      // Handle both string and array role formats
      const userRoles = Array.isArray(payload.role) ? payload.role : [payload.role as string];

      const hasPermission =
        Array.isArray(apiRouteMatch.role)
          ? apiRouteMatch.role.some(role => userRoles.includes(role))
          : userRoles.includes(apiRouteMatch.role);

      if (!hasPermission) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ message: "Invalid Session" }, { status: 401 });
    }
  }

  // ─── Page Route Protection ────────────────────────────────────────

  const protectedPageRoutes = [
    { path: "/delegate-id-card", role: [ROLE.USER, ROLE.GUEST, ROLE.ORGANIZER] },

    { path: "/delegate-certificate", role: [ROLE.USER, ROLE.GUEST, ROLE.ORGANIZER] },

    { path: "/questions", role: [ROLE.USER, ROLE.GUEST, ROLE.ORGANIZER] },

    // { path: "/event", role: [ROLE.USER, ROLE.GUEST, ROLE.ORGANIZER] },

    { path: "/admin", role: [ROLE.ADMIN, ROLE.SUPER_ADMIN] },

    // add more protected pages here as needed
  ];

  const pageRouteMatch = protectedPageRoutes.find((route) =>
    pathname.startsWith(route.path),
  );

  if (pageRouteMatch) {
    // No token → redirect to login

    if (!accessToken) {
      const loginUrl = new URL("/login", request.url);

      loginUrl.searchParams.set("from", pathname); // so login can redirect back

      return NextResponse.redirect(loginUrl);
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_ACCESS_TOKEN_SECRET,
      );

      const { payload } = await jose.jwtVerify(accessToken, secret);

      // Handle both string and array role formats
      const userRoles = Array.isArray(payload.role) ? payload.role : [payload.role as string];

      const hasPermission =
        Array.isArray(pageRouteMatch.role)
          ? pageRouteMatch.role.some(role => userRoles.includes(role))
          : userRoles.includes(pageRouteMatch.role);

      if (!hasPermission) {
        // Authenticated but wrong role → send to unauthorized page

        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      // Valid token + correct role → attach user info to headers

      // page/API can read these without re-verifying the JWT

      const requestHeaders = new Headers(request.headers);

      if (payload.sub) requestHeaders.set("x-user-id", payload.sub as string);

      if (payload.email)
        requestHeaders.set("x-user-email", payload.email as string);

      requestHeaders.set("x-user-role", userRoles[0]); // Set first role for header

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch (err) {
      console.error("Middleware JWT Error:", err);

      // Expired/invalid token → clear cookie and redirect to login

      const loginUrl = new URL("/login", request.url);

      loginUrl.searchParams.set("from", pathname);

      const response = NextResponse.redirect(loginUrl);

      response.cookies.delete("accessToken");

      return response;
    }
  }

  return NextResponse.next();
}

// ─── Matcher: run on both API and page routes ─────────────────────

export const config = {
  matcher: [
    "/api/delegate/:path*",

    "/api/admin/:path*",

    "/admin",

    "/admin/:path*",

    "/delegate-id-card",

    "/delegate-id-card/:path*",

    "/delegate-certificate",

    "/delegate-certificate/:path*",

    "/questions",

    "/questions/:path*",

  ],
};