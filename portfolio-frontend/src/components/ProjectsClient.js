"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./navbar";

const languageTags = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C",
  "C++",
  "C#",
  "Go",
  "Rust",
  "PHP",
  "Ruby",
  "Swift",
  "Kotlin",
];

function categorizeProject(project) {
  const explicit = String(project.status || project.completionStatus || "").toLowerCase();

  if (explicit === "ongoing" || explicit === "in-progress") return "ongoing";
  if (explicit === "completed" || explicit === "done") return "completed";

  return project.liveLink ? "completed" : "ongoing";
}

export default function ProjectsClient({ initialProjects = [] }) {
  const [selectedTech, setSelectedTech] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");

  const allTechStacks = useMemo(
    () => ["All", ...new Set(initialProjects.flatMap((p) => p.techStack || []))].sort(),
    [initialProjects]
  );

  const allLanguages = useMemo(
    () => [
      "All",
      ...new Set(
        initialProjects
          .flatMap((p) => p.techStack || [])
          .filter((tech) => languageTags.some((lang) => lang.toLowerCase() === tech.toLowerCase()))
      ),
    ].sort(),
    [initialProjects]
  );

  const filteredProjects = useMemo(() => {
    let result = initialProjects;

    if (selectedTech !== "All") {
      result = result.filter((p) => (p.techStack || []).includes(selectedTech));
    }

    if (selectedLanguage !== "All") {
      result = result.filter((p) =>
        (p.techStack || []).some((t) => t.toLowerCase() === selectedLanguage.toLowerCase())
      );
    }

    return result;
  }, [initialProjects, selectedLanguage, selectedTech]);

  const ongoingProjects = filteredProjects.filter((project) => categorizeProject(project) === "ongoing");
  const completedProjects = filteredProjects.filter((project) => categorizeProject(project) === "completed");

  const renderProjectCard = (project) => (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25 }}
      key={project._id}
      className="rounded-2xl border border-cyan-300/20 bg-slate-900/70 backdrop-blur-sm overflow-hidden group hover:border-cyan-300/50 hover:shadow-[0_0_40px_rgba(6,182,212,0.16)] transition-all"
    >
      {project.imageUrl && (
        <div className="h-52 w-full overflow-hidden border-b border-slate-700/80">
          <img
            src={project.imageUrl}
            alt={project.title}
            className="w-full h-full object-cover brightness-90 group-hover:brightness-110 group-hover:scale-105 transition-all duration-500"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <h2 className="text-2xl font-bold text-cyan-100 tracking-tight">{project.title}</h2>
          <span className={`text-[11px] px-2.5 py-1 rounded-full border ${categorizeProject(project) === "ongoing" ? "border-amber-300/40 text-amber-200 bg-amber-500/10" : "border-emerald-300/40 text-emerald-200 bg-emerald-500/10"}`}>
            {categorizeProject(project).toUpperCase()}
          </span>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed mb-6">{project.description}</p>

        <div className="flex flex-wrap gap-2 mb-7">
          {(project.techStack || []).map((tech, index) => (
            <span key={index} className="text-xs bg-cyan-500/10 border border-cyan-300/30 text-cyan-100 px-2.5 py-1 rounded-full">
              {tech}
            </span>
          ))}
        </div>

        <div className="flex gap-3 border-t border-slate-700/70 pt-4">
          {project.githubLink && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-3 py-2 rounded-lg border border-slate-600 text-slate-200 hover:text-white hover:border-cyan-300/60 hover:bg-cyan-500/10 transition-colors"
            >
              Source
            </a>
          )}
          {project.liveLink && (
            <a
              href={project.liveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm px-3 py-2 rounded-lg border border-emerald-300/40 text-emerald-100 hover:border-emerald-200 hover:bg-emerald-500/10 transition-colors"
            >
              Live Preview
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#164e63_0%,#0f172a_35%,#020617_100%)] text-slate-100 pb-24">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 pt-20">
        <header className="mb-10 rounded-2xl border border-cyan-300/20 bg-slate-900/60 p-7 backdrop-blur-sm">
          <h1 className="text-4xl font-semibold tracking-tight text-cyan-100">Projects Control Deck</h1>
          <p className="text-sm text-slate-300 mt-2">Curated builds grouped by execution state and stack depth.</p>
        </header>

        <div className="mb-12 space-y-4 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <select
              className="bg-slate-950/70 border border-slate-600 rounded-lg py-2.5 px-4 text-slate-100 focus:outline-none focus:border-cyan-300 appearance-none min-w-[200px]"
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
            >
              {allTechStacks.map((tech) => (
                <option key={tech} value={tech}>{tech === "All" ? "-- Tech Stack --" : tech}</option>
              ))}
            </select>

            <select
              className="bg-slate-950/70 border border-slate-600 rounded-lg py-2.5 px-4 text-slate-100 focus:outline-none focus:border-cyan-300 appearance-none min-w-[200px]"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {allLanguages.map((language) => (
                <option key={language} value={language}>
                  {language === "All" ? "-- Language --" : language}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-2">
            {allTechStacks.slice(0, 8).map((tech) => (
              <button
                key={tech}
                onClick={() => setSelectedTech(tech)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${selectedTech === tech ? "bg-cyan-300 text-slate-950 font-semibold" : "bg-slate-800/80 border border-slate-600 text-slate-300 hover:bg-slate-700"}`}
              >
                {tech}
              </button>
            ))}
            {allTechStacks.length > 8 && <span className="text-xs text-slate-500 py-1">...and more</span>}
          </div>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            No projects matched selected filters.
          </div>
        )}

        <div className="space-y-12">
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-amber-100">Ongoing</h2>
              <span className="text-sm text-amber-200/80">{ongoingProjects.length} active</span>
            </div>
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-7">
              <AnimatePresence>
                {ongoingProjects.map(renderProjectCard)}
              </AnimatePresence>
            </motion.div>
            {ongoingProjects.length === 0 && <p className="text-slate-500 text-sm">No ongoing projects in this filter state.</p>}
          </section>

          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-emerald-100">Completed</h2>
              <span className="text-sm text-emerald-200/80">{completedProjects.length} shipped</span>
            </div>
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-7">
              <AnimatePresence>
                {completedProjects.map(renderProjectCard)}
              </AnimatePresence>
            </motion.div>
            {completedProjects.length === 0 && <p className="text-slate-500 text-sm">No completed projects in this filter state.</p>}
          </section>
        </div>

        {initialProjects.length === 0 && (
          <p className="text-slate-500 mt-10">No projects found in the database.</p>
        )}
      </main>
    </div>
  );
}
