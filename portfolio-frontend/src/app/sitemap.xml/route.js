import { SITE_URL, getApiUrl } from "@/lib/siteConfig";

const SITEMAP_REVALIDATE_SECONDS = 600;

async function getBlogs() {
  try {
    const res = await fetch(getApiUrl("/blogs"), {
      next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : data?.data || [];
  } catch {
    return [];
  }
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildUrlNode({ loc, lastmod, changefreq, priority }) {
  return [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].join("\n");
}

export async function GET() {
  const now = new Date();
  const staticRoutes = ["", "/blogs", "/projects", "/diary", "/contact"];

  const staticEntries = staticRoutes.map((route) => {
    const priority = route === "" ? "1.0" : "0.8";
    const changefreq = route === "" ? "daily" : "weekly";
    return buildUrlNode({
      loc: `${SITE_URL}${route}`,
      lastmod: now.toISOString(),
      changefreq,
      priority,
    });
  });

  const blogs = await getBlogs();
  const blogEntries = blogs
    .filter((blog) => typeof blog?.slug === "string" && blog.slug.trim())
    .map((blog) =>
      buildUrlNode({
        loc: `${SITE_URL}/blogs/${blog.slug}`,
        lastmod: blog.createdAt ? new Date(blog.createdAt).toISOString() : now.toISOString(),
        changefreq: "weekly",
        priority: "0.7",
      })
    );

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticEntries,
    ...blogEntries,
    "</urlset>",
  ].join("\n");

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": `public, max-age=0, s-maxage=${SITEMAP_REVALIDATE_SECONDS}, stale-while-revalidate=${SITEMAP_REVALIDATE_SECONDS}`,
    },
  });
}
