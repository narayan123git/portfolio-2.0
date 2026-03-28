"use client";

import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import Link from "next/link"

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs`);
        const data = await res.json();
        setBlogs(data);
      } catch (err) {
        console.error("Failed to fetch blogs");
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-green-400 font-mono pb-20">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 pt-20">
        <header className="mb-16 border-b border-green-900/50 pb-6">
          <h1 className="text-4xl font-bold text-white tracking-widest">/BLOGS</h1>
          <p className="text-sm text-green-600 mt-2">&gt; Accessing technical logs and write-ups...</p>
        </header>

        {isLoading ? (
          <p className="animate-pulse">FETCHING_LOGS...</p>
        ) : (
          <div className="space-y-8">
            {blogs.map((blog) => (
              <article key={blog._id} className="border border-green-900/50 bg-gray-900/30 p-6 hover:border-green-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-white">{blog.title}</h2>
                  <span className="text-xs text-green-600 border border-green-900 px-2 py-1 rounded">{blog.readTime} min read</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  <span className="text-green-500 font-bold">AI_SUMMARY: </span> 
                  {blog.aiSummary}
                </p>
                <div className="flex gap-2 mb-4">
                  {blog.tags?.map((tag, i) => (
                    <span key={i} className="text-xs text-green-800 bg-green-950 px-2 py-1">#{tag}</span>
                  ))}
                </div>
                <Link 
                  href={`/blogs/${blog.slug}`}
                  className="text-sm text-green-400 hover:text-white transition-colors border-b border-transparent hover:border-white inline-block mt-4"
                >
                  [ READ_FULL_LOG ]
                </Link>
              </article>
            ))}
            {blogs.length === 0 && <p className="text-gray-500">No logs found.</p>}
          </div>
        )}
      </main>
    </div>
  );
}