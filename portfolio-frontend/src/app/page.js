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
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});
  const topSkillCategories = Object.keys(groupedSkills).slice(0, 4);

  return (
    <main className="min-h-screen text-emerald-100">
      <Navbar />
      
      <section className="max-w-6xl mx-auto pt-20 md:pt-28 px-6">
        <div className="grid lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-3 border-l-2 border-emerald-400 pl-6 space-y-5">
            <p className="mono-ui text-emerald-300 text-sm animate-pulse">&gt; system.status: online</p>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[0.92]">
            Hello, I'm <br />
              <span style={{ color: settings?.primaryColor || '#39d99f' }}>Narayan.</span>
            </h1>
            <p className="text-emerald-100/80 text-lg max-w-2xl leading-relaxed">
              {settings?.heroText || 'B.Tech CSE @ NIT Durgapur. I design backend systems that stay fast under pressure, build practical AI products, and ship production-ready interfaces that feel premium.'}
            </p>
            <div className="pt-4 flex gap-4 flex-wrap">
              <MagneticButton>
                <Link 
                  href="/projects" 
                  className="mono-ui bg-emerald-900/40 border border-emerald-400 px-6 py-2 hover:bg-emerald-400 hover:text-black transition-all inline-block text-center"
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
                    className="mono-ui border border-emerald-300/40 text-emerald-100/80 px-6 py-2 hover:border-emerald-300 hover:text-white transition-all inline-block text-center"
                  >
                    DOWNLOAD_CV
                  </a>
                </MagneticButton>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-3 pt-6">
              <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4">
                <p className="mono-ui text-xs text-emerald-300/70">PROJECTS_TRACKED</p>
                <p className="text-2xl font-bold text-white mt-1">{settings?.projectCount || "20+"}</p>
              </div>
              <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4">
                <p className="mono-ui text-xs text-emerald-300/70">SKILLS_INDEXED</p>
                <p className="text-2xl font-bold text-white mt-1">{skills.length || "10+"}</p>
              </div>
              <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/20 p-4">
                <p className="mono-ui text-xs text-emerald-300/70">EDU_MILESTONES</p>
                <p className="text-2xl font-bold text-white mt-1">{education.length || "3+"}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-emerald-700/40 bg-[#0b2321]/70 p-6 shadow-[0_15px_30px_rgba(6,28,24,0.35)]">
            <h2 className="text-xl font-bold text-white">What You Can Explore Here</h2>
            <p className="text-sm text-emerald-100/75 mt-2 leading-relaxed">
              This portfolio includes production projects, technical blogs, development diary notes, and a secure admin command center that manages all content modules.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-emerald-100/80">
              <li>1. Dynamic project catalog with stack-based filtering.</li>
              <li>2. CMS-like admin panel for projects, blogs, skills, and settings.</li>
              <li>3. Security-focused API architecture with hardened middleware.</li>
              <li>4. Contact and message flows integrated with backend storage.</li>
            </ul>

            <div className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-900/20 p-4">
              <p className="mono-ui text-xs text-emerald-300 mb-2">ADMIN ACCESS NOTICE</p>
              <p className="text-sm text-emerald-100/90 leading-relaxed">
                A private admin page is available at <span className="mono-ui">/admin</span> for authenticated management of portfolio content.
              </p>
              <Link href="/admin" className="inline-block mt-3 mono-ui text-xs border border-emerald-400/60 px-3 py-2 rounded hover:bg-emerald-400 hover:text-black">
                OPEN_ADMIN_PORTAL
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Matrix Section */}
      {skills.length > 0 && (
        <section className="max-w-6xl mx-auto mt-24 px-6">
          <h2 className="text-3xl font-bold text-white mb-8 border-b border-emerald-900/50 pb-2">
            ~/skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skills.map(skill => (
              <div key={skill._id} className="p-4 bg-[#0d1e1d]/70 border border-emerald-900/40 rounded-xl hover:border-emerald-400/60 transition-colors group">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white text-sm">{skill.name}</span>
                  <span className="text-xs text-emerald-300">{skill.percentage}%</span>
                </div>
                <div className="w-full bg-black/30 h-1.5 rounded overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-1000 group-hover:bg-emerald-300" 
                    style={{ width: `${skill.percentage}%`, backgroundColor: settings?.primaryColor || '#39d99f' }}
                  ></div>
                </div>
                <p className="mono-ui text-[10px] text-emerald-300/60 mt-3">{skill.category || 'General'}</p>
                {skill.details && <p className="text-xs text-emerald-100/70 mt-2 line-clamp-2">{skill.details}</p>}
              </div>
            ))}
          </div>

          {topSkillCategories.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {topSkillCategories.map((category) => (
                <span key={category} className="mono-ui text-xs px-3 py-1 border border-emerald-700/50 bg-emerald-950/20 rounded-full text-emerald-200/80">
                  {category}
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Timeline / Education Section */}
      {education.length > 0 && (
        <section className="max-w-6xl mx-auto mt-24 px-6 pb-32">
          <h2 className="text-3xl font-bold text-white mb-8 border-b border-emerald-900/50 pb-2">
            ~/timeline
          </h2>
          <div className="border-l border-emerald-900/50 pl-6 space-y-10">
            {education.map(edu => (
              <div key={edu._id} className="relative">
                <div className="absolute -left-[29px] top-1 w-3 h-3 bg-[#071313] border-2 border-emerald-400 rounded-full"></div>
                <h3 className="text-xl text-white font-bold">{edu.institution}</h3>
                <p className="text-emerald-300 mono-ui text-sm">{edu.degree}</p>
                <p className="text-emerald-100/50 text-xs mt-1 mb-3">
                  {edu.startDate} - {edu.isCurrent ? <span className="text-emerald-300 animate-pulse">Present</span> : edu.endDate}
                </p>
                {edu.description && (
                  <p className="text-emerald-100/70 text-sm whitespace-pre-wrap">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}