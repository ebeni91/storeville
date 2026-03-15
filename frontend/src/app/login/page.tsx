'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Store as StoreIcon, Mail, Lock, Loader2, ArrowRight, Phone } from 'lucide-react'
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
    <main className="min-h-screen relative flex items-center justify-center bg-gray-50 overflow-hidden px-4">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-400/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:scale-105 transition-transform mb-6">
            <StoreIcon size={32} className="fill-indigo-100" />
            <span className="text-3xl font-extrabold tracking-tight text-indigo-700">StoreVille</span>
          </Link>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 font-medium">Securely log in to your account.</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white p-8">
          
          {/* Method Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => { setLoginMethod('email'); setIdentifier(''); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMethod === 'email' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => { setLoginMethod('phone'); setIdentifier(''); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMethod === 'phone' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Phone Number
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {loginMethod === 'email' ? 'Email Address' : 'Phone Number'}
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
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                  placeholder={loginMethod === 'email' ? 'you@example.com' : '+251 9...'}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl py-3 pl-12 pr-4 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-4"
            >
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : <>Sign In <ArrowRight size={20} /></>}
            </button>
          </form>

          <p className="text-center mt-8 text-gray-600 font-medium">
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-600 font-bold hover:underline">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}