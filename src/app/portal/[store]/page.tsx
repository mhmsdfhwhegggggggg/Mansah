'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'

const stores = {
  shein: 'https://ar.shein.com',
  amazon: 'https://www.amazon.com',
  aliexpress: 'https://best.aliexpress.com',
}

export default function StorePortal() {
  const params = useParams()
  const router = useRouter()
  
  // Safely get the store key
  const storeKey = (Array.isArray(params?.store) ? params.store[0] : params?.store)?.toLowerCase() as keyof typeof stores
  const targetUrl = stores[storeKey]
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 🕵️‍♂️ The Titanium Receiver: Listens to the injected frame's messages
    const handleMessage = (event: MessageEvent) => {
      // When the user clicks the floating button inside the injected Shein HTML
      if (event.data && event.data.type === 'SBN_CHECKOUT') {
        const productUrl = event.data.url
        // Send them to our own custom product scraper link or search!
        // For now, we redirect them to products page with the url acting as search query so our scraper picks it up
        router.push(`/products?search=${encodeURIComponent(productUrl)}`)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [router])

  if (!targetUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <h1 className="text-2xl font-bold">عذراً، المتجر غير مدعوم في البوابة حالياً</h1>
        <button onClick={() => router.push('/')} className="btn-primary">العودة للرئيسية</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Small version of Navbar so it doesn't take up space */}
      <div className="hidden md:block shadow-sm">
        <Navbar />
      </div>
      
      {/* SBN Portal Alert Header */}
      <div className="bg-primary-50 border-b border-primary-200 py-3 px-4 shadow-sm z-10 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary-600 to-primary-500 text-white flex items-center justify-center font-black shadow-md text-xl">
            {storeKey.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-gray-800 text-sm md:text-base">تتصفح الآن موقع {storeKey.toUpperCase()} المباشر</h2>
            <p className="text-xs p-1 md:text-sm text-white bg-primary-600 rounded-md font-bold mt-1 inline-block">تصفح بحرية، واضغط الزر البرتقالي أسفل الشاشة عند إعجابك بمنتج!</p>
          </div>
        </div>
        <button onClick={() => router.push('/')} className="text-sm font-bold text-gray-600 hover:text-red-600 border px-4 py-2 rounded-lg bg-white shadow-sm transition-colors">
          إنهاء التسوق ✕
        </button>
      </div>

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 z-20" style={{ top: '80px' }}>
          <div className="w-20 h-20 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin mb-6 shadow-lg"></div>
          <h2 className="text-2xl font-black text-gray-800 mb-3 tracking-wide">جاري تجهيز المتجر العالمي لك... 🌍</h2>
          <p className="text-primary-600 font-medium animate-pulse text-lg">لحظات ونأخذك للتسوق المباشر من متجر {storeKey.toUpperCase()}</p>
        </div>
      )}

      {/* The Titanium Hook Iframe executing the custom proxy */}
      <iframe 
        src={`/api/bridge?url=${encodeURIComponent(targetUrl)}`}
        className="w-full flex-1 border-none bg-gray-50 transition-opacity duration-500"
        style={{ opacity: loading ? 0 : 1 }}
        onLoad={() => setLoading(false)}
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
        title="SBN Direct Hook"
      />
    </div>
  )
}
