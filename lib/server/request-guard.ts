import { NextRequest } from "next/server";

const DEFAULT_ORIGINS = ["https://freund-brown.vercel.app"];

function allowedOrigins() {
  const configured = (process.env.APP_ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim().replace(/\/+$/, ""))
    .filter(Boolean);
  return new Set([...DEFAULT_ORIGINS, ...configured]);
}

export function isTrustedAppRequest(request: NextRequest, requireOrigin = false) {
  const currentOrigin = request.nextUrl.origin.replace(/\/+$/, "");
  const allowed = allowedOrigins();
  if (!allowed.has(currentOrigin)) return false;

  const origin = request.headers.get("origin");
  if (requireOrigin && !origin) return false;
  if (origin && origin.replace(/\/+$/, "") !== currentOrigin) return false;

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;

  return true;
}
