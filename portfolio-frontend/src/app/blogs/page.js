"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import Link from "next/link";

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [origin, setOrigin] = useState(process.env.NEXT_PUBLIC_SITE_URL || "");
  const [copiedId, setCopiedId] = useState("");

  const buildShareUrl = (slug) => {
    const cleanOrigin = String(origin || "").replace(/\/$/, "");
    return cleanOrigin ? `${cleanOrigin}/blogs/${slug}` : "";
  };

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

  const copyLink = async (blog) => {
    try {
      await navigator.clipboard.writeText(buildShareUrl(blog.slug));
      setCopiedId(blog._id);
      setTimeout(() => setCopiedId(""), 1400);
    } catch (error) {
      console.error("Failed to copy link", error);
    }
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`);
        const data = await res.json();
        setBlogs(Array.isArray(data) ? data : (data.data || []));
      } catch (err) {
        console.error("Failed to fetch blogs");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();

    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,#312e81_0%,#0f172a_42%,#020617_100%)] text-slate-100 pb-24">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-20">
        <header className="mb-10 rounded-2xl border border-fuchsia-300/20 bg-slate-900/60 p-7 backdrop-blur-sm">
          <h1 className="text-4xl font-semibold text-fuchsia-100 tracking-tight">Blog Terminal</h1>
          <p className="text-sm text-slate-300 mt-2">Ideas, architecture notes, and engineering deep-dives.</p>
        </header>

        {isLoading ? (
          <p className="animate-pulse text-fuchsia-200">Fetching article stream...</p>
        ) : (
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
                <p className="text-slate-300 text-sm mb-4 leading-relaxed">
                  {blog.aiSummary || "No summary available."}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {blog.tags?.map((tag, i) => (
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
                  <button onClick={() => copyLink(blog)} className="text-xs px-2.5 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:border-fuchsia-300/60">{copiedId === blog._id ? "Copied!" : "Copy Link"}</button>
                </div>
              </article>
            ))}
            {blogs.length === 0 && <p className="text-slate-500">No logs found.</p>}
          </div>
        )}
      </main>
    </div>
  );
}