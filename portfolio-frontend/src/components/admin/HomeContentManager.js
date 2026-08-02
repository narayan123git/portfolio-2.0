'use client';

import { useEffect, useState } from 'react';

const defaultSection = () => ({
  title: '',
  eyebrow: '',
  body: '',
  accent: 'orange',
});

const defaultHomeSections = () => ([
  {
    title: 'My Journey So Far',
    eyebrow: '~/from_curiosity_to_building',
    body: 'I did not get into computer science because it was trendy. I got into it because I genuinely enjoyed solving problems.\n\nEarly on, I was naturally drawn to mathematics and logical thinking. That curiosity translated into consistent academics - around 96% in Class 10, strong performance in Class 12, and then JEE Main.\n\nAt NIT Durgapur (CSE), my focus shifted from just scoring to truly understanding and building. Maintaining a CGPA around 9.4 matters to me, but what matters more is how I used my time outside the classroom.',
    accent: 'orange',
  },
  {
    title: 'How I Learn',
    eyebrow: '~/how_i_learn',
    body: 'I have always seen myself as a builder. During my early phase, I explored web development and built a full-stack MERN project where I handled backend logic, real-time features, and system design decisions.\n\nI have solved 250+ DSA problems, not for numbers, but to train clear thinking under constraints and to stay patient when solutions do not come quickly.\n\nRecently, I have been exploring Machine Learning and Deep Learning through structured learning and hands-on experimentation, especially in computer vision and meaningful applications like healthcare.\n\nOutside coding, I enjoy chess and creative downtime. Both help me reset and improve how I think about complex problems.',
    accent: 'blue',
  },
  {
    title: 'Growth Mindset',
    eyebrow: '~/steady_progress',
    body: 'Overall, I see myself as someone still evolving - not chasing shortcuts, but focusing on steady, meaningful growth. I am not only interested in learning technologies; I am interested in using them to build systems that are efficient, reliable, and impactful.',
    accent: 'slate',
  },
]);

const getApiBase = () => (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

export default function HomeContentManager() {
  const [settings, setSettings] = useState({ homeSections: defaultHomeSections() });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchSettings = async () => {
    try {
      const apiBase = getApiBase();
      const settingsUrl = apiBase.endsWith('/api') ? `${apiBase}/settings` : `${apiBase}/api/settings`;
      const res = await fetch(settingsUrl, { headers: { Accept: 'application/json' } });
      const data = await res.json();
      if (data.success && data.data) {
        setSettings({
          ...data.data,
          homeSections: Array.isArray(data.data.homeSections) && data.data.homeSections.length > 0 ? data.data.homeSections : defaultHomeSections(),
        });
      }
    } catch (error) {
      console.error('Error fetching home content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSectionChange = (index, field, value) => {
    setSettings((prev) => {
      const nextSections = [...(prev.homeSections || [])];
      nextSections[index] = { ...nextSections[index], [field]: value };
      return { ...prev, homeSections: nextSections };
    });
  };

  const addSection = () => {
    setSettings((prev) => ({
      ...prev,
      homeSections: [...(prev.homeSections || []), defaultSection()],
    }));
  };

  const removeSection = (index) => {
    setSettings((prev) => ({
      ...prev,
      homeSections: prev.homeSections.filter((_, sectionIndex) => sectionIndex !== index),
    }));
  };

  const moveSection = (index, direction) => {
    setSettings((prev) => {
      const nextSections = [...(prev.homeSections || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= nextSections.length) return prev;
      [nextSections[index], nextSections[targetIndex]] = [nextSections[targetIndex], nextSections[index]];
      return { ...prev, homeSections: nextSections };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const apiBase = getApiBase();
      const settingsUrl = apiBase.endsWith('/api') ? `${apiBase}/settings` : `${apiBase}/api/settings`;
      const res = await fetch(settingsUrl, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!data.success) {
        setMessage('Failed to save home sections');
      } else {
        setSettings({
          ...data.data,
          homeSections: Array.isArray(data.data.homeSections) && data.data.homeSections.length > 0 ? data.data.homeSections : defaultHomeSections(),
        });
        setMessage('Home sections saved');
      }
    } catch (error) {
      console.error('Error saving home content:', error);
      setMessage(error.message || 'Failed to save home sections');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-green-500 animate-pulse">Loading home content...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl text-white">Home Content</h2>
          <p className="text-sm text-gray-400 mt-1">Manage the paragraph sections shown on the homepage.</p>
        </div>
        {message && <span className="text-sm text-green-400">{message}</span>}
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {(settings.homeSections || []).map((section, index) => (
          <div key={`${section.title || 'section'}-${index}`} className="border border-gray-700 rounded-lg p-4 bg-gray-900/40 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">Section {index + 1}</h3>
              <div className="flex gap-2">
                <button type="button" onClick={() => moveSection(index, 'up')} className="text-xs text-gray-300 border border-gray-700 px-2 py-1 rounded">Up</button>
                <button type="button" onClick={() => moveSection(index, 'down')} className="text-xs text-gray-300 border border-gray-700 px-2 py-1 rounded">Down</button>
                <button type="button" onClick={() => removeSection(index)} className="text-xs text-red-300 border border-red-800 px-2 py-1 rounded">Remove</button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                type="text"
                value={section.eyebrow || ''}
                onChange={(e) => handleSectionChange(index, 'eyebrow', e.target.value)}
                placeholder="Eyebrow / terminal label"
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
              />
              <select
                value={section.accent || 'orange'}
                onChange={(e) => handleSectionChange(index, 'accent', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
              >
                <option value="orange">Orange</option>
                <option value="blue">Blue</option>
                <option value="slate">Slate</option>
                <option value="green">Green</option>
              </select>
              <input
                type="text"
                value={section.title || ''}
                onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                placeholder="Section title"
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white md:col-span-2"
              />
            </div>

            <textarea
              value={section.body || ''}
              onChange={(e) => handleSectionChange(index, 'body', e.target.value)}
              rows="6"
              className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
              placeholder="Write the section paragraph(s). Separate paragraphs with blank lines."
            />
          </div>
        ))}

        <div className="flex items-center gap-3">
          <button type="button" onClick={addSection} className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white px-4 py-2 rounded transition-colors">
            Add Section
          </button>
          <button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded transition-colors">
            {saving ? 'Saving...' : 'Save Home Content'}
          </button>
        </div>
      </form>
    </div>
  );
}