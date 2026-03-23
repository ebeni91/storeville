'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Store as StoreIcon, User, ShoppingBag, Coffee, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'

// 🌟 MAP PRESERVED EXACTLY AS REQUESTED
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-gray-400 font-bold">Loading GPS...</div>
})

export default function RegisterPage() {
  const router = useRouter()
  
  const [role, setRole] = useState<'CUSTOMER' | 'SELLER'>('CUSTOMER')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Shared Fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  // Seller-Specific Fields
  const [businessName, setBusinessName] = useState('')
  const [description, setDescription] = useState('')
  const [gateway, setGateway] = useState<'food' | 'retail'>('retail')
  const [businessType, setBusinessType] = useState('')
  
  // 🌟 MAP STATE PRESERVED EXACTLY AS REQUESTED
  const [location, setLocation] = useState({ lat: 8.9806, lng: 38.7578 })

  const foodTypes = ['Cafe', 'Restaurant', 'Bakery', 'Hotel', 'Fast Food']
  const retailTypes = ['Electronics', 'Fashion & Clothing', 'Home Goods', 'Art & Decor', 'Supermarket']

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const payload: any = {
        name,
        email,
        phone_number: phone,
        password,
        role
      }

      if (role === 'SELLER') {
        if (!businessType) throw new Error("Please select a business type.")
        if (!businessName) throw new Error("Please enter your business name.")
        
        payload.store_data = {
          store_name: businessName,
          description: description,
          category: gateway,
          business_type: businessType,
          store_type: gateway.toUpperCase(),
          latitude: Number(location.lat).toFixed(6),
          longitude: Number(location.lng).toFixed(6)
        }
      }

      await api.post('/accounts/register/', payload)
      router.push('/login?registered=true')

    } catch (err: any) {
      console.error("Registration Error Payload:", err.response?.data)
      const data = err.response?.data

      if (data?.details && typeof data.details === 'object') {
        const parseErrors = (obj: any, prefix = ''): string[] => {
          let msgs: string[] = []
          for (const [key, value] of Object.entries(obj)) {
            const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ')
            const fullFieldName = prefix ? `${prefix} -> ${fieldName}` : fieldName
            
            if (Array.isArray(value)) msgs.push(`${fullFieldName}: ${value[0]}`)
            else if (typeof value === 'object' && value !== null) msgs.push(...parseErrors(value, fullFieldName))
            else msgs.push(`${fullFieldName}: ${value}`)
          }
          return msgs
        }
        setError(parseErrors(data.details).join(' | '))
      } else {
        setError(data?.message || data?.detail || err.message || 'Registration failed.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center p-4 font-sans text-gray-900 selection:bg-indigo-500 selection:text-white overflow-hidden bg-[#fafafa]">
      
      {/*  LOGIN PAGE BACKGROUND SYSTEM: Blurred Gradient Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Top Left Indigo Glow */}
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-indigo-500/20 blur-[120px] rounded-full mix-blend-multiply animate-[pulse_8s_ease-in-out_infinite]"></div>
        {/* Bottom Right Orange Glow */}
        <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-orange-500/20 blur-[120px] rounded-full mix-blend-multiply animate-[pulse_10s_ease-in-out_infinite_1s]"></div>
      </div>

      <div className="relative z-10 w-full max-w-3xl my-8 animate-in fade-in zoom-in-[0.98] duration-700 ease-out">
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="bg-indigo-600 p-3.5 rounded-[1.25rem] shadow-[0_8px_20px_rgba(79,70,229,0.3)] hover:scale-110 hover:rotate-3 transition-all duration-300 mb-6 group cursor-pointer">
            <StoreIcon size={28} className="text-white group-hover:animate-pulse" />
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-2">Create your account</h1>
          <p className="text-sm font-medium text-gray-500">Join the premium digital mall of Ethiopia.</p>
        </div>

        {/* The Glass Form Container */}
        <div className="bg-white/80 backdrop-blur-2xl p-6 md:p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-white/60 relative overflow-hidden">
          
          <div className="flex gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-300 ${role === 'CUSTOMER' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 shadow-[0_4px_15px_rgba(79,70,229,0.1)] scale-[1.02]' : 'border-gray-200 text-gray-500 hover:border-indigo-200 bg-white/50 hover:bg-white'}`}
            >
              <User size={28} className={role === 'CUSTOMER' ? 'text-indigo-600' : 'opacity-50'} />
              <span className="font-bold text-sm">I am a Buyer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('SELLER')}
              className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all duration-300 ${role === 'SELLER' ? 'border-orange-500 bg-orange-50/50 text-orange-700 shadow-[0_4px_15px_rgba(249,115,22,0.1)] scale-[1.02]' : 'border-gray-200 text-gray-500 hover:border-orange-200 bg-white/50 hover:bg-white'}`}
            >
              <StoreIcon size={28} className={role === 'SELLER' ? 'text-orange-500' : 'opacity-50'} />
              <span className="font-bold text-sm">I want to Sell</span>
            </button>
          </div>

          <div className={`overflow-hidden transition-all duration-400 ease-in-out ${error ? 'max-h-24 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
            <div className="bg-red-50/80 backdrop-blur-md border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-semibold flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
              <p className="leading-tight">{error}</p>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2 border-b border-gray-100 pb-2">
                <h3 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2"><User size={20} className={role === 'SELLER' ? 'text-orange-500' : 'text-indigo-600'}/> Personal Details</h3>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 ml-1 tracking-wide uppercase">Your Full Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className={`w-full bg-white/50 border border-gray-200/80 rounded-xl py-3.5 px-4 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:bg-white transition-all shadow-sm placeholder-gray-400 ${role === 'SELLER' ? 'focus:ring-orange-500/20 focus:border-orange-500' : 'focus:ring-indigo-500/20 focus:border-indigo-500'}`} placeholder="Abebe Kebede" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 ml-1 tracking-wide uppercase">Phone Number</label>
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={`w-full bg-white/50 border border-gray-200/80 rounded-xl py-3.5 px-4 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:bg-white transition-all shadow-sm placeholder-gray-400 ${role === 'SELLER' ? 'focus:ring-orange-500/20 focus:border-orange-500' : 'focus:ring-indigo-500/20 focus:border-indigo-500'}`} placeholder="+251 911 000 000" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 ml-1 tracking-wide uppercase">Email Address <span className="opacity-50 lowercase font-medium">(Optional)</span></label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={`w-full bg-white/50 border border-gray-200/80 rounded-xl py-3.5 px-4 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:bg-white transition-all shadow-sm placeholder-gray-400 ${role === 'SELLER' ? 'focus:ring-orange-500/20 focus:border-orange-500' : 'focus:ring-indigo-500/20 focus:border-indigo-500'}`} placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 ml-1 tracking-wide uppercase">Password</label>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full bg-white/50 border border-gray-200/80 rounded-xl py-3.5 px-4 text-sm font-bold tracking-widest text-gray-900 focus:outline-none focus:ring-4 focus:bg-white transition-all shadow-sm placeholder-gray-400 ${role === 'SELLER' ? 'focus:ring-orange-500/20 focus:border-orange-500' : 'focus:ring-indigo-500/20 focus:border-indigo-500'}`} placeholder="••••••••" />
              </div>
            </div>

            <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${role === 'SELLER' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <div className="mt-4 pt-6 border-t border-gray-100 space-y-6">
                  
                  <h3 className="text-lg font-black tracking-tight text-gray-900 flex items-center gap-2"><StoreIcon size={20} className="text-orange-500"/> Business Profile</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2 flex gap-3 p-1.5 bg-gray-100/50 rounded-[1.25rem] border border-gray-200/50">
                      <button type="button" onClick={() => { setGateway('retail'); setBusinessType(''); }} className={`flex-1 p-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 ${gateway === 'retail' ? 'bg-white text-indigo-600 shadow-[0_4px_12px_rgba(0,0,0,0.05)] ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-800'}`}>
                        <ShoppingBag size={18} /> Retail & Goods
                      </button>
                      <button type="button" onClick={() => { setGateway('food'); setBusinessType(''); }} className={`flex-1 p-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 ${gateway === 'food' ? 'bg-white text-orange-500 shadow-[0_4px_12px_rgba(0,0,0,0.05)] ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-800'}`}>
                        <Coffee size={18} /> Food & Drink
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 ml-1 tracking-wide uppercase">Store Name</label>
                      <input required={role === 'SELLER'} type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full bg-white/50 border border-gray-200/80 rounded-xl py-3.5 px-4 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all shadow-sm placeholder-gray-400" placeholder="e.g. Tomoca Coffee" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 ml-1 tracking-wide uppercase">Category</label>
                      <select required={role === 'SELLER'} value={businessType} onChange={e => setBusinessType(e.target.value)} className="w-full bg-white/50 border border-gray-200/80 rounded-xl py-3.5 px-4 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all shadow-sm cursor-pointer appearance-none">
                        <option value="" disabled>Select a category...</option>
                        {(gateway === 'food' ? foodTypes : retailTypes).map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 ml-1 tracking-wide uppercase">Short Description</label>
                      <textarea required={role === 'SELLER'} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-white/50 border border-gray-200/80 rounded-xl py-3.5 px-4 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 focus:bg-white transition-all shadow-sm placeholder-gray-400 min-h-[80px] resize-none" placeholder="What do you sell? Describe your business in a few words..." />
                    </div>

                    {/* 🌟 MAP PRESERVED EXACTLY AS REQUESTED */}
                    <div className="md:col-span-2">
                     <label className="block text-sm font-bold text-gray-700 mb-1">Pin your exact location</label>
                     <p className="text-xs text-gray-500 mb-2">Click the GPS button or drag the marker to your store's front door.</p>
                     <div className="h-[300px] w-full rounded-xl overflow-hidden border-2 border-gray-200">
                        <LocationPicker location={location} setLocation={setLocation} />
                     </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-4.5 rounded-[1.25rem] text-sm font-black tracking-widest uppercase flex items-center justify-center gap-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                isLoading 
                  ? 'bg-indigo-500 text-white cursor-wait scale-[0.99]' 
                  : role === 'SELLER' 
                    ? 'bg-gray-900 text-white hover:bg-black hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(0,0,0,0.25)] focus:ring-gray-900/30'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-[0_12px_25px_rgba(79,70,229,0.35)] focus:ring-indigo-500/30'
              }`}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Complete Registration <ArrowRight size={18} /></>}
            </button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-black text-gray-900 hover:text-indigo-600 transition-colors ml-1 decoration-2 hover:underline underline-offset-4">
                Log in securely
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}