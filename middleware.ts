import { NextRequest, NextResponse } from "next/server";

const SHOW_MAINTENANCE = true;
const MAINTENANCE_PATH = "/maintenance";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  let response: NextResponse;

  if (SHOW_MAINTENANCE && pathname.startsWith("/api/")) {
    response = NextResponse.json(
      { error: "Service temporarily unavailable", code: 503, maintenance: true },
      { status: 503 }
    );
  } else if (SHOW_MAINTENANCE && pathname !== MAINTENANCE_PATH) {
    const destination = request.nextUrl.clone();
    destination.pathname = MAINTENANCE_PATH;
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
