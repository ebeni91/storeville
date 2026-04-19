'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  Store as StoreIcon, ShoppingBag, Coffee, ArrowRight, 
  Loader2, AlertCircle, ShieldCheck, TrendingUp,
  Chrome, CheckCircle2, MapPin, ChevronDown, LayoutGrid
} from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { api } from '@/lib/api'

const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-[350px] w-full bg-[#f8fafc] rounded-[2.5rem] animate-pulse flex flex-col items-center justify-center text-gray-400 font-bold gap-3 border-2 border-dashed border-gray-200">
    <Loader2 className="animate-spin text-gray-900" size={32} />
    <span>Initializing Interactive Map...</span>
  </div>
})

export default function RegisterPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  
  // ── Auth States ────────────────────────────────────────────────────────────
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  
  // ── Store Profile States ───────────────────────────────────────────────────
  const [businessName, setBusinessName] = useState('')
  const [description, setDescription] = useState('')
  const [gateway, setGateway] = useState<'food' | 'retail'>('retail')
  const [businessType, setBusinessType] = useState('')
  const [location, setLocation] = useState({ lat: 8.9806, lng: 38.7578 })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const foodTypes = ['Cafe', 'Restaurant', 'Bakery', 'Hotel', 'Fast Food']
  const retailTypes = ['Electronics', 'Fashion & Clothing', 'Home Goods', 'Art & Decor', 'Supermarket']

  // Redirect if already a seller
  useEffect(() => {
    if (session?.user && (session.user as any).role === 'SELLER') {
      router.replace('/dashboard/seller')
    }
  }, [session, router])

  // ── Auth Actions ──────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    setError('')
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: '/stores/launch',
    })
  }

  const handleSendOtp = async () => {
    setError('')
    setIsSendingOtp(true)
    try {
      const { error: err } = await (authClient as any).phoneNumber.sendOtp({
        phoneNumber: phone,
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
      const { error: err } = await (authClient as any).phoneNumber.verify({
        phoneNumber: phone,
        code: otp,
      })
      if (err) throw new Error(err.message)
    } catch (err: any) {
      setError(err.message || 'Invalid OTP.')
    } finally {
      setIsLoading(false)
    }
  }

  // ── Store Creation ────────────────────────────────────────────────────────
  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessType) { setError('Please select a business category.'); return }
    
    setError('')
    setIsLoading(true)
    try {
      await api.post('/stores/manage', {
        name: businessName,
        description,
        category: gateway,
        business_type: businessType,
        store_type: gateway.toUpperCase(),
        latitude: parseFloat(Number(location.lat).toFixed(6)),
        longitude: parseFloat(Number(location.lng).toFixed(6)),
      })

      await authClient.getSession({ fetchOptions: { cache: 'no-store' } })
      router.push('/dashboard/seller')
    } catch (err: any) {
      setError(err.message || 'Failed to create your store. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass = "w-full bg-[#f8fafc] border border-gray-100 rounded-2xl py-4.5 px-6 text-gray-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-gray-900/5 focus:border-gray-900/20 transition-all font-bold text-base shadow-sm"
  const labelClass = "block text-xs font-black text-gray-400 uppercase tracking-[0.15em] mb-4 ml-1"

  if (isPending) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-gray-900" size={40} /></div>

  return (
    <main className="flex min-h-screen w-full bg-white font-sans selection:bg-gray-900 selection:text-white lg:h-screen lg:overflow-hidden">
      
      {/* 🏙️ LEFT PANEL: BRAND & VALUE PROP (Synced with Login) */}
      <div className="hidden lg:flex flex-col justify-between w-[40%] bg-gray-900 p-16 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <StoreIcon className="absolute -bottom-24 -left-20 w-[600px] h-[600px] text-white/5 -rotate-12" strokeWidth={1} />
        
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-1 mb-24 group hover:opacity-80 transition-opacity">
            <div className="flex items-start">
              <span className="text-4xl font-light tracking-[-1.5px] text-gray-400">Store</span>
              <span className="text-4xl font-black tracking-[-1.5px] text-white">Ville</span>
              <span className="text-sm font-black text-[#34d399] mt-[2px] ml-[2px]">™</span>
            </div>
          </Link>

          <h1 className="text-[4.2rem] font-black text-white leading-[0.95] mb-8 tracking-tighter">
            Build your<br/>
            <span className="text-white">Digital Empire.</span>
          </h1>

          <div className="space-y-10">
            <div className="flex items-center gap-6 text-gray-300/90">
              <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 backdrop-blur-3xl flex items-center justify-center border border-white/10 shadow-2xl font-bold"><CheckCircle2 className="text-[#34d399]" size={28} /></div>
              <div>
                <h4 className="font-black text-xl text-white">Instant Payouts</h4>
                <p className="text-base font-medium opacity-70">Get your earnings deposited daily.</p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-gray-300/90">
              <div className="w-16 h-16 rounded-[1.5rem] bg-white/5 backdrop-blur-3xl flex items-center justify-center border border-white/10 shadow-2xl font-bold"><TrendingUp className="text-[#34d399]" size={28} /></div>
              <div>
                <h4 className="font-black text-xl text-white">Powerful Analytics</h4>
                <p className="text-base font-medium opacity-70">Track every sale with precision.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative z-10 text-gray-300/30 font-black text-[10px] uppercase tracking-[0.4em]">© 2026 StoreVille Merchant Platform</div>
      </div>

      {/* 📋 RIGHT PANEL: DYNAMIC MERCHANT FORM */}
      <div className="w-full lg:w-[60%] h-full overflow-y-auto p-4 sm:p-12 lg:p-16 bg-white flex justify-center">
        <div className="w-full max-w-[700px] mx-auto py-8">
          
          {/* Header */}
          <div className="mb-12 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 text-gray-900 font-black text-[10px] uppercase tracking-[0.2em] mb-8 border border-gray-200 shadow-sm">
              🚀 Merchant Onboarding
            </div>
            <h2 className="text-5xl md:text-[4rem] font-black text-gray-900 mb-4 tracking-tighter leading-[0.9] text-balance">
              {!session ? "Let's begin." : "Your Business Profile."}
            </h2>
            <p className="text-gray-500 font-bold text-lg max-w-lg mb-2">
              {!session ? "First, identify your merchant account." : "Let's capture the core details of your new storefront."}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-6 py-5 rounded-3xl text-sm font-bold flex items-center gap-4 mb-10 border border-red-100 animate-in fade-in slide-in-from-top-4">
              <AlertCircle size={24} className="shrink-0 text-red-500" />
              <p>{error}</p>
            </div>
          )}

          {/* ─────── STEP 1: AUTHENTICATION (Synced with New Login Style) ─────── */}
          {!session ? (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              
              {!otpSent ? (
                <div className="space-y-6">
                  <div className="flex gap-4 items-center">
                    {/* Country Picker Box */}
                    <div className="flex items-center gap-3 bg-[#f8fafc] px-5 py-5 rounded-2xl border border-gray-100 shadow-sm cursor-default">
                      <img 
                        src="https://flagcdn.com/w40/et.png" 
                        alt="ET" 
                        className="w-7 h-4.5 rounded-sm object-cover"
                      />
                      <span className="font-black text-gray-900 text-xl">+251</span>
                      <ChevronDown size={18} className="text-gray-400" />
                    </div>

                    {/* Mobile Number Input */}
                    <div className="flex-1">
                      <input 
                        type="tel" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)} 
                        className="w-full bg-[#f8fafc] border border-gray-100 rounded-2xl py-5 px-6 text-gray-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-gray-900/5 focus:border-gray-900/20 transition-all font-black text-xl shadow-sm"
                        placeholder="Mobile number" 
                      />
                    </div>
                  </div>

                  {/* Primary Action Pill */}
                  <button 
                    type="button" 
                    onClick={handleSendOtp} 
                    disabled={isSendingOtp || phone.length < 9}
                    className="w-full bg-gray-900 text-white py-5 rounded-full font-black text-xl shadow-[0_15px_30px_-10px_rgba(17,24,39,0.5)] hover:bg-black hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isSendingOtp ? <Loader2 size={24} className="animate-spin" /> : 'Continue'}
                  </button>

                  {/* Divider */}
                  <div className="relative flex py-8 items-center">
                    <div className="flex-grow border-t border-gray-100"></div>
                    <span className="flex-shrink mx-6 text-gray-400 text-[10px] font-black uppercase tracking-[0.25em]">Or secure access with</span>
                    <div className="flex-grow border-t border-gray-100"></div>
                  </div>

                  {/* Social Buttons (Circular) */}
                  <div className="flex justify-center gap-6">
                    <button 
                      onClick={handleGoogle}
                      className="w-24 h-16 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm group"
                    >
                      <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-8 h-8 group-hover:scale-110 transition-transform"/>
                    </button>
                    <button className="w-24 h-16 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm group">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_(2019).png" alt="FB" className="w-8 h-8 group-hover:scale-110 transition-transform"/>
                    </button>
                  </div>
                </div>
              ) : (
                /* 📝 VERIFY OTP STATE */
                <form onSubmit={handleVerifyOtp} className="space-y-10 animate-in slide-in-from-bottom-8 duration-700">
                  <div className="text-center font-bold text-gray-400 mb-8 uppercase tracking-widest text-xs">
                    Verification code sent to <br/>
                    <span className="text-gray-900 text-2xl font-black tracking-tight block mt-2">+251 {phone}</span>
                  </div>
                  
                  <input 
                    type="text" 
                    required 
                    autoFocus
                    inputMode="numeric" 
                    maxLength={6} 
                    value={otp} 
                    onChange={e => setOtp(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-gray-100 rounded-[2.5rem] py-10 px-8 text-gray-900 focus:outline-none focus:bg-white focus:ring-8 focus:ring-gray-900/5 focus:border-gray-900/10 font-black text-5xl text-center tracking-[1.5rem] transition-all shadow-inner"
                    placeholder="······" 
                  />

                  <div className="space-y-5">
                    <button 
                      type="submit" 
                      disabled={isLoading || otp.length < 6}
                      className="w-full bg-gray-900 text-white py-6 rounded-full font-black text-2xl shadow-[0_20px_40px_-10px_rgba(17,24,39,0.5)] hover:bg-black transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 size={28} className="animate-spin" /> : <>Verify Identity <CheckCircle2 size={24}/></>}
                    </button>
                    
                    <button type="button" onClick={() => setOtpSent(false)} className="w-full py-2 text-gray-900 font-extrabold hover:underline text-sm uppercase tracking-widest">Back to Phone</button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ─────── STEP 2: BUSINESS PROFILE (HI-END FORM) ─────── */
            <form onSubmit={handleCreateStore} className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
              
              {/* Category Selector Pill */}
              <div className="space-y-4">
                <label className={labelClass}>Marketplace Vertical</label>
                <div className="p-2 bg-[#f8fafc] rounded-[2rem] border border-gray-100 flex gap-2">
                  <button type="button" onClick={() => { setGateway('retail'); setBusinessType('') }} className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.5rem] font-black text-sm tracking-wide transition-all ${gateway === 'retail' ? 'bg-white shadow-[0_8px_20px_rgba(17,24,39,0.15)] border border-gray-900 text-gray-900 scale-[1.02]' : 'text-gray-400 hover:text-gray-700'}`}>
                    <ShoppingBag size={20} /> Retail Commerce
                  </button>
                  <button type="button" onClick={() => { setGateway('food'); setBusinessType('') }} className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[1.5rem] font-black text-sm tracking-wide transition-all ${gateway === 'food' ? 'bg-white shadow-[0_8px_20px_rgba(249,115,22,0.15)] border border-orange-100 text-orange-700 scale-[1.02]' : 'text-gray-400 hover:text-gray-700'}`}>
                    <Coffee size={20} /> Food & Hospitality
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="md:col-span-1">
                  <label className={labelClass}>Store Identity</label>
                  <input required type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} className={inputClass} placeholder="Addis Luxury Hub" />
                </div>

                <div className="md:col-span-1 relative">
                  <label className={labelClass}>Specialization</label>
                  <div className="relative">
                    <select required value={businessType} onChange={e => setBusinessType(e.target.value)} className={`${inputClass} appearance-none cursor-pointer pr-12 relative z-10 bg-transparent`}>
                      <option value="" disabled>Choose niche...</option>
                      {(gateway === 'food' ? foodTypes : retailTypes).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-20" size={20} />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Business Narrative</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} min-h-[160px] py-6 resize-none rounded-[2rem]`} placeholder="Tell your store's story. What makes your items or signature dishes premium? Mention exclusivity, speed, or quality..." />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <label className={labelClass}>Physical Point of Sale</label>
                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-900 uppercase tracking-widest border border-gray-200">
                      <LayoutGrid size={12} /> Visual Precision Required
                    </div>
                  </div>
                  
                  <div className="group relative">
                    <div className="h-[400px] w-full rounded-[2.5rem] overflow-hidden border-2 border-gray-100 shadow-2xl relative transition-all group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                       <LocationPicker location={location} setLocation={setLocation} />
                    </div>
                    {/* Floating Map Tip */}
                    <div className="absolute top-6 left-6 right-6 pointer-events-none">
                       <div className="bg-white/90 backdrop-blur-xl border border-white p-4 rounded-2xl shadow-xl flex items-center gap-4 max-w-sm animate-in fade-in slide-in-from-top-2">
                         <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20"><MapPin size={20} /></div>
                         <p className="text-[11px] font-bold text-gray-600 leading-tight tracking-tight">Drag the pin to your exact building entrance so buyers can find you instantly.</p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 border-t border-gray-100">
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className={`w-full text-white py-6 rounded-full font-black tracking-[0.25em] uppercase shadow-2xl transition-all flex items-center justify-center gap-5 transform hover:-translate-y-2 active:scale-[0.98] disabled:opacity-50 text-lg ${gateway === 'retail' ? 'bg-gray-900 hover:bg-black shadow-gray-900/40' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/40'}`}
                >
                  {isLoading ? <Loader2 size={28} className="animate-spin" /> : <>Launch My Digital Mall <ArrowRight size={24} className="animate-pulse" /></>}
                </button>
                <div className="flex items-center justify-center gap-3 mt-10">
                  <div className="w-8 h-px bg-gray-200"></div>
                  <p className="text-gray-400 text-[10px] font-black tracking-widest uppercase">Verified Merchant Application</p>
                  <div className="w-8 h-px bg-gray-200"></div>
                </div>
              </div>
            </form>
          )}

          {!session && (
            <div className="mt-20 text-center border-t border-gray-100 pt-10">
              <p className="text-gray-400 font-bold text-sm">
                Already part of the network?{' '}
                <Link href="/login" className="text-gray-900 font-black hover:underline underline-offset-4 ml-1">Merchant Sign In</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
