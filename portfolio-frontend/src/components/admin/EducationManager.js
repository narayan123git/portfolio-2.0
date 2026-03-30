'use client';

import { useState, useEffect } from 'react';

export default function EducationManager() {
  const [educationList, setEducationList] = useState([]);
  const [formData, setFormData] = useState({ 
    institution: '', location: '', degree: '', specialization: '', boardOrUniversity: '', score: '', startDate: '', endDate: '', description: '', activities: '', isCurrent: false 
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEducation = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/education`);
      const data = await res.json();
      if (data.success) setEducationList(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchEducation(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const method = editingId ? 'PUT' : 'POST';
    const url = editingId 
      ? `${process.env.NEXT_PUBLIC_API_URL}/education/${editingId}`
      : `${process.env.NEXT_PUBLIC_API_URL}/education`;

    try {
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setFormData({ institution: '', location: '', degree: '', specialization: '', boardOrUniversity: '', score: '', startDate: '', endDate: '', description: '', activities: '', isCurrent: false });
        setEditingId(null);
        fetchEducation();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (edu) => {
    setFormData({ 
      institution: edu.institution, 
      location: edu.location || '',
      degree: edu.degree, 
      specialization: edu.specialization || '',
      boardOrUniversity: edu.boardOrUniversity || '',
      score: edu.score || '',
      startDate: edu.startDate, 
      endDate: edu.endDate || '', 
      description: edu.description || '', 
      activities: edu.activities || '',
      isCurrent: edu.isCurrent 
    });
    setEditingId(edu._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this education record?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/education/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) fetchEducation();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 className="text-2xl text-white mb-6">Education & Timeline Manager</h2>
      
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-8 space-y-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Institution (e.g. NIT Durgapur)" required 
            value={formData.institution} onChange={(e) => setFormData({...formData, institution: e.target.value})}
            className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full" />

          <input type="text" placeholder="Location (e.g. Durgapur, India)"
            value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
            className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full" />
            
          <input type="text" placeholder="Degree / Role (e.g. B.Tech in CSE)" required 
            value={formData.degree} onChange={(e) => setFormData({...formData, degree: e.target.value})}
            className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full" />

          <input type="text" placeholder="Specialization (e.g. Computer Science)"
            value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})}
            className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full" />

          <input type="text" placeholder="Board / University"
            value={formData.boardOrUniversity} onChange={(e) => setFormData({...formData, boardOrUniversity: e.target.value})}
            className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full" />

          <input type="text" placeholder="Score / CGPA / Percentage"
            value={formData.score} onChange={(e) => setFormData({...formData, score: e.target.value})}
            className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full" />

          <input type="text" placeholder="Start Date (e.g. Aug 2019)" required 
            value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})}
            className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full" />
            
          <div className="flex space-x-2 items-center">
            <input type="text" placeholder="End Date (Optional)" disabled={formData.isCurrent}
              value={formData.isCurrent ? 'Present' : formData.endDate} 
              onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              className={`p-2 bg-gray-900 border border-gray-700 rounded text-white flex-1 ${formData.isCurrent ? 'opacity-50' : ''}`} />
            
            <label className="flex items-center text-sm text-gray-300 space-x-1 cursor-pointer">
              <input type="checkbox" checked={formData.isCurrent} 
                onChange={(e) => setFormData({...formData, isCurrent: e.target.checked})}
                className="w-4 h-4" />
              <span>Current</span>
            </label>
          </div>
        </div>

        <textarea placeholder="Description (Optional)" rows="3"
          value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full"></textarea>

        <textarea placeholder="Activities / Achievements (Optional)" rows="2"
          value={formData.activities} onChange={(e) => setFormData({...formData, activities: e.target.value})}
          className="p-2 bg-gray-900 border border-gray-700 rounded text-white w-full"></textarea>
        
        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded">
          {loading ? 'Saving...' : (editingId ? 'Update Record' : 'Add Record')}
        </button>
        {editingId && (
          <button type="button" onClick={() => { setEditingId(null); setFormData({institution:'', location:'', degree:'', specialization:'', boardOrUniversity:'', score:'', startDate:'', endDate:'', description:'', activities:'', isCurrent:false}); }} 
            className="w-full mt-2 text-gray-400 hover:text-white">Cancel Edit</button>
        )}
      </form>

      <div className="space-y-4">
        {educationList.map(edu => (
          <div key={edu._id} className="p-4 bg-gray-900 border border-blue-900/50 rounded flex justify-between items-start">
            <div>
              <h3 className="font-bold text-blue-400 text-lg">{edu.institution}</h3>
              {edu.location && <p className="text-xs text-gray-500">{edu.location}</p>}
              <p className="text-gray-300">{edu.degree}</p>
              {edu.specialization && <p className="text-xs text-gray-400">Specialization: {edu.specialization}</p>}
              {edu.boardOrUniversity && <p className="text-xs text-gray-400">Board/University: {edu.boardOrUniversity}</p>}
              {edu.score && <p className="text-xs text-emerald-300">Score: {edu.score}</p>}
              <p className="text-xs text-gray-500 mt-1">{edu.startDate} — {edu.isCurrent ? 'Present' : edu.endDate}</p>
              {edu.description && <p className="text-sm text-gray-400 mt-2 whitespace-pre-wrap">{edu.description}</p>}
              {edu.activities && <p className="text-sm text-blue-200/80 mt-2 whitespace-pre-wrap">Activities: {edu.activities}</p>}
            </div>
            <div className="space-x-2 flex-shrink-0">
              <button onClick={() => handleEdit(edu)} className="text-gray-400 hover:text-white">[EDIT]</button>
              <button onClick={() => handleDelete(edu._id)} className="text-red-500 hover:text-red-400">[DEL]</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}