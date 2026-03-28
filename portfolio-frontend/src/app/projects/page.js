"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`);
        if (!res.ok) throw new Error("Failed to fetch system records.");
        const data = await res.json();
        setProjects(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-green-400 font-mono pb-20">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 pt-20">
        <header className="mb-16 border-b border-green-900/50 pb-6">
          <h1 className="text-4xl font-bold text-white tracking-widest">/PROJECTS</h1>
          <p className="text-sm text-green-600 mt-2">&gt; Executing query: SELECT * FROM portfolio_projects...</p>
        </header>

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

        {/* The Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {!isLoading && projects.map((project) => (
            <article 
              key={project._id} 
              className="border border-green-900/50 bg-gray-900/30 rounded-lg overflow-hidden hover:border-green-500/50 transition-colors group"
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
                  {project.techStack.map((tech, index) => (
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
            </article>
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && projects.length === 0 && !error && (
          <p className="text-gray-500">No records found in the database.</p>
        )}
      </main>
    </div>
  );
}
