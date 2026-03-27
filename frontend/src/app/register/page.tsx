'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Store as StoreIcon, User, ShoppingBag, Coffee, ArrowRight, Loader2, AlertCircle, ShieldCheck, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'

// 🌟 MAP PRESERVED EXACTLY AS REQUESTED
const LocationPicker = dynamic(() => import('@/components/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-[300px] w-full bg-[#F4F7F9] rounded-xl animate-pulse flex items-center justify-center text-gray-400 font-bold">Loading GPS...</div>
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

  // Common Input Styles
  const inputClass = "w-full bg-[#F4F7F9] border-2 border-transparent rounded-[1rem] py-4 px-4 text-gray-900 focus:outline-none focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold text-sm"
  const labelClass = "block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1"

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
      <div className="w-full lg:w-[60%] h-full overflow-y-auto p-6 sm:p-12 bg-white">
        <div className="w-full max-w-[700px] mx-auto min-h-full flex flex-col justify-center py-8">
          
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
            
            <h2 className="text-[2rem] font-black text-gray-900 mb-2 tracking-tight">Create your account</h2>
            <p className="text-gray-500 font-medium text-base">Join the premium digital mall of Ethiopia.</p>
          </div>

          <div className="flex gap-4 mb-10 max-w-xl mx-auto w-full">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`flex-1 py-4 px-2 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 border-2 ${role === 'CUSTOMER' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-transparent bg-[#F4F7F9] text-gray-500 hover:text-gray-700'}`}
            >
              <User size={24} className={role === 'CUSTOMER' ? 'text-indigo-600' : 'opacity-50'} />
              <span className="font-bold text-sm">I am a Buyer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('SELLER')}
              className={`flex-1 py-4 px-2 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 border-2 ${role === 'SELLER' ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-transparent bg-[#F4F7F9] text-gray-500 hover:text-gray-700'}`}
            >
              <StoreIcon size={24} className={role === 'SELLER' ? 'text-orange-500' : 'opacity-50'} />
              <span className="font-bold text-sm">I want to Sell</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-50/80 text-red-600 px-4 py-4 rounded-xl text-sm font-semibold flex items-start gap-3 mb-8 animate-in fade-in zoom-in-95">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
              <p className="leading-tight">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className={`text-xl font-black tracking-tight flex items-center gap-2 pb-2 ${role === 'SELLER' ? 'text-orange-600' : 'text-gray-900'}`}>
                   Personal Details
                </h3>
              </div>

              <div>
                <label className={labelClass}>Your Full Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Abebe Kebede" />
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="+251 911 000 000" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Email Address <span className="opacity-50 lowercase font-medium">- Optional</span></label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Password</label>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" />
              </div>
            </div>

            <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-in-out ${role === 'SELLER' ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <div className="mt-8 space-y-6">
                  <h3 className="text-xl font-black tracking-tight text-gray-900 flex items-center gap-2 pb-2 border-t border-gray-100 pt-8">
                     Business Profile
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 flex gap-3 p-1.5 bg-[#F4F7F9] rounded-[1.25rem] border border-transparent">
                      <button type="button" onClick={() => { setGateway('retail'); setBusinessType(''); }} className={`flex-1 p-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 ${gateway === 'retail' ? 'bg-white text-indigo-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-indigo-500/20' : 'text-gray-500 hover:text-gray-800'}`}>
                        <ShoppingBag size={18} /> Retail & Goods
                      </button>
                      <button type="button" onClick={() => { setGateway('food'); setBusinessType(''); }} className={`flex-1 p-3.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 ${gateway === 'food' ? 'bg-white text-orange-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-orange-500/20' : 'text-gray-500 hover:text-gray-800'}`}>
                        <Coffee size={18} /> Food & Drink
                      </button>
                    </div>

                    <div>
                      <label className={labelClass}>Store Name</label>
                      <input required={role === 'SELLER'} type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} className={inputClass} placeholder="e.g. Tomoca Coffee" />
                    </div>

                    <div>
                      <label className={labelClass}>Category</label>
                      <select required={role === 'SELLER'} value={businessType} onChange={e => setBusinessType(e.target.value)} className={`${inputClass} cursor-pointer appearance-none`}>
                        <option value="" disabled>Select a category...</option>
                        {(gateway === 'food' ? foodTypes : retailTypes).map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className={labelClass}>Short Description</label>
                      <textarea required={role === 'SELLER'} value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} min-h-[100px] resize-none pb-2`} placeholder="What do you sell? Describe your business in a few words..." />
                    </div>

                    {/* 🌟 MAP PRESERVED EXACTLY AS REQUESTED */}
                    <div className="md:col-span-2">
                       <label className={labelClass}>Pin your exact location</label>
                       <p className="text-xs text-gray-500 mb-2 font-medium">Click the GPS button or drag the marker to your store's front door.</p>
                       <div className="h-[300px] w-full rounded-[1.25rem] overflow-hidden border-2 border-transparent bg-[#F4F7F9]">
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
              className={`w-full mt-10 text-white pt-4 pb-3.5 rounded-[1.25rem] font-bold tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed text-lg ${role === 'SELLER' ? 'bg-gray-900 hover:bg-black shadow-gray-900/20' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'}`}
            >
              {isLoading ? <Loader2 size={22} className="animate-spin" /> : <>Complete Registration <ArrowRight size={20} className="mt-0.5" /></>}
            </button>
          </form>

          <div className="mt-12 text-center border-t border-gray-100 pt-8">
            <p className="text-gray-500 text-sm font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-gray-900 font-bold hover:text-indigo-600 transition-colors">
                Log in securely
              </Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}