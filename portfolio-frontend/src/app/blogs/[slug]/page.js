import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../components/navbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SITE_URL, getApiUrl } from "@/lib/siteConfig";

const BLOG_REVALIDATE_SECONDS = 300;

const GitHubMarkdownComponents = {
  h1: ({ children }) => <h1 className="text-4xl font-bold border-b border-slate-300/25 pb-4 mb-6 mt-8 text-slate-100">{children}</h1>,
  h2: ({ children }) => <h2 className="text-3xl font-bold border-b border-slate-300/20 pb-3 mb-5 mt-7 text-slate-100">{children}</h2>,
  h3: ({ children }) => <h3 className="text-2xl font-semibold mb-4 mt-6 text-slate-100">{children}</h3>,
  h4: ({ children }) => <h4 className="text-xl font-semibold mb-3 mt-5 text-slate-100">{children}</h4>,
  h5: ({ children }) => <h5 className="text-lg font-semibold mb-3 mt-4 text-slate-100">{children}</h5>,
  h6: ({ children }) => <h6 className="text-base font-semibold mb-3 mt-4 text-slate-300">{children}</h6>,
  p: ({ children }) => <p className="mb-4 leading-8 text-slate-300">{children}</p>,
  strong: ({ children }) => <strong className="font-bold text-slate-100">{children}</strong>,
  em: ({ children }) => <em className="italic text-slate-300">{children}</em>,
  a: ({ href, children }) => (
    <a href={href} className="text-cyan-300 hover:text-cyan-200 underline decoration-cyan-500/50 underline-offset-4 transition">
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    <img
      src={src}
      alt={alt || "Blog image"}
      className="max-w-full h-auto rounded-xl border border-slate-300/20 my-6 shadow-lg shadow-black/40"
      loading="lazy"
    />
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-cyan-400/70 bg-slate-900/70 pl-4 py-2 my-4 italic text-slate-200 rounded-r">
      {children}
    </blockquote>
  ),
  code: ({ inline, children }) => {
    return inline ? (
      <code className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 font-mono text-sm text-amber-200">
        {children}
      </code>
    ) : (
      <pre className="bg-[#0b1220] text-slate-100 p-4 rounded-xl overflow-x-auto my-4 border border-slate-700/60 shadow-inner shadow-cyan-900/20">
        <code className="font-mono text-sm leading-7">{children}</code>
      </pre>
    );
  },
  ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 text-slate-300">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 text-slate-300">{children}</ol>,
  li: ({ children }) => <li className="ml-2">{children}</li>,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 border border-slate-600/60 rounded-xl bg-slate-900/40">
      <table className="w-full border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-slate-800/90 border-b border-slate-600">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children, isHeader }) => (
    <tr className={isHeader ? "" : "border-b border-slate-700/70 hover:bg-slate-800/40"}>
      {children}
    </tr>
  ),
  th: ({ children }) => <th className="px-4 py-3 text-left font-semibold text-slate-100">{children}</th>,
  td: ({ children }) => <td className="px-4 py-3 text-slate-300">{children}</td>,
  hr: () => <hr className="my-8 border-t border-slate-500/50" />,
};

async function getBlog(slug) {
  try {
    const res = await fetch(getApiUrl(`/blogs/${slug}`), {
      next: { revalidate: BLOG_REVALIDATE_SECONDS },
    });

    if (res.status === 404) {
      return null;
    }

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch {
    return null;
  }
}

async function getAllBlogs() {
  try {
    const res = await fetch(getApiUrl("/blogs"), {
      next: { revalidate: BLOG_REVALIDATE_SECONDS },
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

function getSummary(blog) {
  if (Array.isArray(blog?.aiSummary)) {
    return blog.aiSummary.join(" ").slice(0, 155);
  }
  if (typeof blog?.aiSummary === "string") {
    return blog.aiSummary.slice(0, 155);
  }
  if (typeof blog?.content === "string") {
    return blog.content.replace(/[#*_`>\[\]()!-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 155);
  }
  return "Engineering note by Narayan Paul.";
}

function getShareLink(platform, blogUrl, title) {
  const url = encodeURIComponent(blogUrl);
  const text = encodeURIComponent(`${title} | Narayan's Blog`);

  const links = {
    x: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    whatsapp: `https://api.whatsapp.com/send?text=${text}%20${url}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
  };

  return links[platform] || "#";
}

export async function generateStaticParams() {
  const blogs = await getAllBlogs();
  return blogs
    .filter((blog) => typeof blog?.slug === "string" && blog.slug.trim())
    .map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    return {
      title: "Blog Not Found | Narayan Paul",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const blogUrl = `${SITE_URL}/blogs/${blog.slug}`;
  const summary = getSummary(blog);

  return {
    title: `${blog.title} | Narayan Paul`,
    description: summary,
    alternates: {
      canonical: `/blogs/${blog.slug}`,
    },
    openGraph: {
      title: blog.title,
      description: summary,
      type: "article",
      url: blogUrl,
      publishedTime: blog.createdAt,
      tags: blog.tags || [],
      images: blog.coverImageUrl ? [{ url: blog.coverImageUrl, alt: blog.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: summary,
      images: blog.coverImageUrl ? [blog.coverImageUrl] : [],
    },
  };
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  const blogUrl = `${SITE_URL}/blogs/${blog.slug}`;
  const summary = getSummary(blog);
  const publishedAt = blog.createdAt ? new Date(blog.createdAt).toISOString() : new Date().toISOString();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: summary,
    datePublished: publishedAt,
    dateModified: publishedAt,
    mainEntityOfPage: blogUrl,
    url: blogUrl,
    author: {
      "@type": "Person",
      name: "Narayan Paul",
    },
    publisher: {
      "@type": "Person",
      name: "Narayan Paul",
    },
    image: blog.coverImageUrl ? [blog.coverImageUrl] : undefined,
    keywords: Array.isArray(blog.tags) ? blog.tags.join(", ") : undefined,
  };

  return (
    <div className="min-h-screen text-slate-100 bg-[radial-gradient(circle_at_top,_#10213f_0%,_#0b1220_45%,_#05070d_100%)]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 pt-20 pb-20">
        <Link href="/blogs" className="text-sm text-slate-300 hover:text-cyan-200 mb-8 transition-colors inline-flex items-center gap-2">
          <span aria-hidden="true">←</span>
          <span>Back to Blog</span>
        </Link>

        <article className="rounded-3xl border border-slate-400/20 bg-slate-950/55 backdrop-blur-md shadow-[0_30px_120px_rgba(2,8,23,0.75)] px-5 md:px-10 py-8 md:py-10">
          <header className="mb-10 pb-8 border-b border-slate-400/20">
            {blog.coverImageUrl && (
              <img
                src={blog.coverImageUrl}
                alt={blog.title}
                className="w-full max-h-[420px] object-cover rounded-2xl mb-6 border border-slate-300/20 shadow-lg shadow-black/40"
                loading="lazy"
              />
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-slate-50 mb-4 leading-tight">{blog.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <span>{new Date(publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
              <span>•</span>
              <span>{blog.readTime || 1} min read</span>
              {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex gap-2 flex-wrap">
                    {blog.tags.map((tag, i) => (
                      <span key={i} className="bg-slate-800/80 border border-slate-600/70 px-3 py-1 rounded-full text-xs font-medium text-cyan-100">
                        {tag}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 mr-1">Share:</span>
              <a href={getShareLink("x", blogUrl, blog.title)} target="_blank" rel="noopener noreferrer" className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-sky-300/60">X</a>
              <a href={getShareLink("linkedin", blogUrl, blog.title)} target="_blank" rel="noopener noreferrer" className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-sky-300/60">LinkedIn</a>
              <a href={getShareLink("whatsapp", blogUrl, blog.title)} target="_blank" rel="noopener noreferrer" className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-emerald-300/60">WhatsApp</a>
              <a href={getShareLink("facebook", blogUrl, blog.title)} target="_blank" rel="noopener noreferrer" className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-600 text-slate-300 hover:text-white hover:border-blue-300/60">Facebook</a>
            </div>
          </header>

          <div className="max-w-none text-base leading-8">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={GitHubMarkdownComponents}>
              {blog.content || ""}
            </ReactMarkdown>
          </div>

          {Array.isArray(blog.aiSummary) && blog.aiSummary.length > 0 && (
            <div className="mt-12 pt-8 border-t border-slate-400/20">
              <h3 className="text-lg font-bold text-slate-100 mb-4">AI Summary</h3>
              <ul className="space-y-2">
                {blog.aiSummary.map((point, i) => (
                  <li key={i} className="flex gap-3 text-slate-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-900/70 border border-cyan-500/50 flex items-center justify-center text-cyan-100 font-bold text-sm">
                      {i + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
    </div>
  );
}
