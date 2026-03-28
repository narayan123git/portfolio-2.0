'use client';

import { useState, useEffect } from 'react';

export default function SettingsManager() {
  const [settings, setSettings] = useState({
    resumeUrl: '',
    heroText: '',
    primaryColor: '#3b82f6',
    isHiring: true,
    currentStatus: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`);
      const data = await res.json();
      if (data.success && data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (!data.success) {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) return <p className="text-green-500 animate-pulse">Loading settings...</p>;

  return (
    <div>
      <h2 className="text-2xl text-white mb-6">Universal Settings</h2>
      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Resume PDF URL</label>
          <input 
            type="text" 
            name="resumeUrl" 
            value={settings.resumeUrl || ''} 
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
            placeholder="e.g. https://link-to-drive.com/resume.pdf"
          />
        </div>

        <div>          <label className="block text-sm font-medium text-gray-300 mb-1">GitHub URL</label>
          <input 
            type="text" 
            name="githubUrl" 
            value={settings.githubUrl || ''} 
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">LinkedIn URL</label>
          <input 
            type="text" 
            name="linkedinUrl" 
            value={settings.linkedinUrl || ''} 
            onChange={handleChange}
            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-white"
          />
        </div>

        <div>          <label className="block text-sm font-medium text-gray-300 mb-1">Hero Text</label>
          <input 
            type="text" 
            name="heroText" 
            value={settings.heroText || ''} 
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
            placeholder="e.g. Full Stack Developer & Designer"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Current Status Badge</label>
          <input 
            type="text" 
            name="currentStatus" 
            value={settings.currentStatus || ''} 
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
            placeholder="e.g. Learning Next.js / Actively Looking"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-300 mb-1">Primary Brand Color</label>
            <div className="flex items-center space-x-2">
              <input 
                type="color" 
                name="primaryColor" 
                value={settings.primaryColor || '#3b82f6'} 
                onChange={handleChange}
                className="w-10 h-10 bg-transparent border-0 p-0 rounded cursor-pointer"
              />
              <span className="text-gray-400 font-mono text-sm">{settings.primaryColor}</span>
            </div>
          </div>

          <div className="flex-1 flex items-center space-x-2 pt-6">
            <input 
              type="checkbox" 
              id="isHiring" 
              name="isHiring" 
              checked={settings.isHiring || false} 
              onChange={handleChange}
              className="w-4 h-4 text-green-600 bg-gray-800 border-gray-700 rounded"
            />
            <label htmlFor="isHiring" className="text-sm font-medium text-gray-300 cursor-pointer">
              Currently Available for Hire
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </form>
    </div>
  );
}