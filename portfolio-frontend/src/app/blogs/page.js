import Link from "next/link";
import Navbar from "../../components/navbar";
import { SITE_URL, getApiUrl } from "@/lib/siteConfig";

const BLOGS_REVALIDATE_SECONDS = 300;

export const metadata = {
  title: "Blogs | Narayan Paul",
  description: "Engineering notes, architecture breakdowns, and development logs by Narayan Paul.",
  alternates: {
    canonical: "/blogs",
  },
  openGraph: {
    title: "Blogs | Narayan Paul",
    description: "Engineering notes, architecture breakdowns, and development logs by Narayan Paul.",
    url: `${SITE_URL}/blogs`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blogs | Narayan Paul",
    description: "Engineering notes, architecture breakdowns, and development logs by Narayan Paul.",
  },
};

async function getBlogs() {
  try {
    const res = await fetch(getApiUrl("/blogs"), {
      next: { revalidate: BLOGS_REVALIDATE_SECONDS },
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

const buildShareUrl = (slug) => `${SITE_URL}/blogs/${slug}`;

const getShareLink = (platform, blog) => {
  const url = encodeURIComponent(buildShareUrl(blog.slug));
  const text = encodeURIComponent(`${blog.title} | Narayan's Blog`);

  const links = {
    x: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
  };

  return links[platform] || "#";
};

function getSummary(blog) {
  if (Array.isArray(blog.aiSummary)) {
    return blog.aiSummary[0] || "No summary available.";
  }

  if (typeof blog.aiSummary === "string" && blog.aiSummary.trim()) {
    return blog.aiSummary;
  }

  return "No summary available.";
}

export default async function Blogs() {
  const blogs = await getBlogs();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#312e81_0%,#0f172a_42%,#020617_100%)] text-slate-100 pb-24">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-20">
        <header className="mb-10 rounded-2xl border border-fuchsia-300/20 bg-slate-900/60 p-7 backdrop-blur-sm">
          <h1 className="text-4xl font-semibold text-fuchsia-100 tracking-tight">Blog Terminal</h1>
          <p className="text-sm text-slate-300 mt-2">Ideas, architecture notes, and engineering deep-dives.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
          {blogs.map((blog) => (
            <article key={blog._id} className="rounded-2xl border border-slate-700/80 bg-slate-900/70 p-6 hover:border-fuchsia-300/50 hover:shadow-[0_0_36px_rgba(217,70,239,0.18)] transition-all">
              {blog.coverImageUrl && (
                <img
                  src={blog.coverImageUrl}
                  alt={blog.title}
                  className="w-full h-52 object-cover rounded-xl mb-5 border border-slate-700"
                  loading="lazy"
                />
              )}
              <div className="flex justify-between items-start mb-4 gap-3">
                <h2 className="text-2xl font-semibold text-fuchsia-100 leading-tight">{blog.title}</h2>
                <span className="text-xs text-fuchsia-100 border border-fuchsia-300/40 bg-fuchsia-500/10 px-2 py-1 rounded-full whitespace-nowrap">{blog.readTime || 1} min read</span>
              </div>
              <p className="text-slate-300 text-sm mb-4 leading-relaxed">{getSummary(blog)}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(blog.tags || []).map((tag, i) => (
                  <span key={i} className="text-xs text-fuchsia-100 bg-fuchsia-500/10 border border-fuchsia-300/30 px-2 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/blogs/${blog.slug}`}
                  className="inline-block text-sm px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:text-white hover:border-fuchsia-300/60 hover:bg-fuchsia-500/10 transition-colors"
                >
                  Read Full Article
                </Link>
                <a href={getShareLink("x", blog)} target="_blank" rel="noopener noreferrer" className="text-xs px-2.5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-sky-300/60">X</a>
                <a href={getShareLink("linkedin", blog)} target="_blank" rel="noopener noreferrer" className="text-xs px-2.5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-sky-300/60">LinkedIn</a>
                <a href={getShareLink("whatsapp", blog)} target="_blank" rel="noopener noreferrer" className="text-xs px-2.5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-emerald-300/60">WhatsApp</a>
                <a href={getShareLink("facebook", blog)} target="_blank" rel="noopener noreferrer" className="text-xs px-2.5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-blue-300/60">Facebook</a>
              </div>
            </article>
          ))}

          {blogs.length === 0 && <p className="text-slate-500">No logs found.</p>}
        </div>
      </main>
    </div>
  );
}
