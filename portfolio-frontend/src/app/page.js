import Navbar from "../components/navbar";
import Link from "next/link";
import MagneticButton from "@/components/MagneticButton";

// Next.js App Router allows async server components, perfect for initial API fetches!
async function getSettings() {
  try {
    const res = await fetch(`${process.env.INTERNAL_BACKEND_URL || 'http://localhost:5000'}/api/settings`, { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (err) { return null; }
}

async function getSkills() {
  try {
    const res = await fetch(`${process.env.INTERNAL_BACKEND_URL || 'http://localhost:5000'}/api/skills`, { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (err) { return []; }
}

async function getEducation() {
  try {
    const res = await fetch(`${process.env.INTERNAL_BACKEND_URL || 'http://localhost:5000'}/api/education`, { cache: 'no-store' });
    const data = await res.json();
    return data.success ? data.data : [];
  } catch (err) { return []; }
}

export default async function Home() {
  const settings = await getSettings();
  const skills = await getSkills();
  const education = await getEducation();

  return (
    <main className="min-h-screen bg-gray-950 text-green-400 font-mono">
      <Navbar />
      
      <section className="max-w-4xl mx-auto pt-32 px-6">
        <div className="border-l-2 border-green-500 pl-6 space-y-4">
          <p className="text-green-600 text-sm animate-pulse">&gt; system.status: online</p>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
            Hello, I'm <br />
            <span style={{ color: settings?.primaryColor || '#22c55e' }}>Narayan.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
            {settings?.heroText || 'B.Tech CSE @ NIT Durgapur. Focused on building high-performance backend architectures and AI-driven medical diagnostics.'}
          </p>
          <div className="pt-6 flex gap-4 flex-wrap">
            <MagneticButton>
              <Link 
                href="/projects" 
                className="bg-green-900/30 border border-green-500 px-6 py-2 hover:bg-green-500 hover:text-black transition-all inline-block text-center"
              >
                VIEW_PROJECTS
              </Link>
            </MagneticButton>

            {settings?.resumeUrl && (
              <MagneticButton>
                <a 
                  href={settings.resumeUrl} 
                  target="_blank"
                  rel="noreferrer noopener"
                  className="border border-gray-700 text-gray-500 px-6 py-2 hover:border-green-500 hover:text-green-500 transition-all inline-block text-center"
                >
                  DOWNLOAD_CV
                </a>
              </MagneticButton>
            )}
          </div>
        </div>
      </section>

      {/* Skills Matrix Section */}
      {skills.length > 0 && (
        <section className="max-w-4xl mx-auto mt-32 px-6">
          <h2 className="text-2xl font-bold text-white mb-8 border-b border-green-900/50 pb-2">
            ~/skills
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {skills.map(skill => (
              <div key={skill._id} className="p-4 bg-gray-900/40 border border-green-900/30 rounded hover:border-green-500/50 transition-colors group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm">{skill.name}</span>
                  <span className="text-xs text-green-600">{skill.percentage}%</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-1000 group-hover:bg-green-400" 
                    style={{ width: `${skill.percentage}%`, backgroundColor: settings?.primaryColor || '#22c55e' }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Timeline / Education Section */}
      {education.length > 0 && (
        <section className="max-w-4xl mx-auto mt-32 px-6 pb-32">
          <h2 className="text-2xl font-bold text-white mb-8 border-b border-green-900/50 pb-2">
            ~/timeline
          </h2>
          <div className="border-l border-green-900/50 pl-6 space-y-10">
            {education.map(edu => (
              <div key={edu._id} className="relative">
                <div className="absolute -left-[29px] top-1 w-3 h-3 bg-gray-950 border-2 border-green-500 rounded-full"></div>
                <h3 className="text-xl text-white font-bold">{edu.institution}</h3>
                <p className="text-green-500 font-mono text-sm">{edu.degree}</p>
                <p className="text-gray-500 text-xs mt-1 mb-3">
                  {edu.startDate} — {edu.isCurrent ? <span className="text-green-400 animate-pulse">Present</span> : edu.endDate}
                </p>
                {edu.description && (
                  <p className="text-gray-400 text-sm whitespace-pre-wrap">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}