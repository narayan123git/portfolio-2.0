"use client";

import { useState, useEffect } from "react";

export default function SecurityManager() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState({ message: "", type: "" });

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/security`, {
        credentials: "include"
      });
      if (res.ok) {
        setLogs(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch security logs");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("WARNING: Delete this security log?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/security/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) fetchLogs();
    } catch (err) {
      console.error("Delete failed");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to PURGE ALL security logs? This cannot be undone.")) return;
    
    setStatus({ message: "PURGING_SYSTEM_LOGS...", type: "info" });
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/security`, {
        method: "DELETE",
        credentials: "include"
      });
      
      if (res.ok) {
        setStatus({ message: "ALL_LOGS_PURGED", type: "success" });
        fetchLogs();
        setTimeout(() => setStatus({ message: "", type: "" }), 3000);
      } else {
        throw new Error("Purge failed");
      }
    } catch (err) {
      setStatus({ message: "[ERROR]: PURGE_FAILED", type: "error" });
    }
  };

  // Helper to color-code different threat levels
  const getEventStyle = (type) => {
    switch(type) {
      case 'HONEYPOT_TRIGGER': return 'text-yellow-500 border-yellow-900/50 bg-yellow-950/20';
      case 'FAILED_LOGIN': return 'text-red-500 border-red-900/50 bg-red-950/20';
      case 'UNAUTHORIZED_ACCESS': return 'text-orange-500 border-orange-900/50 bg-orange-950/20';
      case 'RATE_LIMIT_EXCEEDED': return 'text-blue-500 border-blue-900/50 bg-blue-950/20';
      default: return 'text-green-500 border-green-900/50 bg-green-950/20';
    }
  };

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between border-b border-green-900/50 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white">SYSTEM_THREAT_MONITOR</h3>
          <p className="text-xs text-green-600 mt-1">Monitoring unauthorized access and automated attacks.</p>
        </div>
        <div className="flex items-center gap-4">
          {status.message && <span className={`text-sm ${status.type === "error" ? "text-red-500" : status.type === "success" ? "text-green-500" : "text-yellow-500 animate-pulse"}`}>{status.message}</span>}
          {logs.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="bg-red-950/40 hover:bg-red-900 border border-red-500 text-red-400 text-xs font-bold py-2 px-4 rounded transition-all"
            >
              PURGE_ALL_LOGS
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <p className="animate-pulse text-green-500">SCANNING_SECURITY_DATABASE...</p>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log._id} className="flex flex-col md:flex-row md:justify-between md:items-center p-4 border border-green-900/30 bg-gray-950 rounded hover:border-green-500/30 transition-colors gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${getEventStyle(log.eventType)} font-bold`}>
                    {log.eventType}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
                  <p><strong className="text-green-600">IP:</strong> {log.ipAddress}</p>
                  <p><strong className="text-green-600">Details:</strong> {log.details}</p>
                  <p className="md:col-span-2 text-xs truncate" title={log.userAgent}>
                    <strong className="text-green-600">Agent:</strong> {log.userAgent}
                  </p>
                </div>
              </div>
              <div>
                <button onClick={() => handleDelete(log._id)} className="text-red-500 hover:text-red-400 text-sm border border-red-900/50 px-3 py-1 bg-red-950/20 rounded w-full md:w-auto mt-2 md:mt-0">
                  [ DELETE ]
                </button>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-10 border border-green-900/30 bg-green-950/10 rounded">
              <p className="text-green-500 font-bold">SYSTEM_SECURE</p>
              <p className="text-gray-500 text-sm">No security threats detected.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}