"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../../components/navbar";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTech, setSelectedTech] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");

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
    "Kotlin"
  ];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`);
        if (!res.ok) throw new Error("Failed to fetch system records.");
        const data = await res.json();
        const p = Array.isArray(data) ? data : (data.data || []);
        setProjects(p);
        setFilteredProjects(p);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = projects;

    // Tech Stack Filter
    if (selectedTech !== "All") {
      result = result.filter((p) => (p.techStack || []).includes(selectedTech));
    }

    if (selectedLanguage !== "All") {
      result = result.filter((p) =>
        (p.techStack || []).some((t) => t.toLowerCase() === selectedLanguage.toLowerCase())
      );
    }
    
    setFilteredProjects(result);
  }, [selectedTech, selectedLanguage, projects]);

  // Extract unique tech stack tags from all projects
  const allTechStacks = ["All", ...new Set(projects.flatMap((p) => p.techStack || []))].sort();
  const allLanguages = [
    "All",
    ...new Set(
      projects
        .flatMap((p) => p.techStack || [])
        .filter((tech) => languageTags.some((lang) => lang.toLowerCase() === tech.toLowerCase()))
    )
  ].sort();

  return (
    <div className="min-h-screen bg-gray-950 text-green-400 font-mono pb-20">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 pt-20">
        <header className="mb-10 border-b border-green-900/50 pb-6">
          <h1 className="text-4xl font-bold text-white tracking-widest">/PROJECTS</h1>
          <p className="text-sm text-green-600 mt-2">&gt; Executing query: SELECT * FROM portfolio_projects...</p>
        </header>

        {/* Filter Bar */}
        <div className="mb-12 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <select 
              className="bg-gray-900/50 border border-green-900/50 rounded-lg py-2 px-4 text-green-400 focus:outline-none focus:border-green-500 appearance-none min-w-[200px]"
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
            >
              {allTechStacks.map(tech => (
                <option key={tech} value={tech}>{tech === 'All' ? '-- Tech Stack --' : tech}</option>
              ))}
            </select>

            <select
              className="bg-gray-900/50 border border-green-900/50 rounded-lg py-2 px-4 text-green-400 focus:outline-none focus:border-green-500 appearance-none min-w-[200px]"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
            >
              {allLanguages.map((language) => (
                <option key={language} value={language}>
                  {language === 'All' ? '-- Language --' : language}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {allTechStacks.slice(0, 8).map((tech) => (
              <button
                key={tech}
                onClick={() => setSelectedTech(tech)}
                className={`text-xs px-3 py-1 rounded transition-colors ${selectedTech === tech ? 'bg-green-600 text-black font-bold' : 'bg-green-950/30 border border-green-900/50 text-green-600 hover:bg-green-900/50'}`}
              >
                {tech}
              </button>
            ))}
            {allTechStacks.length > 8 && <span className="text-xs text-green-800 py-1">...and more</span>}
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <p className="animate-pulse">FETCHING_DATABASE_RECORDS...</p>
          </div>
        )}

        {error && (
          <div className="p-4 border border-red-500 bg-red-950/20 text-red-500">
            [SYS_ERROR]: {error}
          </div>
        )}

        {!isLoading && filteredProjects.length === 0 && (
          <div className="text-center py-10 opacity-50">
            No records matched selected filters.
          </div>
        )}

        {/* The Project Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence>
          {!isLoading && filteredProjects.map((project) => (
            <motion.article 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              key={project._id} 
              className="flex flex-col border border-green-900/50 bg-gray-900/30 rounded-lg overflow-hidden hover:border-green-500/50 transition-colors group"
            >
              {/* Project Image */}
              {project.imageUrl && (
                <div className="h-48 w-full overflow-hidden border-b border-green-900/50">
                  <img 
                    src={project.imageUrl} 
                    alt={project.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
              )}
              
              {/* Project Details */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-2">{project.title}</h2>
                <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                  {project.description}
                </p>

                {/* Tech Stack Tags */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {(project.techStack || []).map((tech, index) => (
                    <span 
                      key={index} 
                      className="text-xs bg-green-950/50 border border-green-900 text-green-500 px-2 py-1 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Links */}
                <div className="flex gap-4 border-t border-green-900/30 pt-4">
                  {project.githubLink && (
                    <a 
                      href={project.githubLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm hover:text-white transition-colors flex items-center gap-2"
                    >
                      [ SOURCE_CODE ]
                    </a>
                  )}
                  {project.liveLink && (
                    <a 
                      href={project.liveLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-green-300 hover:text-white transition-colors flex items-center gap-2"
                    >
                      [ LIVE_DEPLOYMENT ]
                    </a>
                  )}
                </div>
              </div>
            </motion.article>
          ))}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {!isLoading && projects.length === 0 && !error && (
          <p className="text-gray-500">No records found in the database.</p>
        )}
      </main>
    </div>
  );
}
