"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";

export default function Diary() {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diary`);
        const data = await res.json();
        setEntries(data);
      } catch (err) {
        console.error("Failed to fetch diary entries");
      } finally {
        setIsLoading(false);
      }
    };
    fetchEntries();
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#1e293b_0%,#0f172a_45%,#020617_100%)] text-slate-100 pb-24">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-20">
        <header className="mb-10 rounded-2xl border border-indigo-300/20 bg-slate-900/60 p-7 backdrop-blur-sm">
          <h1 className="text-4xl font-semibold text-indigo-100 tracking-tight">Build Diary</h1>
          <p className="text-sm text-slate-300 mt-2">Progress pulses, debug wins, and what is evolving right now.</p>
        </header>

        {isLoading ? (
          <p className="animate-pulse text-indigo-200">Loading diary timeline...</p>
        ) : (
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
        )}
      </main>
    </div>
  );
}