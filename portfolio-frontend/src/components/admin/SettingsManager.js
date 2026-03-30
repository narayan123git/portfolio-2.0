'use client';

import { useState, useEffect } from 'react';

export default function SettingsManager() {
  const [settings, setSettings] = useState({
    resumeUrl: '',
    heroText: '',
    primaryColor: '#3b82f6',
    isHiring: true,
    currentStatus: '',
    profileImageUrl: '',
    homeVideoUrl: '',
    showHomeVideo: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [homeVideo, setHomeVideo] = useState(null);

  const fetchSettings = async () => {
    try {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
      const settingsUrl = apiBase.endsWith('/api') ? `${apiBase}/settings` : `${apiBase}/api/settings`;
      const res = await fetch(settingsUrl, { headers: { Accept: 'application/json' } });
      if (!res.ok) {
        throw new Error(`Settings request failed with status ${res.status}`);
      }
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Settings endpoint did not return JSON');
      }
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
      let profileImageUrl = settings.profileImageUrl || '';
      let homeVideoUrl = settings.homeVideoUrl || '';

      if (profileImage) {
        const imageForm = new FormData();
        imageForm.append('image', profileImage);
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
          method: 'POST',
          credentials: 'include',
          body: imageForm,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.message || 'Profile image upload failed');
        }
        profileImageUrl = uploadData.imageUrl;
      }

      if (homeVideo) {
        const videoForm = new FormData();
        videoForm.append('video', homeVideo);
        const uploadVideoRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/video`, {
          method: 'POST',
          credentials: 'include',
          body: videoForm,
        });
        const uploadVideoData = await uploadVideoRes.json();
        if (!uploadVideoRes.ok) {
          throw new Error(uploadVideoData.message || 'Home video upload failed');
        }
        homeVideoUrl = uploadVideoData.videoUrl;
      }

      const apiBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
      const settingsUrl = apiBase.endsWith('/api') ? `${apiBase}/settings` : `${apiBase}/api/settings`;
      const res = await fetch(settingsUrl, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...settings,
          profileImageUrl,
          homeVideoUrl,
        })
      });
      const data = await res.json();
      if (!data.success) {
        alert('Failed to save settings');
      } else {
        setSettings(data.data);
        setProfileImage(null);
        setHomeVideo(null);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(error.message || 'Failed to save settings');
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

        <div className="border border-gray-700 rounded p-4 bg-gray-900/40 space-y-4">
          <p className="text-sm font-medium text-gray-200">Home Media</p>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Profile Photo (Cloudinary image)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
            />
            {settings.profileImageUrl && (
              <p className="text-xs text-gray-400 mt-2 break-all">Current: {settings.profileImageUrl}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Home Intro Video (Cloudinary video)</label>
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime,video/x-m4v"
              onChange={(e) => setHomeVideo(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
            />
            {settings.homeVideoUrl && (
              <p className="text-xs text-gray-400 mt-2 break-all">Current: {settings.homeVideoUrl}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showHomeVideo"
              name="showHomeVideo"
              checked={Boolean(settings.showHomeVideo)}
              onChange={handleChange}
              className="w-4 h-4 text-green-600 bg-gray-800 border-gray-700 rounded"
            />
            <label htmlFor="showHomeVideo" className="text-sm font-medium text-gray-300 cursor-pointer">
              Show video on Home page
            </label>
          </div>
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