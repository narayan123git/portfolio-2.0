"use client"; // Tells Next.js this component runs in the browser

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // 1. Send credentials to your secure Node.js backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // 2. Success! Save the VIP Pass (JWT) securely in the browser
        localStorage.setItem("adminToken", data.token);
        
        // 3. Redirect to the secure dashboard (we will build this next)
        router.push("/admin/dashboard");
      } else {
        // Handle incorrect passwords or blocked IPs
        setError(data.message || "Access Denied.");
      }
    } catch (err) {
      setError("Server connection failed. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-950 text-green-400 font-mono">
      <div className="w-full max-w-md p-8 border border-green-500/30 bg-gray-900 rounded-lg shadow-2xl shadow-green-900/20">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-widest">SYSTEM_AUTH</h1>
          <p className="text-xs text-green-600 mt-2">Enter master credentials</p>
        </div>

        {error && (
          <div className="mb-4 p-3 border border-red-500 bg-red-950/50 text-red-500 text-sm rounded">
            [ERROR]: {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm mb-2 text-green-600">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-950 border border-green-800 rounded p-3 text-green-400 focus:outline-none focus:border-green-400 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-green-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-950 border border-green-800 rounded p-3 text-green-400 focus:outline-none focus:border-green-400 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-900/50 hover:bg-green-800 border border-green-500 text-green-400 font-bold py-3 px-4 rounded transition-all disabled:opacity-50"
          >
            {isLoading ? "AUTHENTICATING..." : "INITIATE_LOGIN"}
          </button>
        </form>
      </div>
    </main>
  );
}