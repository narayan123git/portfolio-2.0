import { getApiUrl } from "@/lib/siteConfig";

export default async function sitemap() {
  const SITEMAP_REVALIDATE_SECONDS = 600;
  
  // Use Vercel's production URL directly to ensure Google accepts it for this specific deployment
  const siteUrl = "https://portfolio-2-0-iota-two.vercel.app";

  let blogs = [];
  try {
    const res = await fetch(getApiUrl("/blogs"), {
      next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
    });
    if (res.ok) {
        const data = await res.json();
        blogs = Array.isArray(data) ? data : data?.data || [];
    }
  } catch (error) {
    // silently fail
  }

  const staticRoutes = ["", "/blogs", "/projects", "/diary", "/contact"];

  const routes = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  const dynamicRoutes = blogs
    .filter((blog) => typeof blog?.slug === "string" && blog.slug.trim())
    .map((blog) => ({
      url: `${siteUrl}/blogs/${blog.slug}`,
      lastModified: blog.createdAt ? new Date(blog.createdAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...routes, ...dynamicRoutes];
}
