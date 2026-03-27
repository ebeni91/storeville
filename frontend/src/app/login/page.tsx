'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store as StoreIcon, Mail, Lock, Loader2, ArrowRight, Phone, ShieldCheck, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
  const [identifier, setIdentifier] = useState('') // Stores either the email or phone number
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Dynamically build the payload based on the selected method
      const payload = loginMethod === 'email' 
        ? { email: identifier, password }
        : { phone_number: identifier, password }

      // Hit our secure HttpOnly Cookie endpoint
      const response = await api.post('/accounts/login/', payload)
      
      const { access, user } = response.data
      login(user, access)
      
      // Route based on role
      if (user.role === 'SELLER') router.push('/dashboard/seller')
      else if (user.role === 'DRIVER') router.push('/dashboard/driver')
      else router.push('/') 

    } catch (err: any) {
      setError(err.response?.data?.detail || `Invalid ${loginMethod} or password.`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen w-full bg-white font-sans selection:bg-indigo-500 selection:text-white lg:h-screen lg:overflow-hidden">
      
      {/* LEFT PANEL - 40% Width with Soft Homepage Theme */}
      <div className="hidden lg:flex flex-col justify-between w-[40%] bg-gradient-to-br from-[#eef2ff] via-[#f3e8ff] to-[#cffafe] border-r border-indigo-100 p-14 relative overflow-hidden flex-shrink-0 animate-[gradient_15s_ease_infinite] bg-[length:200%_200%]">
        
        {/* Soft Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.2] mix-blend-overlay bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]"></div>
        
        {/* Decorative Background Icon */}
        <StoreIcon className="absolute -bottom-24 -left-20 w-[600px] h-[600px] text-indigo-200/40 -rotate-12" strokeWidth={1} />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 mb-20 group">
            <div className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <StoreIcon size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">Store<span className="text-indigo-600">Ville</span></span>
          </Link>

          <h1 className="text-[3.5rem] font-black text-gray-900 leading-[1.1] mb-6 tracking-tighter">
            The Digital Heart of<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 drop-shadow-sm">Local Commerce.</span>
          </h1>
          
          <p className="text-gray-600 text-lg leading-relaxed max-w-md mb-14 font-semibold">
            Connect directly with verified local stores, streamline your deliveries, and manage secure payments all from one powerful command center.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-gray-700 hover:text-indigo-700 transition-colors">
              <div className="w-12 h-12 rounded-[1rem] bg-indigo-100/80 flex items-center justify-center border border-indigo-200 shadow-sm">
                <ShieldCheck size={22} className="text-indigo-600" />
              </div>
              <span className="font-bold text-lg">Bank-grade Security</span>
            </div>
            <div className="flex items-center gap-4 text-gray-700 hover:text-indigo-700 transition-colors">
              <div className="w-12 h-12 rounded-[1rem] bg-indigo-100/80 flex items-center justify-center border border-indigo-200 shadow-sm">
                <TrendingUp size={22} className="text-indigo-600" />
              </div>
              <span className="font-bold text-lg">Real-time Order Tracking</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-gray-500 font-bold text-sm tracking-wide">
          © 2026 StoreVille Technologies
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @keyframes gradient { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        `}} />
      </div>

      {/* RIGHT PANEL - 60% Width */}
      <div className="w-full lg:w-[60%] h-full overflow-y-auto p-8 sm:p-14 bg-white">
        <div className="w-full max-w-[480px] mx-auto min-h-full flex flex-col justify-center py-8">
          
          <div className="text-center mb-10">
            {/* Mobile Logo Fallback */}
            <div className="lg:hidden flex justify-center mb-6">
              <Link href="/" className="inline-flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                  <StoreIcon size={20} />
                </div>
                <span className="text-xl font-black tracking-tight text-gray-900">StoreVille</span>
              </Link>
            </div>
            
            <h2 className="text-[2rem] font-black text-gray-900 mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-gray-500 font-medium text-base">Access your secure dashboard.</p>
          </div>

          <div className="flex p-1 bg-[#F4F7F9] rounded-[1rem] mb-8">
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setIdentifier(''); setError(''); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${loginMethod === 'email' ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Mail size={18} /> Email Login
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('phone'); setIdentifier(''); setError(''); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${loginMethod === 'phone' ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Phone size={18} /> Phone Login
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100 text-center animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                {loginMethod === 'email' ? 'Email or Username' : 'Phone Number'}
              </label>
              <div className="relative">
                {loginMethod === 'email' ? (
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                ) : (
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                )}
                <input 
                  type={loginMethod === 'email' ? 'email' : 'tel'} 
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#F4F7F9] border-2 border-transparent rounded-[1rem] py-4 pl-12 pr-4 text-gray-900 focus:outline-none focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold text-base"
                  placeholder={loginMethod === 'email' ? 'you@example.com' : '0987654321'}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">Password</label>
                <Link href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot Password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F4F7F9] border-2 border-transparent rounded-[1rem] py-4 pl-12 pr-4 text-gray-900 focus:outline-none focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold tracking-widest text-base"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white pt-4 pb-3.5 rounded-[1rem] font-bold tracking-wide shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed mt-2 text-lg"
            >
              {isLoading ? <Loader2 size={22} className="animate-spin" /> : <>Access Dashboard <ArrowRight size={20} className="mt-0.5" /></>}
            </button>
          </form>

          <div className="mt-12 text-center border-t border-gray-100 pt-8">
            <p className="text-gray-500 text-sm font-medium">
              New to StoreVille?{' '}
              <Link href="/register" className="text-gray-900 font-bold hover:text-indigo-600 transition-colors">
                Apply as a Buyer
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}