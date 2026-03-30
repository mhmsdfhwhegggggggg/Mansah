'use client'

import { useState } from 'react'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Search, Package, CheckCircle2, Clock, Truck, CreditCard } from 'lucide-react'
import { ORDER_STATUSES, getStatusStep } from '@/lib/utils'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const trackingSteps = [
  { key: 'PENDING', label: 'قيد الانتظار', icon: Clock },
  { key: 'PAYMENT_CONFIRMED', label: 'تم الدفع', icon: CreditCard },
  { key: 'PURCHASING', label: 'جاري الشراء', icon: Package },
  { key: 'PURCHASED', label: 'تم الشراء', icon: CheckCircle2 },
  { key: 'SHIPPING', label: 'جاري الشحن', icon: Truck },
  { key: 'IN_TRANSIT', label: 'في الطريق', icon: Truck },
  { key: 'DELIVERED', label: 'تم التسليم', icon: CheckCircle2 },
]

interface TrackedOrder {
  orderNumber: string
  status: string
  totalAmount: number
  currency: string
  trackingNumber?: string
  createdAt: string
  items: Array<{
    quantity: number
    product: { title: string; titleAr?: string; images: string }
  }>
  statusHistory: Array<{
    status: string
    note?: string
    createdAt: string
  }>
}

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState<TrackedOrder | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderNumber.trim()) {
      toast.error('يرجى إدخال رقم الطلب')
      return
    }

    setLoading(true)
    setSearched(true)

    try {
      const res = await fetch(`/api/track?orderNumber=${encodeURIComponent(orderNumber)}`)
      const data = await res.json()

      if (!res.ok) {
        setOrder(null)
        toast.error(data.error || 'الطلب غير موجود')
      } else {
        setOrder(data.order)
      }
    } catch {
      setOrder(null)
      toast.error('حدث خطأ في البحث')
    } finally {
      setLoading(false)
    }
  }

  const currentStep = order ? getStatusStep(order.status) : -1

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/30">
            <Package size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">تتبع طلبك</h1>
          <p className="text-gray-500">أدخل رقم الطلب لمعرفة حالته الحالية</p>
        </div>

        {/* Search */}
        <div className="card p-6 mb-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="أدخل رقم الطلب (مثال: MNS-XXXX-XXXX)"
                className="input-field pr-10"
                dir="ltr"
              />
              <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary !px-8">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'بحث'
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {searched && !loading && !order && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-400">لم يتم العثور على الطلب</h3>
            <p className="text-gray-400 text-sm mt-2">تأكد من رقم الطلب وحاول مجدداً</p>
          </div>
        )}

        {order && (
          <div className="space-y-6 animate-fadeIn">
            {/* Status */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">طلب #{order.orderNumber}</h2>
                  <p className="text-sm text-gray-500">{format(new Date(order.createdAt), 'yyyy/MM/dd HH:mm')}</p>
                </div>
                <span className={`px-4 py-2 rounded-xl text-sm font-bold ${(ORDER_STATUSES[order.status] || ORDER_STATUSES.PENDING).color}`}>
                  {(ORDER_STATUSES[order.status] || ORDER_STATUSES.PENDING).labelAr}
                </span>
              </div>

              {/* Progress */}
              {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded">
                    <div
                      className="h-full bg-primary-600 rounded transition-all duration-500"
                      style={{ width: `${Math.max(0, (currentStep / (trackingSteps.length - 1)) * 100)}%` }}
                    />
                  </div>
                  {trackingSteps.map((step, index) => {
                    const isCompleted = index <= currentStep
                    const isCurrent = index === currentStep
                    return (
                      <div key={step.key} className="relative flex flex-col items-center z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isCompleted ? 'bg-primary-600 text-white shadow-lg' : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-primary-100' : ''}`}>
                          <step.icon size={18} />
                        </div>
                        <span className={`text-xs mt-2 font-medium hidden sm:block ${isCompleted ? 'text-primary-600' : 'text-gray-400'}`}>
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {order.trackingNumber && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">رقم تتبع الشحنة</p>
                  <p className="text-lg font-bold text-blue-800" dir="ltr">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-800 mb-4">المنتجات</h3>
              <div className="space-y-3">
                {order.items.map((item, index) => {
                  const images = JSON.parse(item.product?.images || '[]')
                  return (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {images[0] && <Image src={images[0]} alt="" fill className="object-cover" sizes="48px" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{item.product?.titleAr || item.product?.title}</p>
                        <p className="text-xs text-gray-500">الكمية: {item.quantity}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* History */}
            {order.statusHistory.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-800 mb-4">سجل التحديثات</h3>
                <div className="space-y-4">
                  {order.statusHistory.map((entry, index) => {
                    const info = ORDER_STATUSES[entry.status] || ORDER_STATUSES.PENDING
                    return (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full mt-1.5 ${info.color.split(' ')[0]}`} />
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{info.labelAr}</p>
                          {entry.note && <p className="text-xs text-gray-500">{entry.note}</p>}
                          <p className="text-xs text-gray-400 mt-1">{format(new Date(entry.createdAt), 'yyyy/MM/dd HH:mm')}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
