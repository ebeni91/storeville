"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBaseUrl } from "../../lib/api";
import Link from "next/link";
import { UserPlus, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch(`${getBaseUrl()}/api/users/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(JSON.stringify(data));
      }
      router.push("/login");
    } catch (err: any) {
      setError("Registration failed. Username may be taken.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Glass Card */}
      <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100/50 text-indigo-600 mb-6 backdrop-blur-md border border-indigo-200/30">
              <Sparkles size={28} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Join StoreVille</h1>
            <p className="text-slate-500 mt-2">Start your e-commerce journey today</p>
          </div>

          {error && (
             <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-600 text-sm font-medium border border-red-500/20 backdrop-blur-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-slate-900 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 backdrop-blur-sm"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email (Optional)</label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-slate-900 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 backdrop-blur-sm"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-slate-900 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 backdrop-blur-sm"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full text-lg bg-indigo-600/90 hover:bg-indigo-700/90 backdrop-blur-md shadow-indigo-500/20">
              {isLoading ? "Creating Account..." : "Create Account"}
              {!isLoading && <UserPlus size={20} />}
            </button>
          </form>
        </div>
        <div className="px-8 py-6 bg-white/5 border-t border-white/10 text-center backdrop-blur-sm">
          <p className="text-slate-600 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-bold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}