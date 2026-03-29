'use client';

import { useEffect, useState } from 'react';

export default function Footer() {
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
        console.error('Error fetching settings for footer:', err);
      }
    };
    fetchSettings();
  }, []);

  return (
    <footer className="border-t border-blue-300/20 bg-[#0a1020]/85 mt-20 pt-10 pb-16 mono-ui text-center relative z-[10]">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <p className="text-slate-100/90 text-sm">
            © {new Date().getFullYear()} Narayan Paul. All systems operational.
          </p>
          {settings && (
            <p className="text-xs mt-2 flex items-center justify-center md:justify-start gap-2 text-orange-100/80">
              <span className={`w-2 h-2 rounded-full ${settings.isHiring ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              {settings.currentStatus || 'Active'}
            </p>
          )}
        </div>
        
        <div className="flex gap-4">
          <a target="_blank" rel="noopener noreferrer" href={settings?.githubUrl || "https://github.com/narayan-paul"} className="text-slate-200/60 hover:text-orange-200 transition-colors">
            [ GITHUB ]
          </a>
          <a target="_blank" rel="noopener noreferrer" href={settings?.linkedinUrl || "https://linkedin.com/in/narayan-paul"} className="text-slate-200/60 hover:text-orange-200 transition-colors">
            [ LINKEDIN ]
          </a>
          <a href="/contact" className="text-slate-200/60 hover:text-orange-200 transition-colors">
            [ CONTACT ]
          </a>
        </div>
      </div>
    </footer>
  );
}