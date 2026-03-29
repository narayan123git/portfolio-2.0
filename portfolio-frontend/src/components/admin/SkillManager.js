'use client';

import { useState, useEffect } from 'react';

const initialFormState = { name: '', category: 'Frontend', percentage: 50, icon: '', details: '' };

export default function SkillManager() {
  const [skills, setSkills] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSkills = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills`);
      const data = await res.json();
      if (data.success) setSkills(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchSkills(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId 
      ? `${process.env.NEXT_PUBLIC_API_URL}/skills/${editingId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/skills`;

    try {
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          details: formData.category === 'Other' ? formData.details : ''
        })
      });
      if (res.ok) {
        setFormData(initialFormState);
        setEditingId(null);
        fetchSkills();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (skill) => {
    setFormData({
      name: skill.name,
      category: skill.category,
      percentage: skill.percentage,
      icon: skill.icon,
      details: skill.details || ''
    });
    setEditingId(skill._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this skill?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/skills/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) fetchSkills();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl text-white mb-6">Skills Manager</h2>
      
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-8 space-y-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Skill Name (e.g. React.js)" required 
            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full" />
          
          <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full">
            <option>Frontend</option>
            <option>Backend</option>
            <option>Database</option>
            <option>Cloud / DevOps</option>
            <option>Tools</option>
            <option>Other</option>
          </select>
          
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 w-24">Level: {formData.percentage}%</span>
            <input type="range" min="0" max="100" 
              value={formData.percentage} onChange={(e) => setFormData({...formData, percentage: Number(e.target.value)})}
              className="w-full accent-green-500" />
          </div>

          <input type="text" placeholder="Icon Class (e.g. FaReact or URL)" 
            value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})}
            className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full" />
        </div>

        {formData.category === 'Other' && (
          <textarea
            placeholder="Describe this custom skill in detail (tools, domains, or specific expertise)."
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            rows={4}
            className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full"
            required
          />
        )}
        
        <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded">
          {loading ? 'Saving...' : (editingId ? 'Update Skill' : 'Add New Skill')}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setFormData(initialFormState); }} 
            className="w-full mt-2 text-gray-400 hover:text-white">Cancel Edit</button>
        )}
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map(skill => (
          <div key={skill._id} className="p-4 bg-gray-900 border border-green-900/50 rounded flex justify-between items-center">
            <div>
              <p className="font-bold text-green-400">{skill.name}</p>
              <p className="text-xs text-gray-500">{skill.category} • {skill.percentage}%</p>
              {skill.details && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{skill.details}</p>
              )}
            </div>
            <div className="space-x-2">
              <button onClick={() => handleEdit(skill)} className="text-blue-400 hover:text-blue-300">[EDIT]</button>
              <button onClick={() => handleDelete(skill._id)} className="text-red-500 hover:text-red-400">[DEL]</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}