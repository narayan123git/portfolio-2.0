"use client";

import { useState, useEffect } from "react";

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "", description: "", status: "ongoing", techStack: "", githubLink: "", liveLink: "", isVisible: true, order: 0
  });
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState({ loading: false, message: "", type: "" });

  const getEffectiveStatus = (project) => {
    const explicit = String(project?.status || project?.completionStatus || "").toLowerCase();
    if (explicit === "completed" || explicit === "done") return "completed";
    if (explicit === "ongoing" || explicit === "in-progress") return "ongoing";
    return project?.liveLink ? "completed" : "ongoing";
  };

  // 1. Fetch existing records on load (with ?all=true to see hidden ones)
  const fetchProjects = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects?all=true`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error("Failed to fetch projects for admin panel");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // 2. Handle Insert OR Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: editingId ? "UPDATING_RECORD..." : "INITIATING_UPLOAD...", type: "info" });

    try {
      let imageUrl = formData.imageUrl || ""; // Keep old image if not uploading a new one

      // Upload new image to Cloudinary if selected
      if (image) {
        setStatus({ loading: true, message: "UPLOADING_MEDIA_TO_CLOUD...", type: "info" });
        const imageForm = new FormData();
        imageForm.append("image", image);
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
          method: "POST",
          credentials: "include",
          body: imageForm,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || "Image upload failed");
        imageUrl = uploadData.imageUrl;
      }

      setStatus({ loading: true, message: "WRITING_TO_DATABASE...", type: "info" });
      
      // Convert comma-separated tech stack into an array safely
      const techArray = typeof formData.techStack === "string" 
        ? formData.techStack.split(",").map(tech => tech.trim()).filter(Boolean)
        : formData.techStack;

      // Decide if POST (New) or PUT (Update)
      const method = editingId ? "PUT" : "POST";
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/projects/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/projects`;

      const projectRes = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, techStack: techArray, imageUrl }),
      });

      if (!projectRes.ok) throw new Error("Failed to save project");

      // Success Reset
      setStatus({ loading: false, message: editingId ? "RECORD_UPDATED" : "RECORD_SAVED", type: "success" });
      setFormData({ title: "", description: "", status: "ongoing", techStack: "", githubLink: "", liveLink: "", isVisible: true, order: 0 });
      setImage(null);
      setEditingId(null);
      fetchProjects(); // Refresh the data table instantly
      
      setTimeout(() => setStatus({ loading: false, message: "", type: "" }), 3000);

    } catch (error) {
      setStatus({ loading: false, message: `[ERROR]: ${error.message}`, type: "error" });
    }
  };

  // 3. Populate form for editing
  const handleEdit = (project) => {
    setEditingId(project._id);
    setFormData({
      title: project.title,
      description: project.description,
      status: getEffectiveStatus(project),
      techStack: project.techStack.join(", "),
      githubLink: project.githubLink || "",
      liveLink: project.liveLink || "",
      isVisible: project.isVisible ?? true,
      imageUrl: project.imageUrl,
      order: project.order || 0
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 3b. Handle reordering (move up/down)
  const handleReorder = async (projectId, direction) => {
    try {
      const currentProject = projects.find(p => p._id === projectId);
      if (!currentProject) return;

      const sorted = [...projects].sort((a, b) => a.order - b.order);
      const currentIndex = sorted.findIndex(p => p._id === projectId);
      
      if ((direction === "up" && currentIndex === 0) || (direction === "down" && currentIndex === sorted.length - 1)) {
        setStatus({ loading: false, message: "CANNOT_REORDER: Already at boundary", type: "error" });
        setTimeout(() => setStatus({ loading: false, message: "", type: "" }), 2000);
        return;
      }

      const swapProject = direction === "up" ? sorted[currentIndex - 1] : sorted[currentIndex + 1];
      
      // Swap order values
      const tempOrder = currentProject.order;
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${currentProject._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...currentProject, order: swapProject.order })
      });

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${swapProject._id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...swapProject, order: tempOrder })
      });

      fetchProjects();
    } catch (err) {
      console.error("Reorder failed", err);
    }
  };

  // 4. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("WARNING: Are you sure you want to permanently delete this record?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) fetchProjects();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* FORM SECTION */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">{editingId ? "EDIT_PROJECT_RECORD" : "ADD_NEW_PROJECT"}</h3>
        {status.message && <span className={`text-sm ${status.type === "error" ? "text-red-500" : status.type === "success" ? "text-green-500" : "text-yellow-500 animate-pulse"}`}>{status.message}</span>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-12 border-b border-green-900/50 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-green-600 mb-1">Project Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full bg-gray-950 border border-green-900 rounded p-2 text-sm text-green-400 focus:outline-none focus:border-green-400" />
          </div>
          <div>
            <label className="block text-xs text-green-600 mb-1">Tech Stack (comma separated)</label>
            <input type="text" name="techStack" value={formData.techStack} onChange={handleInputChange} required className="w-full bg-gray-950 border border-green-900 rounded p-2 text-sm text-green-400 focus:outline-none focus:border-green-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-green-600 mb-1">Description</label>
          <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="4" className="w-full bg-gray-950 border border-green-900 rounded p-2 text-sm text-green-400 focus:outline-none focus:border-green-400" />
        </div>

        <div>
          <label className="block text-xs text-green-600 mb-1">Project Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full bg-gray-950 border border-green-900 rounded p-2 text-sm text-green-400 focus:outline-none focus:border-green-400"
          >
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-green-600 mb-1">GitHub URL</label>
            <input type="url" name="githubLink" value={formData.githubLink} onChange={handleInputChange} className="w-full bg-gray-950 border border-green-900 rounded p-2 text-sm text-green-400 focus:outline-none focus:border-green-400" />
          </div>
          <div>
            <label className="block text-xs text-green-600 mb-1">Live URL (Optional)</label>
            <input type="url" name="liveLink" value={formData.liveLink} onChange={handleInputChange} className="w-full bg-gray-950 border border-green-900 rounded p-2 text-sm text-green-400 focus:outline-none focus:border-green-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-green-600 mb-1">Display Order (Lower number = shown first)</label>
          <input type="number" name="order" value={formData.order} onChange={handleInputChange} className="w-full bg-gray-950 border border-green-900 rounded p-2 text-sm text-green-400 focus:outline-none focus:border-green-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center border border-green-900/50 p-4 rounded bg-gray-950/30">
          <div>
            <label className="block text-xs text-green-600 mb-1">{editingId ? "Update Image (Leave blank to keep current)" : "Project Image"}</label>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="text-sm text-green-600 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-green-900/50 file:text-green-400 hover:file:bg-green-800" />
          </div>
          <div className="flex items-center justify-end space-x-2">
            <input type="checkbox" name="isVisible" checked={formData.isVisible} onChange={handleInputChange} className="w-4 h-4 accent-green-600" id="visible-toggle" />
            <label htmlFor="visible-toggle" className="text-sm text-green-400 cursor-pointer">Public Visibility</label>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={status.loading} className="flex-1 bg-green-900/40 hover:bg-green-800 border border-green-500 text-green-400 font-bold py-2 px-4 rounded transition-all mt-4">
            {status.loading ? "PROCESSING..." : editingId ? "EXECUTE_UPDATE" : "EXECUTE_INSERT"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setFormData({ title: "", description: "", status: "ongoing", techStack: "", githubLink: "", liveLink: "", isVisible: true, order: 0 }); setImage(null); }} className="flex-1 bg-gray-900 hover:bg-gray-800 border border-gray-500 text-gray-400 font-bold py-2 px-4 rounded transition-all mt-4">
              CANCEL_EDIT
            </button>
          )}
        </div>
      </form>

      <div>
        <h3 className="text-lg font-bold text-white mb-4">SYSTEM_RECORDS ({projects.length}) - Sorted by Order</h3>
        <div className="space-y-3">
          {[...projects].sort((a, b) => a.order - b.order).map((project) => (
            <div key={project._id} className="flex justify-between items-center p-4 border border-green-900/30 bg-gray-950 rounded hover:border-green-500/30 transition-colors">
              <div className="flex-1">
                <p className="text-white font-bold">{project.title}</p>
                <p className="text-xs text-green-600 truncate max-w-md">{project.description}</p>
                <p className="text-xs mt-1">
                  <span className={`px-2 py-0.5 rounded-full border ${getEffectiveStatus(project) === "completed" ? "text-emerald-300 border-emerald-700/60 bg-emerald-900/20" : "text-amber-300 border-amber-700/60 bg-amber-900/20"}`}>
                    {getEffectiveStatus(project).toUpperCase()}
                  </span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Order: {project.order}</p>
              </div>
              <div className="flex gap-2 flex-col sm:flex-row">
                <button onClick={() => handleReorder(project._id, "up")} className="text-blue-500 hover:text-blue-400 text-xs border border-blue-900/50 px-2 py-1 bg-blue-950/20 rounded">↑ UP</button>
                <button onClick={() => handleReorder(project._id, "down")} className="text-blue-500 hover:text-blue-400 text-xs border border-blue-900/50 px-2 py-1 bg-blue-950/20 rounded">↓ DOWN</button>
                <button onClick={() => handleEdit(project)} className="text-yellow-500 hover:text-yellow-400 text-sm border border-yellow-900/50 px-3 py-1 bg-yellow-950/20 rounded">
                  [ EDIT ]
                </button>
                <button onClick={() => handleDelete(project._id)} className="text-red-500 hover:text-red-400 text-sm border border-red-900/50 px-3 py-1 bg-red-950/20 rounded">
                  [ DELETE ]
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 && <p className="text-gray-600 text-sm">No records found.</p>}
        </div>
      </div>
    </div>
  );
}