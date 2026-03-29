"use client"; // Tells Next.js this component runs in the browser

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [resetKey, setResetKey] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetStep, setResetStep] = useState("request");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Send credentials to your secure Node.js backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Login creates an httpOnly cookie; no token is exposed to JS.
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (resetStep === "request") {
      if (!username || !resetKey) {
        setError("Username and reset key are required.");
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password/request-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username, resetKey }),
        });

        const data = await res.json();

        if (!res.ok || !data.resetToken) {
          setError(data.message || "Failed to request reset token.");
        } else {
          setResetToken(data.resetToken);
          setResetStep("reset");
          setSuccess("Reset token issued. Set your new password now.");
        }
      } catch (err) {
        setError("Server connection failed. Is the backend running?");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, newPassword, resetToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Reset failed.");
      } else {
        setSuccess(data.message || "Password reset successful.");
        setForgotMode(false);
        setResetStep("request");
        setPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setResetKey("");
        setResetToken("");
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

        {success && (
          <div className="mb-4 p-3 border border-green-500 bg-green-950/40 text-green-300 text-sm rounded">
            [SUCCESS]: {success}
          </div>
        )}

        {!forgotMode ? (
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

            <button
              type="button"
              onClick={() => {
                setForgotMode(true);
                setResetStep("request");
                setError("");
                setSuccess("");
              }}
              className="w-full text-sm text-green-500 hover:text-green-300 transition-colors"
            >
              FORGOT_PASSWORD?
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            {resetStep === "request" ? (
              <>
                <p className="text-xs text-green-600">Step 1: Request a one-time reset token using your server reset key.</p>

                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-950 border border-green-800 rounded p-3 text-green-400 focus:outline-none focus:border-green-400 transition-colors"
                  required
                />

                <input
                  type="password"
                  placeholder="Server Reset Key"
                  value={resetKey}
                  onChange={(e) => setResetKey(e.target.value)}
                  className="w-full bg-gray-950 border border-green-800 rounded p-3 text-green-400 focus:outline-none focus:border-green-400 transition-colors"
                  required
                />
              </>
            ) : (
              <>
                <p className="text-xs text-green-600">Step 2: Token received. Set your new password now.</p>

                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-gray-950 border border-green-800 rounded p-3 text-green-400 focus:outline-none focus:border-green-400 transition-colors"
                  required
                />

                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-950 border border-green-800 rounded p-3 text-green-400 focus:outline-none focus:border-green-400 transition-colors"
                  required
                />
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-900/50 hover:bg-green-800 border border-green-500 text-green-400 font-bold py-3 px-4 rounded transition-all disabled:opacity-50"
            >
              {isLoading
                ? (resetStep === "request" ? "REQUESTING_TOKEN..." : "RESETTING...")
                : (resetStep === "request" ? "REQUEST_RESET_TOKEN" : "RESET_PASSWORD")}
            </button>

            {resetStep === "reset" && (
              <button
                type="button"
                onClick={() => {
                  setResetStep("request");
                  setResetToken("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError("");
                  setSuccess("");
                }}
                className="w-full text-sm text-green-500 hover:text-green-300 transition-colors"
              >
                REQUEST_NEW_TOKEN
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setResetStep("request");
                setResetToken("");
                setError("");
              }}
              className="w-full text-sm text-gray-400 hover:text-white transition-colors"
            >
              BACK_TO_LOGIN
            </button>
          </form>
        )}
      </div>
    </main>
  );
}