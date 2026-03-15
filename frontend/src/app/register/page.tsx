'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { Store as StoreIcon, User, ShoppingBag, Coffee, ArrowRight, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

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
          // FIX: Force Javascript to truncate to exactly 6 decimal places
          latitude: Number(location.lat).toFixed(6),
          longitude: Number(location.lng).toFixed(6)
        }
      }

      await api.post('/accounts/register/', payload)
      router.push('/login?registered=true')

    } catch (err: any) {
      console.error("Registration Error Payload:", err.response?.data)
      const data = err.response?.data

      // FIX: Recursive function to unpack deeply nested Django errors
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
    <main className="min-h-screen relative flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="absolute top-0 w-full h-96 bg-gradient-to-b from-indigo-900 to-gray-50 z-0"></div>

      <div className="relative z-10 w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
        
        <div className="bg-indigo-900 p-8 text-center text-white">
          <Link href="/" className="inline-flex items-center gap-2 hover:scale-105 transition-transform mb-4">
            <StoreIcon size={32} className="text-indigo-400" />
            <span className="text-3xl font-extrabold tracking-tight">StoreVille</span>
          </Link>
          <h1 className="text-2xl font-bold">Create your account</h1>
        </div>

        <div className="p-8">
          <div className="flex gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${role === 'CUSTOMER' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-500 hover:border-indigo-200'}`}
            >
              <User size={28} />
              <span className="font-bold">I am a Buyer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('SELLER')}
              className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${role === 'SELLER' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:border-orange-200'}`}
            >
              <StoreIcon size={28} />
              <span className="font-bold">I want to Sell</span>
            </button>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <h3 className="text-lg font-black text-gray-900 mb-2">Personal Information</h3>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Your Full Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Abebe Kebede" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+251 911 000 000" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Email Address (Optional)</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" />
              </div>
            </div>

            {role === 'SELLER' && (
              <div className="mt-8 pt-8 border-t border-gray-100 space-y-6 animate-in fade-in slide-in-from-top-4">
                <h3 className="text-lg font-black text-gray-900">Business Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 flex gap-4 mb-2">
                    <button type="button" onClick={() => { setGateway('retail'); setBusinessType(''); }} className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${gateway === 'retail' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-600 border-gray-200'}`}>
                      <ShoppingBag size={18} /> Shop Retail
                    </button>
                    <button type="button" onClick={() => { setGateway('food'); setBusinessType(''); }} className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${gateway === 'food' ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-gray-600 border-gray-200'}`}>
                      <Coffee size={18} /> Food & Coffee
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Business Name</label>
                    <input required type="text" value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Tomoca Coffee" />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Business Category</label>
                    <select required value={businessType} onChange={e => setBusinessType(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
                      <option value="" disabled>Select a category...</option>
                      {(gateway === 'food' ? foodTypes : retailTypes).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Short Description</label>
                    <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]" placeholder="What do you sell? Describe your business in a few words..." />
                  </div>

                  <div className="md:col-span-2">
                     <label className="block text-sm font-bold text-gray-700 mb-1">Pin your exact location</label>
                     <p className="text-xs text-gray-500 mb-2">Click the GPS button or drag the marker to your store's front door.</p>
                     <div className="h-[300px] w-full rounded-xl overflow-hidden border-2 border-gray-200">
                        <LocationPicker location={location} setLocation={setLocation} />
                     </div>
                  </div>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full text-white py-4 rounded-xl font-bold text-lg shadow-md transition-all flex items-center justify-center gap-2 mt-8 ${role === 'SELLER' ? 'bg-gray-900 hover:bg-black shadow-gray-400' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'} disabled:opacity-70`}
            >
              {isLoading ? <Loader2 size={24} className="animate-spin" /> : <>Complete Registration <ArrowRight size={20} /></>}
            </button>
          </form>

          <p className="text-center mt-6 text-gray-600 font-medium">
            Already have an account? <Link href="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </main>
  )
}