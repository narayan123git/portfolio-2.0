const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.FRONTEND_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

const INTERNAL_BACKEND_URL = (process.env.INTERNAL_BACKEND_URL || "").replace(/\/$/, "");
const PUBLIC_API_BASE = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/$/, "");

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value || "");

function getApiUrl(pathname) {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (INTERNAL_BACKEND_URL) {
    return `${INTERNAL_BACKEND_URL}/api${path}`;
  }

  if (isAbsoluteUrl(PUBLIC_API_BASE)) {
    return `${PUBLIC_API_BASE}${path}`;
  }

  return `${SITE_URL}${PUBLIC_API_BASE}${path}`;
}

export { SITE_URL, getApiUrl };