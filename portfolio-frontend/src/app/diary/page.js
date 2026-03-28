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
    <div className="min-h-screen bg-gray-950 text-green-400 font-mono pb-20">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-20">
        <header className="mb-16 border-b border-green-900/50 pb-6">
          <h1 className="text-4xl font-bold text-white tracking-widest">/DIARY</h1>
          <p className="text-sm text-green-600 mt-2">&gt; Tracking daily development and milestones...</p>
        </header>

        {isLoading ? (
          <p className="animate-pulse">DECRYPTING_ENTRIES...</p>
        ) : (
          <div className="space-y-6 border-l border-green-900/50 pl-6 ml-2">
            {entries.map((entry) => (
              <div key={entry._id} className="relative">
                {/* Timeline Node */}
                <div className="absolute -left-[31px] top-1 w-3 h-3 bg-gray-950 border border-green-500 rounded-full"></div>
                
                <div className="mb-1 flex items-center gap-4">
                  <span className="text-white font-bold text-sm">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-xs bg-green-950 text-green-500 px-2 py-0.5 rounded border border-green-900">
                    STATUS: {entry.currentStatus}
                  </span>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
            ))}
            {entries.length === 0 && <p className="text-gray-500">No entries recorded.</p>}
          </div>
        )}
      </main>
    </div>
  );
}