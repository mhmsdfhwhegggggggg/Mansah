'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { Package, Users, CreditCard, ShoppingBag, TrendingUp, Clock, CheckCircle2, AlertCircle, ClipboardList } from 'lucide-react'
import { ORDER_STATUSES } from '@/lib/utils'
import { format } from 'date-fns'

interface Stats {
  totalOrders: number
  pendingOrders: number
  confirmedPayments: number
  pendingPayments: number
  totalProducts: number
  totalUsers: number
  totalAgents: number
  pendingTasks: number
  totalRevenue: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  status: string
  totalAmount: number
  createdAt: string
  user: { name: string; email: string }
  payments: Array<{ status: string; method: string }>
}

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session || session.user.role !== 'ADMIN') return
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data.stats)
        setRecentOrders(data.recentOrders || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [session])

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">غير مصرح</h2>
          <p className="text-gray-500">هذه الصفحة للمديرين فقط</p>
        </div>
      </div>
    )
  }

  const statCards = stats ? [
    { label: 'إجمالي الطلبات', value: stats.totalOrders, icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'طلبات معلقة', value: stats.pendingOrders, icon: Clock, color: 'bg-yellow-500' },
    { label: 'الإيرادات', value: `$${stats.totalRevenue.toFixed(0)}`, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'دفعات بانتظار التأكيد', value: stats.pendingPayments, icon: CreditCard, color: 'bg-orange-500' },
    { label: 'المنتجات', value: stats.totalProducts, icon: Package, color: 'bg-purple-500' },
    { label: 'العملاء', value: stats.totalUsers, icon: Users, color: 'bg-indigo-500' },
    { label: 'المندوبين', value: stats.totalAgents, icon: Users, color: 'bg-teal-500' },
    { label: 'مهام معلقة', value: stats.pendingTasks, icon: ClipboardList, color: 'bg-red-500' },
  ] : []

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">لوحة التحكم</h1>
            <p className="text-gray-500 mt-1">مرحباً، {session.user.name}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/orders" className="btn-secondary !py-2 !px-4 text-sm">إدارة الطلبات</Link>
            <Link href="/admin/payments" className="btn-secondary !py-2 !px-4 text-sm">إدارة المدفوعات</Link>
            <Link href="/admin/products" className="btn-secondary !py-2 !px-4 text-sm">إدارة المنتجات</Link>
            <Link href="/admin/tasks" className="btn-secondary !py-2 !px-4 text-sm">إدارة المهام</Link>
            <Link href="/admin/users" className="btn-secondary !py-2 !px-4 text-sm">المستخدمين</Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <div key={index} className="card p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <stat.icon size={22} className="text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800">أحدث الطلبات</h2>
                <Link href="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  عرض الكل
                </Link>
              </div>

              {recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-right py-3 px-4 font-medium text-gray-500">رقم الطلب</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">العميل</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">المبلغ</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">الحالة</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">الدفع</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-500">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => {
                        const statusInfo = ORDER_STATUSES[order.status] || ORDER_STATUSES.PENDING
                        const paymentStatus = order.payments[0]?.status || 'PENDING'
                        return (
                          <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-3 px-4 font-mono text-xs">{order.orderNumber}</td>
                            <td className="py-3 px-4">
                              <p className="font-medium">{order.user.name}</p>
                              <p className="text-xs text-gray-400">{order.user.email}</p>
                            </td>
                            <td className="py-3 px-4 font-bold">${order.totalAmount.toFixed(2)}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusInfo.color}`}>
                                {statusInfo.labelAr}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                paymentStatus === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {paymentStatus === 'CONFIRMED' ? 'مؤكد' : 'معلق'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-500 text-xs">{format(new Date(order.createdAt), 'MM/dd HH:mm')}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <ShoppingBag size={32} className="mx-auto mb-2" />
                  <p>لا توجد طلبات بعد</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
