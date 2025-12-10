// src/middleware/proxy.ts
import { jwtMiddleware } from "./src/middleware/jwtMiddleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedApiRoutes = [
  { path: "/api/users/profile", methods: ["GET", "PATCH"] },
  { path: "/api/admin/profile", methods: ["GET", "PATCH"] },
  { path: "/api/admin/address", methods: ["POST", "GET", "PATCH", "DELETE"] },
  { path: "/api/admin/users", methods: ["POST", "GET", "PATCH", "DELETE"] },
  { path: "/api/currentuser", methods: ["GET"] },
  { path: "/api/users/password", methods: ["POST"] },
  { path: "/api/admin/events/category", methods: ["POST", "GET", "PATCH", "DELETE"] },
  { path: "/api/admin/events/category/faq", methods: ["POST", "GET", "PATCH", "DELETE"] },
  { path: "/api/admin/blog", methods: ["POST", "PATCH", "DELETE"] },
  { path: "/api/admin/service-category", methods: ["POST", "PATCH", "DELETE"] },
  { path: "/api/admin/service", methods: ["POST", "PATCH", "DELETE"] },
  { path: "/api/admin/employee", methods: ["POST", "GET", "PATCH", "DELETE"] },
  { path: "/api/admin/employee-service", methods: ["POST", "GET", "PATCH", "DELETE"] },
  { path: "/api/admin/events", methods: ["POST", "GET", "PATCH", "DELETE"] },
  
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const method = req.method;
  const adminToken = req.cookies.get("token")?.value;

  const isApiProtected = protectedApiRoutes.some(
    (r) => pathname.startsWith(r.path) && r.methods.includes(method)
  );

  if (isApiProtected) {
    return await jwtMiddleware(req);
  }

  // Protect admin pages
  if (
    pathname.startsWith("/admin") &&
    !pathname.startsWith("/admin/@auth") &&
    !pathname.startsWith("/admin/login")
  ) {
    if (!adminToken) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  // Prevent logged-in users from accessing login page
  if (
    (pathname === "/admin/login" || pathname.startsWith("/admin/@auth")) &&
    adminToken
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
