"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../../components/navbar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BlogPost() {
  const { slug } = useParams(); // Grabs the slug from the URL
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSingleBlog = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blogs/${slug}`);
        if (!res.ok) throw new Error("SYSTEM_LOG_NOT_FOUND");
        const data = await res.json();
        setBlog(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSingleBlog();
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-950 text-green-400 font-mono pb-20">
      <Navbar />
      
      <main className="max-w-3xl mx-auto px-6 pt-20">
        <button 
          onClick={() => router.push('/blogs')}
          className="text-sm text-gray-500 hover:text-green-400 mb-8 transition-colors flex items-center gap-2"
        >
          &lt; RETURN_TO_LOGS
        </button>

        {isLoading && <p className="animate-pulse">DECRYPTING_LOG_CONTENTS...</p>}
        {error && <p className="text-red-500 bg-red-950/20 p-4 border border-red-900 rounded">[ERROR]: {error}</p>}

        {!isLoading && blog && (
          <article className="animate-fade-in">
            <header className="mb-10 border-b border-green-900/50 pb-6">
              {blog.coverImageUrl && (
                <img
                  src={blog.coverImageUrl}
                  alt={blog.title}
                  className="w-full max-h-[420px] object-cover rounded-lg mb-6 border border-green-900/40"
                />
              )}
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {blog.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-green-600">
                <span className="border border-green-900 px-2 py-1 rounded bg-green-950/30">
                  {new Date(blog.createdAt).toLocaleDateString()}
                </span>
                <span className="border border-green-900 px-2 py-1 rounded bg-green-950/30">
                  {blog.readTime} MIN_READ
                </span>
                <div className="flex gap-2 ml-auto">
                  {blog.tags?.map((tag, i) => (
                    <span key={i} className="text-green-800">#{tag}</span>
                  ))}
                </div>
              </div>
            </header>

            <div className="prose prose-invert prose-green max-w-none text-gray-300 leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{blog.content || ""}</ReactMarkdown>
            </div>
          </article>
        )}
      </main>
    </div>
  );
}