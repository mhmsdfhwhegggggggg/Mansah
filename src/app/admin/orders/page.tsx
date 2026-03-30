'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/layout/Navbar'
import { Package, Eye, CheckCircle2, XCircle, ChevronDown } from 'lucide-react'
import { OrderType } from '@/types'
import { ORDER_STATUSES, getStatusStep } from '@/lib/utils'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const statusFilters = [
  { key: '', label: 'الكل' },
  { key: 'PENDING', label: 'معلق' },
  { key: 'PAYMENT_CONFIRMED', label: 'مدفوع' },
  { key: 'PURCHASING', label: 'جاري الشراء' },
  { key: 'PURCHASED', label: 'تم الشراء' },
  { key: 'SHIPPING', label: 'جاري الشحن' },
  { key: 'DELIVERED', label: 'مسلم' },
  { key: 'CANCELLED', label: 'ملغي' },
]

export default function AdminOrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<OrderType[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null)
  const [newStatus, setNewStatus] = useState('')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      params.set('limit', '50')
      const res = await fetch(`/api/orders?${params.toString()}`)
      const data = await res.json()
      setOrders(data.orders || [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') fetchOrders()
  }, [session, statusFilter])

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        toast.success('تم تحديث حالة الطلب')
        fetchOrders()
        setSelectedOrder(null)
      } else {
        toast.error('حدث خطأ')
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-800">غير مصرح</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">إدارة الطلبات</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => setStatusFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === f.key ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Package size={48} className="mx-auto mb-2" />
              <p>لا توجد طلبات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">رقم الطلب</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">العميل</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">المنتجات</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">المبلغ</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">الحالة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">التاريخ</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES.PENDING
                    return (
                      <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-xs">{order.orderNumber}</td>
                        <td className="py-3 px-4">
                          <p className="font-medium">{order.user?.name}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-500">{order.items?.length || 0} منتج</td>
                        <td className="py-3 px-4 font-bold">${order.totalAmount.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                            {statusInfo.labelAr}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          {format(new Date(order.createdAt), 'yyyy/MM/dd')}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => { setSelectedOrder(order); setNewStatus(order.status) }}
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-600"
                              title="تحديث الحالة"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Update Status Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-800 mb-4">تحديث حالة الطلب</h3>
              <p className="text-sm text-gray-500 mb-4">طلب #{selectedOrder.orderNumber}</p>

              <div className="relative mb-6">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="input-field appearance-none pr-4"
                >
                  {Object.entries(ORDER_STATUSES)
                    .filter(([key]) => {
                      if (!selectedOrder) return true
                      if (key === 'CANCELLED' || key === 'REFUNDED') return true
                      const currentStep = getStatusStep(selectedOrder.status)
                      const targetStep = getStatusStep(key)
                      return targetStep >= currentStep || targetStep === -1
                    })
                    .map(([key, val]) => (
                    <option key={key} value={key}>{val.labelAr}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleUpdateStatus(selectedOrder.id, newStatus)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  تحديث
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <XCircle size={16} />
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
