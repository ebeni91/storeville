"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBaseUrl } from "../../lib/api";
import Link from "next/link";
import { UserPlus, ArrowRight, Sparkles } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50 via-slate-50 to-white">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 mb-6">
              <Sparkles size={28} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Join StoreVille</h1>
            <p className="text-slate-500 mt-2">Start your e-commerce journey today</p>
          </div>

          {error && (
             <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username</label>
              <input
                type="text"
                className="input-field"
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
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full text-lg">
              {isLoading ? "Creating Account..." : "Create Account"}
              {!isLoading && <UserPlus size={20} />}
            </button>
          </form>
        </div>
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 text-center">
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