'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';

const RENDER_COLD_START_MESSAGE =
  'Server is waking up after inactivity. Please wait, this can take up to 50 seconds on free hosting.';
const REQUEST_TIMEOUT_MS = 65000;
const SLOW_NOTICE_MS = 4000;

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    _honeypot: '',
    captchaText: ''
  });

  const [imageCaptcha, setImageCaptcha] = useState({ svg: '', hash: '', expires: '', token: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCaptcha = async () => {
    const controller = new AbortController();
    const requestTimeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const slowNoticeTimeout = setTimeout(() => {
      setStatus({ type: 'info', message: RENDER_COLD_START_MESSAGE });
    }, SLOW_NOTICE_MS);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/captcha`, {
        signal: controller.signal,
      });
      const data = await res.json();
      if (data.success) {
        setImageCaptcha(data.data);
        setStatus((prev) =>
          prev.type === 'info' && prev.message === RENDER_COLD_START_MESSAGE
            ? { type: '', message: '' }
            : prev
        );
      } else {
        setStatus({ type: 'error', message: 'Unable to load captcha. Please refresh the page.' });
      }
    } catch (err) {
      console.error('Failed to fetch captcha');
      if (err.name === 'AbortError') {
        setStatus({
          type: 'error',
          message: 'Server took too long to respond. Please try again in a moment.',
        });
      } else {
        setStatus({ type: 'error', message: 'Network error while loading captcha.' });
      }
    } finally {
      clearTimeout(requestTimeout);
      clearTimeout(slowNoticeTimeout);
    }

    setFormData((prev) => ({ ...prev, captchaText: '' }));
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: 'info', message: 'Submitting...' });

    const controller = new AbortController();
    const requestTimeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const slowNoticeTimeout = setTimeout(() => {
      setStatus({ type: 'info', message: RENDER_COLD_START_MESSAGE });
    }, SLOW_NOTICE_MS);

    try {
      const payload = {
        ...formData,
        captchaHash: imageCaptcha.hash,
        captchaExpires: imageCaptcha.expires,
        captchaToken: imageCaptcha.token
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setStatus({ type: 'success', message: data.message || 'Message sent successfully!' });
        setFormData({ name: '', email: '', subject: '', message: '', _honeypot: '', captchaText: '' });
        fetchCaptcha();
      } else {
        const serverMessage = data.message || 'Unable to send message. Please check your inputs and try again.';
        setStatus({ type: 'error', message: serverMessage });

        if (res.status === 400) {
          fetchCaptcha();
        }
      }
    } catch (error) {
      console.error(error);
      if (error.name === 'AbortError') {
        setStatus({
          type: 'error',
          message: 'Server is still waking up. Please wait a bit and try again.',
        });
      } else {
        setStatus({
          type: 'error',
          message: 'Failed to send message due to network/server issue. Please try again later.',
        });
      }
    } finally {
      clearTimeout(requestTimeout);
      clearTimeout(slowNoticeTimeout);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#1d4ed8_0%,#0f172a_38%,#020617_100%)] flex flex-col text-slate-100 pb-16">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full rounded-3xl border border-sky-300/20 bg-slate-900/70 p-8 sm:p-10 shadow-[0_24px_80px_rgba(2,132,199,0.18)] backdrop-blur-sm">
          <div className="mb-7">
            <h2 className="text-3xl sm:text-4xl font-semibold text-sky-100 tracking-tight">Let&apos;s Build Something Bold</h2>
            <p className="mt-2 text-sm text-slate-300">
              Send your idea, project brief, or collaboration note. I usually reply quickly.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="absolute left-[-9999px] top-[-9999px]" tabIndex="-1" aria-hidden="true">
              <label htmlFor="_honeypot">Don&apos;t fill this out if you&apos;re human:</label>
              <input
                type="text"
                name="_honeypot"
                id="_honeypot"
                tabIndex="-1"
                autoComplete="off"
                value={formData._honeypot}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                id="name"
                name="name"
                type="text"
                required
                className="w-full rounded-xl border border-slate-600 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-300"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-slate-600 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-300"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <input
              id="subject"
              name="subject"
              type="text"
              className="w-full rounded-xl border border-slate-600 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-300"
              placeholder="Subject (optional)"
              value={formData.subject}
              onChange={handleChange}
            />

            <textarea
              id="message"
              name="message"
              required
              rows="5"
              className="w-full rounded-xl border border-slate-600 bg-slate-950/70 px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-300"
              placeholder="Tell me about your idea..."
              value={formData.message}
              onChange={handleChange}
            ></textarea>

            <div className="rounded-2xl border border-slate-700 bg-slate-950/60 p-4">
              <label htmlFor="captchaText" className="block text-sm font-medium text-slate-200 mb-3">
                Verify you are human
              </label>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                <div
                  className="inline-flex border border-slate-600 rounded-lg px-3 py-2 bg-slate-900"
                  aria-label="captcha image"
                  dangerouslySetInnerHTML={{ __html: imageCaptcha.svg || '' }}
                />
                <button
                  type="button"
                  onClick={fetchCaptcha}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-500 text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Refresh CAPTCHA
                </button>
              </div>
              <input
                id="captchaText"
                name="captchaText"
                type="text"
                required
                className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-300"
                placeholder="Enter the text from the image"
                value={formData.captchaText}
                onChange={handleChange}
              />
            </div>

            {status.message && (
              <p className={`text-sm ${status.type === 'success' ? 'text-emerald-300' : status.type === 'info' ? 'text-sky-300' : 'text-rose-300'}`}>
                {status.message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl border border-sky-300/40 bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-semibold py-3 hover:brightness-110 transition-all disabled:opacity-70"
            >
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}