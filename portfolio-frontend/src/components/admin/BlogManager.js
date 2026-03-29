"use client";

import { useState, useEffect } from "react";

export default function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "", slug: "", content: "", aiSummary: "", tags: "", readTime: "", published: true
  });
  const [status, setStatus] = useState({ loading: false, message: "", type: "" });

  // 1. Fetch existing records on load
  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs?all=true`);
      if (res.ok) {
        const data = await res.json();
        setBlogs(data);
      }
    } catch (err) {
      console.error("Failed to fetch blogs for admin panel");
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // 2. Handle Insert OR Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: editingId ? "UPDATING_LOG..." : "WRITING_LOG_TO_DB...", type: "info" });

    try {
      // Convert comma-separated tags into an array
      const tagsArray = typeof formData.tags === "string" 
        ? formData.tags.split(",").map(tag => tag.trim()).filter(Boolean)
        : formData.tags;

      // Determine the HTTP method and the exact URL (injecting the ID if editing)
      const method = editingId ? "PUT" : "POST";
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/blogs/${editingId}` 
        : `${process.env.NEXT_PUBLIC_API_URL}/blogs`;

      const res = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, tags: tagsArray }),
      });

      if (!res.ok) throw new Error("Failed to save log");

      setStatus({ loading: false, message: editingId ? "LOG_UPDATED_SUCCESSFULLY" : "LOG_PUBLISHED_SUCCESSFULLY", type: "success" });
      setFormData({ title: "", slug: "", content: "", aiSummary: "", tags: "", readTime: "", published: true });
      setEditingId(null);
      fetchBlogs(); // Refresh the table
      
      setTimeout(() => setStatus({ loading: false, message: "", type: "" }), 3000);
    } catch (error) {
      setStatus({ loading: false, message: `[ERROR]: ${error.message}`, type: "error" });
    }
  };

  // 3. Populate form for editing
  const handleEdit = (blog) => {
    setEditingId(blog._id);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      aiSummary: blog.aiSummary,
      tags: blog.tags.join(", "), // Convert array back to string for input
      readTime: blog.readTime,
      published: blog.published ?? true
    });
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll up to the form
  };

  // 4. Handle Delete (Injecting the ID into the URL)
  const handleDelete = async (id) => {
    if (!window.confirm("WARNING: Are you sure you want to permanently delete this log?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (res.ok) fetchBlogs(); // Refresh the table
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="max-w-4xl">
      {/* FORM SECTION */}
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">{editingId ? "EDIT_SYSTEM_LOG" : "WRITE_NEW_LOG"}</h3>
        {status.message && <span className={`text-sm ${status.type === "error" ? "text-red-500" : status.type === "success" ? "text-green-500" : "text-yellow-500 animate-pulse"}`}>{status.message}</span>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-12 border-b border-green-900/50 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-green-600 mb-1">Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full bg-gray-950 border border-green-900 rounded p-2 text-sm text-green-400 focus:outline-none focus:border-green-400" />
          </div>
          <div>
            <label className="block text-xs text-green-600 mb-1">URL Slug (e.g., my-first-post)</label>
            <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} required className="w-full bg-gray-950 border border-green-900 rounded p-2 text-sm text-green-400 focus:outline-none focus:border-green-400" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-green-600 mb-1">Main Content</label>
          <textarea name="content" value={formData.content} onChange={handleInputChange} required rows="6" className="w-full bg-gray-950 border border-green-900 rounded p-2 text-sm text-green-400 focus:outline-none focus:border-green-400" />
        </div>

        <div>
          <label className="block text-xs text-green-600 mb-1">AI Summary (Short intro)</label>
          <textarea name="aiSummary" value={formData.aiSummary} onChange={handleInputChange} required rows="2" className="w-full bg-gray-950 border border-green-900 rounded p-2 text-sm text-green-400 focus:outline-none focus:border-green-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="col-span-2">
            <label className="block text-xs text-green-600 mb-1">Tags (comma separated)</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} className="w-full bg-gray-950 border border-green-900 rounded p-2 text-sm text-green-400 focus:outline-none focus:border-green-400" />
          </div>
          <div>
            <label className="block text-xs text-green-600 mb-1">Read Time (mins)</label>
            <input type="number" name="readTime" value={formData.readTime} onChange={handleInputChange} required className="w-full bg-gray-950 border border-green-900 rounded p-2 text-sm text-green-400 focus:outline-none focus:border-green-400" />
          </div>
        </div>
        
        <div className="flex gap-4">
          <button type="submit" disabled={status.loading} className="flex-1 bg-green-900/40 hover:bg-green-800 border border-green-500 text-green-400 font-bold py-2 px-4 rounded transition-all mt-4">
            {status.loading ? "PROCESSING..." : editingId ? "EXECUTE_UPDATE" : "PUBLISH_LOG"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setFormData({ title: "", slug: "", content: "", aiSummary: "", tags: "", readTime: "", published: true }); }} className="flex-1 bg-gray-900 hover:bg-gray-800 border border-gray-500 text-gray-400 font-bold py-2 px-4 rounded transition-all mt-4">
              CANCEL_EDIT
            </button>
          )}
        </div>
      </form>

      {/* EXISTING RECORDS TABLE */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">SYSTEM_LOGS ({blogs.length})</h3>
        <div className="space-y-3">
          {blogs.map((blog) => (
            <div key={blog._id} className="flex justify-between items-center p-4 border border-green-900/30 bg-gray-950 rounded hover:border-green-500/30 transition-colors">
              <div>
                <p className="text-white font-bold">{blog.title}</p>
                <p className="text-xs text-green-600">/{blog.slug}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleEdit(blog)} className="text-yellow-500 hover:text-yellow-400 text-sm border border-yellow-900/50 px-3 py-1 bg-yellow-950/20 rounded">
                  [ EDIT ]
                </button>
                <button onClick={() => handleDelete(blog._id)} className="text-red-500 hover:text-red-400 text-sm border border-red-900/50 px-3 py-1 bg-red-950/20 rounded">
                  [ DELETE ]
                </button>
              </div>
            </div>
          ))}
          {blogs.length === 0 && <p className="text-gray-600 text-sm">No records found.</p>}
        </div>
      </div>
    </div>
  );
}