'use client';

import { useEffect, useState } from 'react';

const getApiBase = () => (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export default function ExperienceManager() {
  const [experienceList, setExperienceList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    responsibilities: '',
    techStack: '',
    order: 0,
  });

  const fetchExperience = async () => {
    try {
      const res = await fetch(`${getApiBase()}/experience`);
      const data = await res.json();
      if (data.success) {
        setExperienceList(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch experience records', error);
    }
  };

  useEffect(() => {
    fetchExperience();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      responsibilities: '',
      techStack: '',
      order: 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const techStack = typeof formData.techStack === 'string'
        ? formData.techStack.split(',').map((tech) => tech.trim()).filter(Boolean)
        : formData.techStack;

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `${getApiBase()}/experience/${editingId}`
        : `${getApiBase()}/experience`;

      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, techStack, order: Number(formData.order) || 0 }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to save experience record');
      }

      resetForm();
      fetchExperience();
      setStatus({ type: 'success', message: editingId ? 'Experience updated' : 'Experience added' });
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: error.message || 'Failed to save experience record' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      company: item.company || '',
      role: item.role || '',
      location: item.location || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      isCurrent: Boolean(item.isCurrent),
      description: item.description || '',
      responsibilities: item.responsibilities || '',
      techStack: Array.isArray(item.techStack) ? item.techStack.join(', ') : '',
        order: item.order ?? 0,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this experience record?')) return;

    try {
      const res = await fetch(`${getApiBase()}/experience/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        fetchExperience();
        setStatus({ type: 'success', message: 'Experience deleted' });
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: 'Delete failed' });
    }
  };

  return (
    <div>
      <h2 className="text-2xl text-white mb-6">Experience Manager</h2>

      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-8 space-y-4 border border-gray-700">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-white">{editingId ? 'EDIT_EXPERIENCE' : 'ADD_NEW_EXPERIENCE'}</h3>
          {status.message && <span className={`text-sm ${status.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{status.message}</span>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Company / Organization"
            required
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full"
          />
          <input
            type="text"
            placeholder="Role / Title"
            required
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full"
          />
          <input
            type="text"
            placeholder="Location (optional)"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full"
          />
          <input
            type="text"
            placeholder="Start Date (e.g. Jun 2025)"
            required
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full"
          />
          <input
            type="text"
            placeholder="End Date (optional)"
            disabled={formData.isCurrent}
            name="endDate"
            value={formData.isCurrent ? 'Present' : formData.endDate}
            onChange={handleChange}
            className={`p-2 bg-gray-900 border border-gray-700 rounded text-white w-full ${formData.isCurrent ? 'opacity-50' : ''}`}
          />
          <label className="flex items-center text-sm text-gray-300 space-x-2 cursor-pointer p-2 bg-gray-900 border border-gray-700 rounded">
            <input
              type="checkbox"
              name="isCurrent"
              checked={formData.isCurrent}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <span>Current Role</span>
          </label>
          <input
            type="text"
            placeholder="Tech stack (comma separated)"
            name="techStack"
            value={formData.techStack}
            onChange={handleChange}
            className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full md:col-span-2"
          />
          <input
            type="number"
            placeholder="Display Order"
            name="order"
            value={formData.order}
            onChange={handleChange}
            className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full md:col-span-2"
          />
        </div>

        <textarea
          placeholder="Short description"
          rows="3"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full"
        ></textarea>

        <textarea
          placeholder="Responsibilities / impact"
          rows="3"
          name="responsibilities"
          value={formData.responsibilities}
          onChange={handleChange}
          className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full"
        ></textarea>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded">
          {loading ? 'Saving...' : (editingId ? 'Update Experience' : 'Add Experience')}
        </button>

        {editingId && (
          <button type="button" onClick={resetForm} className="w-full mt-2 text-gray-400 hover:text-white">
            Cancel Edit
          </button>
        )}
      </form>

      <div className="space-y-4">
        {experienceList.map((item) => (
          <div key={item._id} className="p-4 bg-gray-900 border border-blue-900/50 rounded flex justify-between items-start gap-4">
            <div>
              <h3 className="font-bold text-blue-400 text-lg">{item.role}</h3>
              <p className="text-gray-300">{item.company}</p>
              {item.location && <p className="text-xs text-gray-500">{item.location}</p>}
              <p className="text-xs text-slate-400 mt-1">Order: {item.order ?? 0}</p>
              <p className="text-xs text-gray-500 mt-1">{item.startDate} — {item.isCurrent ? 'Present' : item.endDate}</p>
              {item.description && <p className="text-sm text-gray-400 mt-2 whitespace-pre-wrap">{item.description}</p>}
              {item.responsibilities && <p className="text-sm text-blue-200/80 mt-2 whitespace-pre-wrap">{item.responsibilities}</p>}
              {Array.isArray(item.techStack) && item.techStack.length > 0 && (
                <p className="text-xs text-emerald-300 mt-2">Tech: {item.techStack.join(', ')}</p>
              )}
            </div>
            <div className="space-x-2 flex-shrink-0">
              <button onClick={() => handleEdit(item)} className="text-gray-400 hover:text-white">[EDIT]</button>
              <button onClick={() => handleDelete(item._id)} className="text-red-500 hover:text-red-400">[DEL]</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}