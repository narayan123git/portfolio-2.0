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
    return <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-300/30 flex items-center justify-center text-xs text-orange-200 shadow-[0_0_10px_rgba(255,142,60,0.2)]">SK</div>;
  }

  if (isUrl(iconName)) {
    return (
      <img
        src={iconName}
        alt={skillName || 'Skill icon'}
        className="w-8 h-8 rounded object-contain bg-black/40 p-1 border border-white/5"
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

  return <IconComponent className="w-6 h-6 text-orange-200 group-hover:text-orange-400 transition-colors drop-shadow-[0_0_8px_rgba(255,142,60,0.4)]" aria-hidden="true" />;
};

export default async function Home() {
  const [settings, skills, education, projects, blogs] = await Promise.all([
    getSettings(),
    getSkills(),
    getEducation(),
    getProjects(),
    getBlogs(),
  ]);
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
    <main className="min-h-screen bg-[#050914] text-slate-100 selection:bg-orange-500/30 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/3 right-0 w-[500px] h-[500px] bg-orange-600/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

      <Navbar />
      
      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto pt-24 md:pt-36 px-6 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-3 border-l-2 border-orange-400/80 pl-8 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-300/20">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
              <p className="mono-ui text-orange-200/90 text-xs tracking-wider">SYSTEM.STATUS: ACTIVE_AND_CODING</p>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
              Hello, I&apos;m <br />
              <span 
                className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-200 drop-shadow-[0_0_15px_rgba(255,142,60,0.3)]"
                style={settings?.primaryColor ? { color: settings.primaryColor, background: 'none', WebkitTextFillColor: 'initial' } : {}}
              >
                Narayan Paul.
              </span>
            </h1>
            
            <p className="text-slate-300 text-lg md:text-xl max-w-2xl leading-relaxed font-light">
              {settings?.heroText || 'I got into computer science because I genuinely enjoy solving problems. Over time, that curiosity has grown into building real systems - from full-stack products to machine learning experiments.'}
            </p>
            
            <p className="text-slate-400/80 text-sm max-w-xl leading-relaxed">
              I care about consistency, strong fundamentals, and practical implementation. Whether it is DSA, backend design, or deep learning, I try to understand things deeply instead of rushing through them.
            </p>

            <div className="pt-6 flex gap-4 flex-wrap">
              <MagneticButton>
                <Link 
                  href="/projects" 
                  className="mono-ui bg-orange-500/20 border border-orange-400/50 px-8 py-3 text-sm hover:bg-orange-400 hover:text-black transition-all duration-300 inline-block text-center rounded shadow-[0_0_15px_rgba(255,142,60,0.15)]"
                >
                  [ VIEW_PROJECTS ]
                </Link>
              </MagneticButton>

              {resumeUrl && (
                <MagneticButton>
                  <a 
                    href={resumeUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mono-ui border border-blue-400/30 bg-blue-900/10 text-slate-200 px-8 py-3 text-sm hover:border-blue-300 hover:bg-blue-800/30 transition-all duration-300 inline-block text-center rounded"
                  >
                    DOWNLOAD_CV.PDF
                  </a>
                </MagneticButton>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-10">
              <div className="rounded-xl bg-[#0a0f1d]/80 border border-white/5 p-4 backdrop-blur-sm hover:border-orange-400/30 transition-colors group">
                <p className="mono-ui text-[10px] text-orange-200/60 mb-1 group-hover:text-orange-300 transition-colors">PROJECTS_TRACKED</p>
                <p className="text-3xl font-bold text-white">{projects.length}</p>
              </div>
              <div className="rounded-xl bg-[#0a0f1d]/80 border border-white/5 p-4 backdrop-blur-sm hover:border-orange-400/30 transition-colors group">
                <p className="mono-ui text-[10px] text-orange-200/60 mb-1 group-hover:text-orange-300 transition-colors">SKILLS_INDEXED</p>
                <p className="text-3xl font-bold text-white">{skills.length}</p>
              </div>
              <div className="rounded-xl bg-[#0a0f1d]/80 border border-white/5 p-4 backdrop-blur-sm hover:border-orange-400/30 transition-colors group">
                <p className="mono-ui text-[10px] text-orange-200/60 mb-1 group-hover:text-orange-300 transition-colors">EDU_MILESTONES</p>
                <p className="text-3xl font-bold text-white">{education.length}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative rounded-2xl bg-[#0a0f1d] border border-white/10 p-8 shadow-2xl h-full flex flex-col justify-center">
              {settings?.profileImageUrl && (
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-500 rounded-full blur-md opacity-30 animate-pulse"></div>
                    <img
                      src={settings.profileImageUrl}
                      alt="Narayan profile"
                      className="relative w-36 h-36 rounded-full object-cover border-2 border-orange-400/60 shadow-xl"
                    />
                  </div>
                </div>
              )}
              <h2 className="text-xl font-bold text-white text-center">What This Portfolio Represents</h2>
              <p className="text-sm text-slate-300/80 mt-3 leading-relaxed text-center">
                This site is a reflection of how I learn and build: solve real problems, ship real features, and keep improving with every iteration.
              </p>
              <ul className="mt-5 space-y-3 text-xs text-slate-300/90 font-mono bg-black/40 p-4 rounded-lg border border-white/5">
                <li className="flex gap-2"><span className="text-orange-400">&gt;</span> Built with discipline, not shortcuts</li>
                <li className="flex gap-2"><span className="text-orange-400">&gt;</span> Strong focus on backend + system thinking</li>
                <li className="flex gap-2"><span className="text-orange-400">&gt;</span> Practical projects over tutorial-only learning</li>
                <li className="flex gap-2"><span className="text-orange-400">&gt;</span> Continuous growth in ML and problem-solving</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: ACADEMIC & PERSONAL MILESTONES */}
      <section className="max-w-6xl mx-auto mt-32 px-6">
        <div className="relative rounded-2xl bg-gradient-to-br from-[#0a0f1d] to-[#111726] border border-orange-300/20 p-8 md:p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <h2 className="text-3xl font-bold text-white mb-8 relative z-10 border-b border-white/10 pb-4">
            My Journey So Far
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 relative z-10">
            <div>
               <h3 className="text-lg font-semibold text-orange-300 mb-4 mono-ui tracking-wide">~/from_curiosity_to_building</h3>
               <div className="space-y-4 text-slate-300/90 text-sm leading-relaxed">
                 <p className="bg-black/20 p-4 rounded-lg border border-white/5">
                   I did not get into computer science because it was trendy. I got into it because I genuinely enjoyed solving problems.
                 </p>
                 <p className="bg-black/20 p-4 rounded-lg border border-white/5">
                   Early on, I was naturally drawn to mathematics and logical thinking. That curiosity translated into consistent academics - around 96% in Class 10, strong performance in Class 12, and then JEE Main.
                 </p>
                 <p className="bg-black/20 p-4 rounded-lg border border-white/5">
                   At NIT Durgapur (CSE), my focus shifted from just scoring to truly understanding and building. Maintaining a CGPA around 9.4 matters to me, but what matters more is how I used my time outside the classroom.
                 </p>
               </div>
            </div>
            <div className="flex flex-col justify-center">
               <h3 className="text-lg font-semibold text-blue-300 mb-4 mono-ui tracking-wide">~/how_i_learn</h3>
               <div className="bg-blue-900/10 border border-blue-400/20 p-6 rounded-xl text-slate-300/90 text-sm leading-relaxed space-y-4">
                 <p>
                   I have always seen myself as a builder. During my early phase, I explored web development and built a full-stack MERN project where I handled backend logic, real-time features, and system design decisions.
                 </p>
                 <p>
                   I have solved 250+ DSA problems, not for numbers, but to train clear thinking under constraints and to stay patient when solutions do not come quickly.
                 </p>
                 <p>
                   Recently, I have been exploring Machine Learning and Deep Learning through structured learning and hands-on experimentation, especially in computer vision and meaningful applications like healthcare.
                 </p>
                 <p>
                   Outside coding, I enjoy chess and creative downtime. Both help me reset and improve how I think about complex problems.
                 </p>
               </div>
            </div>
          </div>

          <p className="mt-8 text-slate-300/90 text-sm leading-relaxed relative z-10 bg-black/20 p-4 rounded-lg border border-white/5">
            Overall, I see myself as someone still evolving - not chasing shortcuts, but focusing on steady, meaningful growth. I am not only interested in learning technologies; I am interested in using them to build systems that are efficient, reliable, and impactful.
          </p>
        </div>
      </section>

      {/* FEATURED PROJECTS */}
      {featuredProjects.length > 0 && (
        <section className="max-w-6xl mx-auto mt-32 px-6">
          <div className="flex items-end justify-between gap-4 mb-10 border-b border-white/10 pb-4">
            <h2 className="text-3xl font-bold text-white">Featured Projects</h2>
            <Link href="/projects" className="mono-ui text-sm text-orange-300 hover:text-orange-200 transition-colors">SEE_ALL_PROJECTS &rarr;</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <article key={project._id} className="group rounded-2xl bg-[#0a0f1d] border border-white/10 p-6 h-full flex flex-col hover:border-orange-400/40 hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <h3 className="text-xl font-bold text-white group-hover:text-orange-300 transition-colors">{project.title}</h3>
                <p className="text-sm text-slate-400 mt-3 line-clamp-4 leading-relaxed flex-grow">{project.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {(project.techStack || []).slice(0, 4).map((tech) => (
                    <span key={`${project._id}-${tech}`} className="mono-ui text-[10px] px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* FEATURED WRITING */}
      {featuredBlogs.length > 0 && (
        <section className="max-w-6xl mx-auto mt-32 px-6">
          <div className="flex items-end justify-between gap-4 mb-10 border-b border-white/10 pb-4">
            <h2 className="text-3xl font-bold text-white">My Writings</h2>
            <Link href="/blogs" className="mono-ui text-sm text-blue-300 hover:text-blue-200 transition-colors">OPEN_BLOG_ARCHIVE &rarr;</Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {featuredBlogs.map((blog) => (
              <article key={blog._id} className="group rounded-2xl bg-[#0a0f1d] border border-white/10 overflow-hidden h-full flex flex-col hover:border-blue-400/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300">
                {blog.coverImageUrl ? (
                  <div className="h-40 overflow-hidden relative border-b border-white/10">
                    <div className="absolute inset-0 bg-blue-900/20 group-hover:bg-transparent transition-colors z-10"></div>
                    <img
                      src={blog.coverImageUrl}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-xs text-blue-300/80 mono-ui mb-3">/{blog.slug}</p>
                  <h3 className="text-lg font-bold text-white line-clamp-2 leading-snug group-hover:text-blue-300 transition-colors">{blog.title}</h3>
                  <p className="text-sm text-slate-400 mt-3 line-clamp-3 leading-relaxed">{blog.aiSummary || blog.content}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* SKILLS MATRIX */}
      {skills.length > 0 && (
        <section className="max-w-6xl mx-auto mt-32 px-6">
          <h2 className="text-3xl font-bold text-white mb-10 border-b border-white/10 pb-4">
            ~/engineering_matrix
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {skills.map(skill => (
              <div key={skill._id} className="p-5 bg-[#0a0f1d] border border-white/5 rounded-xl hover:border-orange-400/50 hover:bg-orange-950/10 transition-all duration-300 group">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-3">
                    {renderSkillIcon(skill.icon, skill.name)}
                    <span className="text-white text-sm font-semibold tracking-wide">{skill.name}</span>
                  </div>
                  <span className="mono-ui text-xs text-orange-300/80">{skill.percentage}%</span>
                </div>
                <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-125 shadow-[0_0_10px_rgba(255,142,60,0.5)]" 
                    style={{ width: `${skill.percentage}%`, backgroundColor: settings?.primaryColor || '#ff8e3c' }}
                  ></div>
                </div>
                <p className="mono-ui text-[10px] text-slate-500 mt-4 uppercase tracking-wider">{skill.category || 'General'}</p>
                {skill.details && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{skill.details}</p>}
              </div>
            ))}
          </div>

          {topSkillCategories.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-3">
              {topSkillCategories.map((category) => (
                <span key={category} className="mono-ui text-[11px] px-4 py-1.5 border border-orange-400/20 bg-orange-500/5 rounded text-orange-200/90 tracking-wider">
                  [{category}]
                </span>
              ))}
            </div>
          )}
        </section>
      )}

      {/* TIMELINE SECTION */}
      {education.length > 0 && (
        <section className="max-w-6xl mx-auto mt-32 px-6">
          <h2 className="text-3xl font-bold text-white mb-12 border-b border-white/10 pb-4">
            ~/chronology
          </h2>
          <div className="border-l-2 border-white/10 pl-8 space-y-12 ml-2 md:ml-4">
            {education.map(edu => (
              <div key={edu._id} className="relative group">
                <div className="absolute -left-[41px] top-1.5 w-4 h-4 bg-[#050914] border-[3px] border-blue-400 rounded-full group-hover:scale-125 group-hover:border-orange-400 group-hover:shadow-[0_0_15px_rgba(255,142,60,0.5)] transition-all duration-300"></div>
                
                <h3 className="text-2xl text-white font-bold tracking-tight">{edu.institution}</h3>
                {edu.location && <p className="text-slate-400 text-sm mt-1">{edu.location}</p>}
                <p className="text-blue-300 mono-ui text-sm mt-2">{edu.degree}</p>
                
                <div className="mt-3 flex flex-wrap gap-2">
                  {edu.specialization && (
                    <span className="mono-ui text-[10px] px-2.5 py-1 border border-white/10 rounded bg-white/5 text-slate-300">
                      {edu.specialization}
                    </span>
                  )}
                  {edu.boardOrUniversity && (
                    <span className="mono-ui text-[10px] px-2.5 py-1 border border-white/10 rounded bg-white/5 text-slate-300">
                      {edu.boardOrUniversity}
                    </span>
                  )}
                  {edu.score && (
                    <span className="mono-ui text-[10px] px-2.5 py-1 border border-emerald-400/30 rounded bg-emerald-500/10 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                      {edu.score}
                    </span>
                  )}
                </div>
                
                <div className="inline-block mt-4 px-3 py-1 bg-black/30 border border-white/5 rounded text-slate-400 text-xs mono-ui">
                  {edu.startDate} &mdash; {edu.isCurrent ? <span className="text-orange-400 font-bold animate-pulse">PRESENT</span> : edu.endDate}
                </div>
                
                {edu.description && (
                  <p className="text-slate-300 text-sm whitespace-pre-wrap mt-4 leading-relaxed bg-[#0a0f1d] border border-white/5 p-4 rounded-lg">
                    {edu.description}
                  </p>
                )}
                {edu.activities && (
                  <p className="text-slate-400 text-sm whitespace-pre-wrap mt-3 flex gap-2">
                    <span className="text-blue-400">&gt;</span> {edu.activities}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}