'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Store as StoreIcon, Loader2, ArrowRight,
  ShieldCheck, TrendingUp, Chrome, Facebook, ChevronDown
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  // ── States for Phone OTP ───────────────────────────────────────────────────
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)

  const redirectAfterLogin = (role?: string) => {
    if (role === 'SELLER') router.push('/dashboard/seller')
    else router.push('/')
  }

  // ── Phone OTP Actions ─────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    setError('')
    setIsSendingOtp(true)
    try {
      const { error: err } = await (authClient as any).phoneNumber.sendOtp({
        phoneNumber: identifier,
      })
      if (err) throw new Error(err.message)
      setOtpSent(true)
    } catch (err: any) {
      setError(err.message || 'Could not send OTP.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const { data, error: err } = await (authClient as any).phoneNumber.verify({
        phoneNumber: identifier,
        code: otp,
      })
      if (err) throw new Error(err.message)
      redirectAfterLogin((data?.user as any)?.role)
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please check the code and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Google OAuth ─────────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setError('')
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/auth/callback',
    })
  }

  return (
    <main className="flex min-h-screen w-full bg-white font-sans selection:bg-gray-900 selection:text-white lg:h-screen lg:overflow-hidden">

      {/* LEFT PANEL: BRAND & VALUE PROP (Unchanged as requested) */}
      <div className="hidden lg:flex flex-col justify-between w-[40%] bg-gray-50 border-r border-gray-200 p-14 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 opacity-[0.2] mix-blend-overlay bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />
        <StoreIcon className="absolute -bottom-24 -left-20 w-[600px] h-[600px] text-gray-200/40 -rotate-12" strokeWidth={1} />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-1 mb-20 group hover:opacity-80 transition-opacity">
            <div className="flex items-start">
              <span className="text-3xl font-light tracking-[-1px] text-gray-400">Store</span>
              <span className="text-3xl font-black tracking-[-1px] text-gray-900">Ville</span>
              <span className="text-sm font-black text-[#34d399] mt-1 ml-[2px]">™</span>
            </div>
          </Link>
          <h1 className="text-[3.5rem] font-black text-gray-900 leading-[1.1] mb-6 tracking-tighter text-balance">
            The Digital Heart of<br/>
            <span className="text-gray-900">Local Commerce.</span>
          </h1>
          
        </div>
        <div className="relative z-10 text-gray-500 font-bold text-sm uppercase tracking-widest">© 2026 StoreVille Technologies</div>
      </div>

      {/* RIGHT PANEL: REDESIGNED FORM (Matching reference image) */}
      <div className="w-full lg:w-[60%] h-full overflow-y-auto p-4 sm:p-14 bg-white flex items-center justify-center">
        <div className="w-full max-w-[420px] mx-auto py-8">

          {/* Logo for mobile only */}
          <div className="lg:hidden flex justify-center mb-10">
            <Link href="/" className="inline-flex items-center gap-1 group hover:opacity-80 transition-opacity">
              <div className="flex items-start">
                <span className="text-3xl font-light tracking-[-1px] text-gray-400">Store</span>
                <span className="text-3xl font-black tracking-[-1px] text-gray-900">Ville</span>
                <span className="text-sm font-black text-[#34d399] mt-1 ml-[2px]">™</span>
              </div>
            </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Sign In</h2>
            <p className="text-gray-500 font-medium">Safe and instant access to your account.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-8 border border-red-100 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {/* 📱 PHONE OTP FORM (REDESIGNED TO MATCH REFERENCE) */}
          {!otpSent ? (
            <div className="space-y-6">
              <div className="flex gap-4 items-center">
                {/* Country Picker Box */}
                <div className="flex items-center gap-2 bg-[#F6F8F9] px-4 py-4 rounded-2xl border border-gray-100 shadow-sm cursor-default">
                  <img 
                    src="https://flagcdn.com/w40/et.png" 
                    alt="ET" 
                    className="w-6 h-4 rounded-sm object-cover"
                  />
                  <span className="font-bold text-gray-900 text-lg">+251</span>
                  <ChevronDown size={16} className="text-gray-400" />
                </div>

                {/* Mobile Number Input */}
                <div className="flex-1">
                  <input 
                    type="tel" 
                    value={identifier} 
                    onChange={e => setIdentifier(e.target.value)} 
                    className="w-full bg-[#F6F8F9] border border-gray-100 rounded-2xl py-4 px-5 text-gray-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-gray-900/10 focus:border-gray-900/30 transition-all font-bold text-lg"
                    placeholder="Mobile number" 
                  />
                </div>
              </div>

              {/* Main Sign In Button (Pill shaped) */}
              <button 
                type="button" 
                onClick={handleSendOtp} 
                disabled={isSendingOtp || identifier.length < 9}
                className="w-full bg-gray-900 text-white py-4.5 rounded-full font-black text-lg shadow-[0_12px_24px_-8px_rgba(17,24,39,0.4)] hover:bg-black hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4"
              >
                {isSendingOtp ? <Loader2 size={24} className="animate-spin" /> : 'Sign In'}
              </button>

              {/* Divider */}
              <div className="relative flex py-8 items-center">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm font-bold uppercase tracking-widest">Or continue with</span>
                <div className="flex-grow border-t border-gray-100"></div>
              </div>

              {/* Social Buttons (Circular as in reference) */}
              <div className="flex justify-center gap-4">
                <button 
                  onClick={handleGoogle}
                  className="w-20 h-14 md:w-24 md:h-16 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
                >
                  <img 
                    src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" 
                    alt="Google" 
                    className="w-7 h-7 group-hover:scale-110 transition-transform"
                  />
                </button>
                <button 
                  className="w-20 h-14 md:w-24 md:h-16 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
                >
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png" 
                    alt="Facebook" 
                    className="w-7 h-7 group-hover:scale-110 transition-transform"
                  />
                </button>
              </div>
            </div>
          ) : (
            /* 📝 VERIFY OTP STATE (ADAPTED TO NEW STYLE) */
            <form onSubmit={handleVerifyOtp} className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
               <div className="text-center font-bold text-gray-600 mb-6">
                 Enter the 6-digit code sent to <br/>
                 <span className="text-gray-900 text-xl font-black tracking-tight">+251 {identifier}</span>
               </div>
               
               <input 
                 type="text" 
                 required 
                 autoFocus
                 inputMode="numeric" 
                 maxLength={6} 
                 value={otp} 
                 onChange={e => setOtp(e.target.value)}
                 className="w-full bg-[#F6F8F9] border border-gray-100 rounded-[2rem] py-8 px-6 text-gray-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-gray-900/10 focus:border-gray-900/30 font-black text-4xl text-center tracking-[1rem] transition-all shadow-inner"
                 placeholder="······" 
               />

               <div className="space-y-4">
                 <button 
                   type="submit" 
                   disabled={isLoading || otp.length < 6}
                   className="w-full bg-gray-900 text-white py-5 rounded-full font-black text-xl shadow-[0_15px_30px_-10px_rgba(17,24,39,0.5)] hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                 >
                   {isLoading ? <Loader2 size={24} className="animate-spin" /> : <>Verify & Access <ArrowRight size={22} /></>}
                 </button>
                 
                 <button 
                   type="button" 
                   onClick={() => setOtpSent(false)} 
                   className="w-full py-2 text-gray-900 font-bold hover:underline text-sm uppercase tracking-widest"
                 >
                   Change phone number?
                 </button>
               </div>
            </form>
          )}

          <div className="mt-20 text-center text-gray-500 font-medium text-sm">
            Don't have an account? {' '}
            <Link href="/register" className="text-gray-900 font-black hover:underline underline-offset-4">Sign Up</Link>
          </div>
        </div>
      </div>
    </main>
  )
}