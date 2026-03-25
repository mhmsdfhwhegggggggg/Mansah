'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Package, CheckCircle2, Clock, Truck, CreditCard, MapPin, ArrowRight } from 'lucide-react'
import { OrderType } from '@/types'
import { ORDER_STATUSES, PAYMENT_METHODS, getStatusStep } from '@/lib/utils'
import { format } from 'date-fns'

const trackingSteps = [
  { key: 'PENDING', label: 'قيد الانتظار', icon: Clock },
  { key: 'PAYMENT_CONFIRMED', label: 'تم الدفع', icon: CreditCard },
  { key: 'PURCHASING', label: 'جاري الشراء', icon: Package },
  { key: 'PURCHASED', label: 'تم الشراء', icon: CheckCircle2 },
  { key: 'SHIPPING', label: 'جاري الشحن', icon: Truck },
  { key: 'IN_TRANSIT', label: 'في الطريق', icon: Truck },
  { key: 'DELIVERED', label: 'تم التسليم', icon: CheckCircle2 },
]

export default function OrderDetailPage() {
  const params = useParams()
  const { data: session } = useSession()
  const [order, setOrder] = useState<OrderType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    fetch(`/api/orders/${params.id}`)
      .then(res => res.json())
      .then(data => setOrder(data.order))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session, params.id])

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <Link href="/login" className="btn-primary">تسجيل الدخول</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8" />
          <div className="card p-8 h-48" />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-400">الطلب غير موجود</h2>
          <Link href="/orders" className="btn-primary mt-4 inline-block">العودة للطلبات</Link>
        </div>
      </div>
    )
  }

  const currentStep = getStatusStep(order.status)
  const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES.PENDING

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/orders" className="hover:text-primary-600">طلباتي</Link>
          <ArrowRight size={12} />
          <span className="text-gray-800 font-medium">{order.orderNumber}</span>
        </div>

        {/* Order Header */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">طلب #{order.orderNumber}</h1>
              <p className="text-sm text-gray-500">{format(new Date(order.createdAt), 'yyyy/MM/dd HH:mm')}</p>
            </div>
            <span className={`px-4 py-2 rounded-xl text-sm font-bold ${statusInfo.color}`}>
              {statusInfo.labelAr}
            </span>
          </div>
        </div>

        {/* Progress Tracker */}
        {order.status !== 'CANCELLED' && order.status !== 'REFUNDED' && (
          <div className="card p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">تتبع الطلب</h2>
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
                      isCompleted ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' :
                      'bg-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-4 ring-primary-100' : ''}`}>
                      <step.icon size={18} />
                    </div>
                    <span className={`text-xs mt-2 font-medium ${isCompleted ? 'text-primary-600' : 'text-gray-400'} hidden sm:block`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">المنتجات</h2>
              <div className="space-y-4">
                {order.items?.map((item) => {
                  const images = item.product ? JSON.parse(item.product.images || '[]') : []
                  return (
                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {images[0] && <img src={images[0]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">
                          {item.product?.titleAr || item.product?.title || 'منتج'}
                        </p>
                        <p className="text-xs text-gray-500">الكمية: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-gray-800">${item.totalPrice.toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Status History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="card p-6 mt-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">سجل الحالات</h2>
                <div className="space-y-4">
                  {order.statusHistory.map((entry) => {
                    const info = ORDER_STATUSES[entry.status] || ORDER_STATUSES.PENDING
                    return (
                      <div key={entry.id} className="flex items-start gap-3">
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

          {/* Side Info */}
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="card p-6">
              <h3 className="font-bold text-gray-800 mb-4">ملخص المبلغ</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>المجموع</span>
                  <span>${(order.totalAmount - order.commissionAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>عمولة الخدمة</span>
                  <span>${order.commissionAmount.toFixed(2)}</span>
                </div>
                {order.shippingCost > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>الشحن</span>
                    <span>${order.shippingCost.toFixed(2)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>الإجمالي</span>
                  <span className="text-primary-600">${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={16} className="text-primary-600" />
                <h3 className="font-bold text-gray-800">عنوان الشحن</h3>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{order.shippingAddress}</p>
                <p>{order.shippingCity}، {order.shippingCountry}</p>
                <p dir="ltr" className="text-left">{order.shippingPhone}</p>
              </div>
              {order.trackingNumber && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">رقم التتبع</p>
                  <p className="text-sm font-bold text-blue-800" dir="ltr">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            {/* Payments */}
            {order.payments && order.payments.length > 0 && (
              <div className="card p-6">
                <h3 className="font-bold text-gray-800 mb-4">الدفعات</h3>
                {order.payments.map((payment) => {
                  const methodInfo = PAYMENT_METHODS[payment.method] || { labelAr: payment.method }
                  return (
                    <div key={payment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{methodInfo.labelAr}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                          payment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                          payment.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status === 'CONFIRMED' ? 'مؤكد' :
                           payment.status === 'REJECTED' ? 'مرفوض' : 'قيد المراجعة'}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-800 mt-1">${payment.amount.toFixed(2)}</p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
