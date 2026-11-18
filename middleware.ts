import { NextRequest, NextResponse } from "next/server";

const SHOW_MAINTENANCE = true;

// Only real application pages are gated. Error routes and unknown paths
// must remain handled by Next.js so 404/408/429/500 are not masked.
const APP_ROUTES = [
  "/",
  "/servers",
  "/bots",
  "/activity",
  "/activity/all",
  "/info",
];

const ERROR_ROUTES = ["/408", "/429", "/errors"];

function isAppRoute(pathname: string) {
  return APP_ROUTES.some((route) =>
    route === "/" ? pathname === "/" : pathname === route || pathname.startsWith(route + "/")
  );
}

function isErrorRoute(pathname: string) {
  return ERROR_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let response: NextResponse;

  if (SHOW_MAINTENANCE && pathname.startsWith("/api/")) {
    response = NextResponse.json(
      { error: "Service temporarily unavailable", code: 503, maintenance: true },
      { status: 503 }
    );
  } else if (
    SHOW_MAINTENANCE &&
    pathname !== "/maintenance" &&
    !isErrorRoute(pathname) &&
    isAppRoute(pathname)
  ) {
    const destination = request.nextUrl.clone();
    destination.pathname = "/maintenance";
    destination.search = "";
    response = NextResponse.rewrite(destination, { status: 503 });
  } else {
    response = NextResponse.next();
  }

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff|woff2|ttf|otf|mp4|webm)$).*)"],
};
