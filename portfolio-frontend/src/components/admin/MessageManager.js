'use client';

import { useState, useEffect } from 'react';

const RENDER_COLD_START_MESSAGE =
  'Server is waking up after inactivity. Please wait, this can take up to 50 seconds on free hosting.';
const REQUEST_TIMEOUT_MS = 65000;
const SLOW_NOTICE_MS = 4000;

export default function MessageManager() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadInfo, setLoadInfo] = useState('');

  const fetchMessages = async () => {
    const controller = new AbortController();
    const requestTimeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const slowNoticeTimeout = setTimeout(() => {
      setLoadInfo(RENDER_COLD_START_MESSAGE);
    }, SLOW_NOTICE_MS);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        credentials: 'include',
        signal: controller.signal,
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      if (error.name === 'AbortError') {
        setLoadInfo('Server wake-up is taking longer than expected. Please refresh in a moment.');
      }
    } finally {
      clearTimeout(requestTimeout);
      clearTimeout(slowNoticeTimeout);
      setLoading(false);
    }
  };

  const deleteMessage = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setMessages(messages.filter(m => m._id !== id));
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  if (loading) {
    return (
      <div>
        <p className="text-green-500 animate-pulse">Fetching messages...</p>
        {loadInfo && <p className="mt-2 text-blue-300 text-sm">{loadInfo}</p>}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl text-white mb-4">Inbox</h2>
      {messages.length === 0 ? (
        <p className="text-gray-400">No messages yet.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg._id} className="p-4 bg-gray-800 rounded border border-gray-700">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg text-white font-bold">{msg.name}</h3>
                  <a href={`mailto:${msg.email}`} className="text-blue-400 text-sm hover:underline">{msg.email}</a>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 mb-2">{new Date(msg.createdAt).toLocaleString()}</p>
                  <button 
                    onClick={() => deleteMessage(msg._id)}
                    className="text-red-500 text-xs hover:text-red-400 border border-red-900/50 px-2 py-1 bg-red-950/20 rounded"
                  >
                    [ DELETE ]
                  </button>
                </div>
              </div>
              <p className="text-gray-300 mt-2 whitespace-pre-wrap">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}