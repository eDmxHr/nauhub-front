import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const protectedRoutes = ["/watch", "/profile/payments", "/favorites"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // Check for auth token in cookies
    const authToken = request.cookies.get("auth_token");

    if (!authToken?.value) {
      // Redirect to login page with return URL
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match protected routes
    "/watch/:path*",
    "/profile/payments/:path*",
    "/favorites/:path*",
  ],
};
