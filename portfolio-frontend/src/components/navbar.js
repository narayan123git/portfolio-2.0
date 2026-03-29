'use client';

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
        const data = await res.json();
        if (data.success) {
          setSettings(data.data);
        }
      } catch (err) {
        console.error('Error fetching settings for navbar:', err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <nav className="border-b border-emerald-900/40 bg-[#071313]/80 backdrop-blur-xl sticky top-0 z-50 shadow-[0_8px_30px_rgba(6,31,27,0.35)]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="mono-ui text-xl font-bold text-white tracking-tight">
            NARAYAN<span style={{ color: settings?.primaryColor || '#22c55e' }}>_PAUL</span>
          </Link>
          
          {settings && (
            <div className="hidden md:flex items-center gap-2 border border-emerald-900/60 bg-emerald-950/30 px-3 py-1 rounded-full">
              <span className={`w-2 h-2 rounded-full ${settings.isHiring ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
              <span className="text-[10px] text-emerald-300 mono-ui tracking-widest uppercase">
                {settings.isHiring ? 'AVAILABLE' : 'BUSY'}
              </span>
            </div>
          )}
        </div>

        <div className="mono-ui space-x-4 md:space-x-8 text-sm text-emerald-300/80">
          <Link href="/projects" className="hover:text-emerald-200">[ PROJECTS ]</Link>
          <Link href="/blogs" className="hover:text-emerald-200 hidden sm:inline">[ BLOGS ]</Link>
          <Link href="/diary" className="hover:text-emerald-200 hidden sm:inline">[ DIARY ]</Link>
          <Link href="/contact" className="hover:text-emerald-200">[ CONTACT ]</Link>
          <Link href="/admin" className="hover:text-white border border-emerald-500/40 px-2 py-1 rounded">[ ADMIN ]</Link>
        </div>
      </div>
    </nav>
  );
}