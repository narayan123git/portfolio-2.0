import Navbar from "../components/navbar";
import Link from "next/link";
import MagneticButton from "@/components/MagneticButton";
import * as FaIcons from "react-icons/fa";
import * as SiIcons from "react-icons/si";

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

async function getProjects() {
  try {
    const res = await fetch(`${process.env.INTERNAL_BACKEND_URL || 'http://localhost:5000'}/api/projects`, { cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (err) { return []; }
}

async function getBlogs() {
  try {
    const res = await fetch(`${process.env.INTERNAL_BACKEND_URL || 'http://localhost:5000'}/api/blogs`, { cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (err) { return []; }
}

const normalizeExternalUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  return /^(https?:)?\/\//i.test(url) ? url : `https://${url}`;
};

const iconPacks = {
  Fa: FaIcons,
  Si: SiIcons,
};

const isUrl = (value) => /^(https?:)?\/\//i.test(String(value || ''));

const renderSkillIcon = (iconName, skillName) => {
  if (!iconName) {
    return <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-300/30 flex items-center justify-center text-xs text-orange-200">SK</div>;
  }

  if (isUrl(iconName)) {
    return (
      <img
        src={iconName}
        alt={skillName || 'Skill icon'}
        className="w-8 h-8 rounded object-contain bg-black/20 p-1"
        loading="lazy"
      />
    );
  }

  const prefix = String(iconName).slice(0, 2);
  const pack = iconPacks[prefix];
  const IconComponent = pack ? pack[iconName] : null;

  if (!IconComponent) {
    return <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-300/30 flex items-center justify-center text-xs text-orange-200">SK</div>;
  }

  return <IconComponent className="w-6 h-6 text-orange-200" aria-hidden="true" />;
};

export default async function Home() {
  const settings = await getSettings();
  const skills = await getSkills();
  const education = await getEducation();
  const projects = await getProjects();
  const blogs = await getBlogs();
  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});
  const topSkillCategories = Object.keys(groupedSkills).slice(0, 4);
  const featuredProjects = projects.slice(0, 3);
  const featuredBlogs = blogs.slice(0, 3);
  const resumeUrl = normalizeExternalUrl(settings?.resumeUrl);

  return (
    <main className="min-h-screen text-slate-100">
      <Navbar />
      
      <section className="max-w-6xl mx-auto pt-20 md:pt-28 px-6">
        <div className="grid lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-3 border-l-2 border-orange-300 pl-6 space-y-5">
            <p className="mono-ui text-orange-200 text-sm animate-pulse">&gt; system.status: online</p>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[0.92]">
            Hello, I&apos;m <br />
              <span style={{ color: settings?.primaryColor || '#ff8e3c' }}>Narayan.</span>
            </h1>
            <p className="text-slate-100/85 text-lg max-w-2xl leading-relaxed">
              {settings?.heroText || 'B.Tech CSE @ NIT Durgapur. I design backend systems that stay fast under pressure, build practical AI products, and ship production-ready interfaces that feel premium.'}
            </p>
            <p className="text-slate-200/70 max-w-2xl">
              I specialize in backend-heavy systems, secure APIs, and polished product experiences. This website is not static content: it is powered by a private admin command center and a hardened full-stack architecture.
            </p>
            <div className="pt-4 flex gap-4 flex-wrap">
              <MagneticButton>
                <Link 
                  href="/projects" 
                  className="mono-ui bg-orange-500/20 border border-orange-300 px-6 py-2 hover:bg-orange-300 hover:text-black transition-all inline-block text-center"
                >
                  VIEW_PROJECTS
                </Link>
              </MagneticButton>

              {resumeUrl && (
                <MagneticButton>
                  <a 
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mono-ui border border-blue-300/40 text-slate-100 px-6 py-2 hover:border-blue-200 hover:text-white transition-all inline-block text-center"
                  >
                    DOWNLOAD_CV
                  </a>
                </MagneticButton>
              )}
            </div>

            <div className="grid sm:grid-cols-3 gap-3 pt-6">
              <div className="rounded-xl surface-card p-4">
                <p className="mono-ui text-xs text-orange-200/80">PROJECTS_TRACKED</p>
                <p className="text-2xl font-bold text-white mt-1">{projects.length}</p>
              </div>
              <div className="rounded-xl surface-card p-4">
                <p className="mono-ui text-xs text-orange-200/80">SKILLS_INDEXED</p>
                <p className="text-2xl font-bold text-white mt-1">{skills.length}</p>
              </div>
              <div className="rounded-xl surface-card p-4">
                <p className="mono-ui text-xs text-orange-200/80">EDU_MILESTONES</p>
                <p className="text-2xl font-bold text-white mt-1">{education.length}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl surface-card p-6 shadow-[0_15px_30px_rgba(7,16,40,0.35)]">
            {settings?.profileImageUrl && (
              <div className="mb-6">
                <img
                  src={settings.profileImageUrl}
                  alt="Narayan profile"
                  className="w-32 h-32 rounded-full object-cover border-2 border-orange-300/60"
                />
              </div>
            )}
            <h2 className="text-xl font-bold text-white">What You Can Explore Here</h2>
            <p className="text-sm text-slate-100/80 mt-2 leading-relaxed">
              This portfolio includes production projects, technical blogs, development diary notes, and a secure admin command center that manages all content modules.
            </p>
            <ul className="mt-5 space-y-3 text-sm text-slate-100/80">
              <li>1. Dynamic project catalog with stack-based filtering.</li>
              <li>2. CMS-like admin panel for projects, blogs, skills, and settings.</li>
              <li>3. Security-focused API architecture with hardened middleware.</li>
              <li>4. Contact and message flows integrated with backend storage.</li>
            </ul>

            <div className="mt-6 rounded-xl border border-orange-300/40 bg-orange-500/10 p-4">
              <p className="mono-ui text-xs text-orange-200 mb-2">ADMIN ACCESS NOTICE</p>
              <p className="text-sm text-slate-100/90 leading-relaxed">
                A private admin page is available at <span className="mono-ui">/admin</span> for authenticated management of portfolio content.
              </p>
              <Link href="/admin" className="inline-block mt-3 mono-ui text-xs border border-orange-300/60 px-3 py-2 rounded hover:bg-orange-300 hover:text-black">
                OPEN_ADMIN_PORTAL
              </Link>
            </div>
          </div>
        </div>
      </section>

      {settings?.showHomeVideo && settings?.homeVideoUrl && (
        <section className="max-w-6xl mx-auto mt-16 px-6">
          <div className="rounded-2xl surface-card p-4 border border-orange-300/30">
            <p className="mono-ui text-xs text-orange-200 mb-3">HOME_INTRO_VIDEO</p>
            <video
              src={settings.homeVideoUrl}
              controls
              playsInline
              className="w-full rounded-xl border border-blue-300/25"
            />
          </div>
        </section>
      )}

      {featuredProjects.length > 0 && (
        <section className="max-w-6xl mx-auto mt-20 px-6">
          <div className="flex items-end justify-between gap-4 mb-8">
            <h2 className="text-3xl font-bold text-white">Featured Project Snapshots</h2>
            <Link href="/projects" className="mono-ui text-sm text-orange-200 hover:text-orange-100">SEE_ALL_PROJECTS</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {featuredProjects.map((project) => (
              <article key={project._id} className="rounded-2xl surface-card p-5 h-full flex flex-col">
                <h3 className="text-lg font-bold text-white">{project.title}</h3>
                <p className="text-sm text-slate-100/70 mt-2 line-clamp-4">{project.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(project.techStack || []).slice(0, 3).map((tech) => (
                    <span key={`${project._id}-${tech}`} className="surface-chip mono-ui text-[10px] px-2 py-1 rounded-full">{tech}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {featuredBlogs.length > 0 && (
        <section className="max-w-6xl mx-auto mt-20 px-6">
          <div className="flex items-end justify-between gap-4 mb-8">
            <h2 className="text-3xl font-bold text-white">Latest Writing</h2>
            <Link href="/blogs" className="mono-ui text-sm text-orange-200 hover:text-orange-100">OPEN_BLOG_ARCHIVE</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {featuredBlogs.map((blog) => (
              <article key={blog._id} className="rounded-2xl surface-card p-5 h-full flex flex-col">
                {blog.coverImageUrl && (
                  <img
                    src={blog.coverImageUrl}
                    alt={blog.title}
                    className="w-full h-36 object-cover rounded mb-4 border border-blue-300/20"
                    loading="lazy"
                  />
                )}
                <h3 className="text-lg font-bold text-white line-clamp-2">{blog.title}</h3>
                <p className="text-xs text-orange-200/80 mono-ui mt-2">/{blog.slug}</p>
                <p className="text-sm text-slate-100/70 mt-3 line-clamp-4">{blog.aiSummary || blog.content}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-6xl mx-auto mt-20 px-6">
        <div className="rounded-2xl surface-card p-8 grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-3xl font-bold text-white">What I Usually Build</h2>
            <p className="text-slate-100/75 mt-3">
              Product-minded engineering with high reliability, measurable performance, and long-term maintainability.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="border border-blue-300/20 rounded-xl p-3 bg-blue-500/5">1. Backend APIs with robust auth, rate limits, and secure defaults.</div>
            <div className="border border-blue-300/20 rounded-xl p-3 bg-blue-500/5">2. Admin dashboards for content and operational workflows.</div>
            <div className="border border-blue-300/20 rounded-xl p-3 bg-blue-500/5">3. Data-focused features with pragmatic AI integration.</div>
            <div className="border border-blue-300/20 rounded-xl p-3 bg-blue-500/5">4. Frontends that balance visual identity with performance.</div>
          </div>
        </div>
      </section>

      {/* Skills Matrix Section */}
      {skills.length > 0 && (
        <section className="max-w-6xl mx-auto mt-24 px-6">
          <h2 className="text-3xl font-bold text-white mb-8 border-b border-blue-300/25 pb-2">
            ~/skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {skills.map(skill => (
              <div key={skill._id} className="p-4 surface-card rounded-xl hover:border-orange-300/60 transition-colors group">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    {renderSkillIcon(skill.icon, skill.name)}
                    <span className="text-white text-sm">{skill.name}</span>
                  </div>
                  <span className="text-xs text-orange-200">{skill.percentage}%</span>
                </div>
                <div className="w-full bg-black/30 h-1.5 rounded overflow-hidden">
                  <div 
                    className="h-full transition-all duration-1000 group-hover:brightness-110" 
                    style={{ width: `${skill.percentage}%`, backgroundColor: settings?.primaryColor || '#ff8e3c' }}
                  ></div>
                </div>
                <p className="mono-ui text-[10px] text-slate-200/70 mt-3">{skill.category || 'General'}</p>
                {skill.details && <p className="text-xs text-slate-100/75 mt-2 line-clamp-2">{skill.details}</p>}
              </div>
            ))}
          </div>

          {topSkillCategories.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {topSkillCategories.map((category) => (
                <span key={category} className="mono-ui text-xs px-3 py-1 border border-orange-300/40 bg-orange-500/10 rounded-full text-orange-100/90">
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
          <h2 className="text-3xl font-bold text-white mb-8 border-b border-blue-300/25 pb-2">
            ~/timeline
          </h2>
          <div className="border-l border-blue-300/25 pl-6 space-y-10">
            {education.map(edu => (
              <div key={edu._id} className="relative">
                <div className="absolute -left-[29px] top-1 w-3 h-3 bg-[#0a0f1d] border-2 border-orange-300 rounded-full"></div>
                <h3 className="text-xl text-white font-bold">{edu.institution}</h3>
                <p className="text-orange-200 mono-ui text-sm">{edu.degree}</p>
                <p className="text-slate-100/55 text-xs mt-1 mb-3">
                  {edu.startDate} - {edu.isCurrent ? <span className="text-orange-200 animate-pulse">Present</span> : edu.endDate}
                </p>
                {edu.description && (
                  <p className="text-slate-100/75 text-sm whitespace-pre-wrap">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}