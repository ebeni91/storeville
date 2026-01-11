"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { getBaseUrl } from "../../lib/api";
import Link from "next/link";
import { LogIn, ArrowRight, Store } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${getBaseUrl()}/api/users/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.non_field_errors || "Login failed");
      login(data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // 👇 No background here, just layout centering
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Glass Card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/90 text-white mb-6 shadow-lg shadow-indigo-500/30 transform -rotate-6 backdrop-blur-md">
              <Store size={28} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 mt-2">Sign in to manage your digital empire</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-700 text-sm font-medium border border-red-500/20 flex items-center gap-2 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600"/> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-slate-900 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 backdrop-blur-sm"
                placeholder="Ex. shopowner"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-sm font-semibold text-slate-700">Password</label>
              </div>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-slate-900 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 backdrop-blur-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full text-lg bg-indigo-600/90 hover:bg-indigo-700/90 backdrop-blur-md shadow-indigo-500/20">
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && <ArrowRight size={20} />}
            </button>
          </form>
        </div>
        <div className="px-8 py-6 bg-white/5 border-t border-white/10 text-center backdrop-blur-sm">
          <p className="text-slate-600 text-sm">
            New to StoreVille?{" "}
            <Link href="/register" className="text-indigo-600 font-bold hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}