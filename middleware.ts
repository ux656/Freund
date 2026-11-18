import { NextRequest, NextResponse } from "next/server";

const SHOW_MAINTENANCE = true;

export function middleware(request: NextRequest) {
  const response = (() => {
    const pathname = request.nextUrl.pathname;

    // Keep API endpoints closed while maintenance is enabled.
    if (SHOW_MAINTENANCE && pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Service temporarily unavailable", code: 503, maintenance: true },
        { status: 503 }
      );
    }

    // Force every user-facing route to render the maintenance page.
    // Root is allowed through because app/page.tsx renders the 503 screen there.
    if (SHOW_MAINTENANCE && pathname !== "/") {
      const destination = request.nextUrl.clone();
      destination.pathname = "/";
      destination.search = "";
      return NextResponse.rewrite(destination);
    }

    return NextResponse.next();
  })();

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
