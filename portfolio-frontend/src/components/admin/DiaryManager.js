"use client";

import { useState, useEffect } from "react";

export default function DiaryManager() {
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ content: "", currentStatus: "CODING" });
  const [status, setStatus] = useState({ loading: false, message: "", type: "" });

  const fetchEntries = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diary`);
      if (res.ok) setEntries(await res.json());
    } catch (err) {
      console.error("Failed to fetch diary entries");
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, message: editingId ? "UPDATING_ENTRY..." : "ENCRYPTING_ENTRY...", type: "info" });
    const token = localStorage.getItem("adminToken");

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/diary/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/diary`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save entry");

      setStatus({ loading: false, message: editingId ? "ENTRY_UPDATED" : "ENTRY_RECORDED", type: "success" });
      setFormData({ content: "", currentStatus: "CODING" });
      setEditingId(null);
      fetchEntries(); // Refresh the table
      setTimeout(() => setStatus({ loading: false, message: "", type: "" }), 3000);
    } catch (error) {
      setStatus({ loading: false, message: `[ERROR]: ${error.message}`, type: "error" });
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry._id);
    setFormData({ content: entry.content, currentStatus: entry.currentStatus || "CODING" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("WARNING: Permanently delete this diary entry?")) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/diary/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchEntries();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">{editingId ? "EDIT_DIARY_ENTRY" : "NEW_DIARY_ENTRY"}</h3>
        {status.message && <span className={`text-sm ${status.type === "error" ? "text-red-500" : "text-green-500"}`}>{status.message}</span>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mb-12 border-b border-green-900/50 pb-8">
        <div>
          <label className="block text-xs text-green-600 mb-1">Current Status</label>
          <select name="currentStatus" value={formData.currentStatus} onChange={handleInputChange} className="w-full bg-gray-950 border border-green-900 rounded p-2 text-sm text-green-400 focus:outline-none focus:border-green-400">
            <option value="CODING">CODING</option>
            <option value="DEBUGGING">DEBUGGING</option>
            <option value="LEARNING">LEARNING</option>
            <option value="PLANNING">PLANNING</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-green-600 mb-1">Entry Content</label>
          <textarea name="content" value={formData.content} onChange={handleInputChange} required rows="5" className="w-full bg-gray-950 border border-green-900 rounded p-2 text-sm text-green-400 focus:outline-none focus:border-green-400" placeholder="Today I optimized the database queries..." />
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={status.loading} className="flex-1 bg-green-900/40 hover:bg-green-800 border border-green-500 text-green-400 font-bold py-2 rounded">
            {status.loading ? "PROCESSING..." : editingId ? "UPDATE_ENTRY" : "COMMIT_ENTRY"}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setFormData({ content: "", currentStatus: "CODING" }); }} className="flex-1 bg-gray-900 hover:bg-gray-800 border border-gray-500 text-gray-400 font-bold py-2 rounded">
              CANCEL_EDIT
            </button>
          )}
        </div>
      </form>

      {/* EXISTING RECORDS TABLE */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">DIARY_LOGS ({entries.length})</h3>
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry._id} className="flex justify-between items-center p-4 border border-green-900/30 bg-gray-950 rounded hover:border-green-500/30">
              <div className="flex-1 mr-4">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs bg-green-950 text-green-500 px-2 py-0.5 rounded border border-green-900">{entry.currentStatus}</span>
                  <span className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-400 truncate max-w-lg">{entry.content}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleEdit(entry)} className="text-yellow-500 text-sm border border-yellow-900/50 px-3 py-1 bg-yellow-950/20 rounded">[ EDIT ]</button>
                <button onClick={() => handleDelete(entry._id)} className="text-red-500 text-sm border border-red-900/50 px-3 py-1 bg-red-950/20 rounded">[ DELETE ]</button>
              </div>
            </div>
          ))}
          {entries.length === 0 && <p className="text-gray-600 text-sm">No entries found.</p>}
        </div>
      </div>
    </div>
  );
}