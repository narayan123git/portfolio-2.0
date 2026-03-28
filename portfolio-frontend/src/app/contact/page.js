'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    _honeypot: '', // This is the trapdoor field!
    captchaSum: ''
  });

  const [mathCaptcha, setMathCaptcha] = useState({ num1: 0, num2: 0, operator: '+', hash: '', expires: '' });
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const fetchCaptcha = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/captcha`);
      const data = await res.json();
      if (data.success) {
        setMathCaptcha(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch captcha");
    }
    setFormData(prev => ({ ...prev, captchaSum: '' }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');

    try {
      // Send the hash and user's answer to the server for secure validation
      const payload = {
        ...formData,
        captchaHash: mathCaptcha.hash,
        captchaExpires: mathCaptcha.expires
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success) {
        setStatus('Message sent successfully!');
        setFormData({ name: '', email: '', message: '', _honeypot: '', captchaSum: '' });
        fetchCaptcha(); // Reset captcha for new messages
      } else {
        setStatus(data.message || 'Something went wrong.');
      }
    } catch (error) {
      console.error(error);
      setStatus('Failed to send message. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Get In Touch
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              I'd love to hear from you. Drop me a line below!
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            
            {/* 🛡️ TRAPDOOR HONEYPOT FIELD - Hidden from users, visible to bots */}
            <div className="absolute left-[-9999px] top-[-9999px]" tabIndex="-1" aria-hidden="true">
              <label htmlFor="_honeypot">Don't fill this out if you're human:</label>
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
            {/* ------------------------------------------------------------- */}

            <div className="rounded-md shadow-sm -space-y-px">
              <div className="mb-4">
                <label htmlFor="name" className="sr-only">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <label htmlFor="message" className="sr-only">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows="4"
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            {/* 🤖 Dynamic Math Captcha! Extremely powerful against automated scripts */}
            <div className="flex items-center space-x-4 mb-4">
              <label htmlFor="captchaSum" className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Verify you are human: <span className="font-bold text-blue-600">{mathCaptcha.num1} {mathCaptcha.operator} {mathCaptcha.num2} = ?</span>
              </label>
              <input
                id="captchaSum"
                name="captchaSum"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                className="appearance-none block w-24 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Answer"
                value={formData.captchaSum}
                onChange={handleChange}
              />
            </div>

            {status && (
              <p className={`text-center text-sm ${status.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>
                {status}
              </p>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Send Message
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}