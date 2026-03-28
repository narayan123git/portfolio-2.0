"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectManager from "../../../components/admin/ProjectManager";
import BlogManager from "../../../components/admin/BlogManager";
import DiaryManager from "../../../components/admin/DiaryManager";
import SecurityManager from "../../../components/admin/SecurityManager";
import MessageManager from "../../../components/admin/MessageManager";
import SettingsManager from "../../../components/admin/SettingsManager";
import SkillManager from "../../../components/admin/SkillManager";
import EducationManager from "../../../components/admin/EducationManager";
export default function AdminDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");

  // 1. The Gatekeeper: Verify the VIP Pass exists
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin"); // Kick them out if no token is found
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  // 2. Secure Logout function
  const handleLogout = () => {
    localStorage.removeItem("adminToken"); // Destroy the token
    router.push("/admin"); // Send back to login
  };

  // 3. Loading state while verifying
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-green-400 font-mono">
        <p className="animate-pulse">VERIFYING_CREDENTIALS...</p>
      </div>
    );
  }

  // 4. The Main Dashboard UI
  return (
    <div className="min-h-screen bg-gray-950 text-green-400 font-mono flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-green-900/50 p-6 flex flex-col h-screen sticky top-0">
        <h2 className="text-xl font-bold tracking-widest mb-10 text-white">SYS_ADMIN</h2>
        <nav className="flex-1 space-y-4">
          <button
            onClick={() => setActiveTab("projects")}
            className={`block w-full text-left p-2 hover:bg-green-900/30 transition-colors rounded ${activeTab === "projects" ? "bg-green-900/50 text-white border-l-2 border-green-400" : ""}`}
          >
            &gt; Projects
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className={`block w-full text-left p-2 hover:bg-green-900/30 transition-colors rounded ${activeTab === "blogs" ? "bg-green-900/50 text-white border-l-2 border-green-400" : ""}`}
          >
            &gt; Blogs
          </button>
          <button
            onClick={() => setActiveTab("diary")}
            className={`block w-full text-left p-2 hover:bg-green-900/30 transition-colors rounded ${activeTab === "diary" ? "bg-green-900/50 text-white border-l-2 border-green-400" : ""}`}
          >
            &gt; Diary
          </button>
          <button
            onClick={() => setActiveTab("skills")}
            className={`block w-full text-left p-2 hover:bg-green-900/30 transition-colors rounded ${activeTab === "skills" ? "bg-green-900/50 text-white border-l-2 border-green-400" : ""}`}
          >
            &gt; Skills
          </button>
          <button
            onClick={() => setActiveTab("education")}
            className={`block w-full text-left p-2 hover:bg-green-900/30 transition-colors rounded ${activeTab === "education" ? "bg-green-900/50 text-white border-l-2 border-green-400" : ""}`}
          >
            &gt; Education
          </button>
          <button
            onClick={() => setActiveTab("messages")}
            className={`block w-full text-left p-2 hover:bg-green-900/30 transition-colors rounded ${activeTab === "messages" ? "bg-green-900/50 text-white border-l-2 border-green-400" : ""}`}
          >
            &gt; Messages
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`block w-full text-left p-2 hover:bg-green-900/30 transition-colors rounded ${activeTab === "settings" ? "bg-green-900/50 text-white border-l-2 border-green-400" : ""}`}
          >
            &gt; Universal Settings
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`block w-full text-left p-2 hover:bg-green-900/30 transition-colors rounded ${activeTab === "security" ? "bg-green-900/50 text-white border-l-2 border-green-400" : ""}`}
          >
            &gt; Security Logs
          </button>
        </nav>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-auto text-red-500 hover:text-red-400 p-2 text-left w-full border border-red-900/50 rounded bg-red-950/20 transition-colors"
        >
          [ TERMINATE_SESSION ]
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10 border-b border-green-900/50 pb-4">
          <h1 className="text-3xl font-bold text-white uppercase">{activeTab} MODULE</h1>
          <p className="text-sm text-green-600 mt-2">Manage your database records securely.</p>
        </header>
        {/* Dynamic Content Container */}
        <div className="border border-green-900/50 rounded-lg p-6 bg-gray-900/50 min-h-[500px]">
          {activeTab === "projects" && <ProjectManager />}
          {activeTab === "blogs" && <BlogManager />}
          {activeTab === "diary" && <DiaryManager />}
          {activeTab === "skills" && <SkillManager />}
          {activeTab === "education" && <EducationManager />}
          {activeTab === "messages" && <MessageManager />}
          {activeTab === "settings" && <SettingsManager />}
          {activeTab === "security" && <SecurityManager />}
        </div>
      </main>
    </div>
  );
}