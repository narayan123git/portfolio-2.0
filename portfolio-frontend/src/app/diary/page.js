import Navbar from "../../components/navbar";
import Terminal from "../../components/Terminal";
import { SITE_URL, getApiUrl } from "@/lib/siteConfig";

const DIARY_REVALIDATE_SECONDS = 180;

export const metadata = {
  title: "Diary | Narayan Paul",
  description: "Live engineering diary entries covering debugging notes, build progress, and development updates.",
  alternates: {
    canonical: "/diary",
  },
  openGraph: {
    title: "Diary | Narayan Paul",
    description: "Live engineering diary entries covering debugging notes, build progress, and development updates.",
    url: `${SITE_URL}/diary`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diary | Narayan Paul",
    description: "Live engineering diary entries covering debugging notes, build progress, and development updates.",
  },
};

async function getEntries() {
  try {
    const res = await fetch(getApiUrl("/diary"), {
      next: { revalidate: DIARY_REVALIDATE_SECONDS },
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

export default async function Diary() {
  const entries = await getEntries();

  const diarySchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Build Diary",
    url: `${SITE_URL}/diary`,
    description: "Live engineering diary entries covering debugging notes, build progress, and development updates.",
    blogPost: entries.slice(0, 20).map((entry) => ({
      "@type": "BlogPosting",
      datePublished: entry.createdAt ? new Date(entry.createdAt).toISOString() : new Date().toISOString(),
      headline: String(entry.currentStatus || "Build update"),
      articleBody: String(entry.content || ""),
    })),
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1e293b_0%,#0f172a_45%,#020617_100%)] text-slate-100 pb-24">
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-20">
        <header className="mb-10 rounded-2xl border border-indigo-300/20 bg-slate-900/60 p-7 backdrop-blur-sm">
          <h1 className="text-4xl font-semibold text-indigo-100 tracking-tight">Build Diary</h1>
          <p className="text-sm text-slate-300 mt-2">Progress pulses, debug wins, and what is evolving right now.</p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2">
            <div className="space-y-6 border-l border-indigo-300/30 pl-6 ml-2">
              {entries.map((entry) => (
                <div key={entry._id} className="relative rounded-2xl border border-slate-700/80 bg-slate-900/70 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.45)]">
                  <div className="absolute -left-[31px] top-8 w-3 h-3 bg-slate-950 border border-indigo-300 rounded-full"></div>

                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="text-indigo-100 font-semibold text-sm">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-slate-300">
                      {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-xs bg-indigo-500/10 text-indigo-100 px-2 py-0.5 rounded-full border border-indigo-300/30">
                      {entry.currentStatus || "Status Unspecified"}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                </div>
              ))}
              {entries.length === 0 && <p className="text-slate-500">No entries recorded.</p>}
            </div>
          </div>

          <aside className="lg:col-span-1 lg:sticky lg:top-24">
            <Terminal />
          </aside>
        </section>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(diarySchema) }}
      />
    </div>
  );
}