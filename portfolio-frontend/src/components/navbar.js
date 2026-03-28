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
    <nav className="border-b border-green-900/30 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-mono text-xl font-bold text-white tracking-tighter">
            NARAYAN<span style={{ color: settings?.primaryColor || '#22c55e' }}>_PAUL</span>
          </Link>
          
          {settings && (
            <div className="hidden md:flex items-center gap-2 border border-green-900/50 bg-green-950/30 px-3 py-1 rounded-full">
              <span className={`w-2 h-2 rounded-full ${settings.isHiring ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
              <span className="text-[10px] text-green-400 font-mono tracking-widest uppercase">
                {settings.isHiring ? 'AVAILABLE' : 'BUSY'}
              </span>
            </div>
          )}
        </div>

        <div className="space-x-4 md:space-x-8 font-mono text-sm text-green-600">
          <Link href="/projects" className="hover:text-green-400 transition-colors">[ PROJECTS ]</Link>
          <Link href="/blogs" className="hover:text-green-400 transition-colors hidden sm:inline">[ BLOGS ]</Link>
          <Link href="/diary" className="hover:text-green-400 transition-colors hidden sm:inline">[ DIARY ]</Link>
          <Link href="/contact" className="hover:text-green-400 transition-colors">[ CONTACT ]</Link>
        </div>
      </div>
    </nav>
  );
}