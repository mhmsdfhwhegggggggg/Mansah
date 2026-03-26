'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Package, Eye, Clock } from 'lucide-react'
import { OrderType } from '@/types'
import { ORDER_STATUSES } from '@/lib/utils'
import { format } from 'date-fns'

export default function OrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<OrderType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session) return
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data.orders || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session])

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">يجب تسجيل الدخول</h2>
          <Link href="/auth/login" className="btn-primary">تسجيل الدخول</Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">طلباتي</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">لا توجد طلبات</h3>
            <p className="text-gray-400 mb-8">لم تقم بأي طلبات بعد</p>
            <Link href="/products" className="btn-primary">ابدأ التسوق</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES.PENDING
              return (
                <Link key={order.id} href={`/orders/${order.id}`} className="card p-6 block hover:shadow-lg transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-800">{order.orderNumber}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                          {statusInfo.labelAr}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {format(new Date(order.createdAt), 'yyyy/MM/dd')}
                        </span>
                        <span>{order.items?.length || 0} منتج</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <p className="text-2xl font-black text-primary-600">${order.totalAmount.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{order.currency}</p>
                      </div>
                      <Eye size={20} className="text-gray-400" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
