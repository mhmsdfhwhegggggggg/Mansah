'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/layout/Navbar'
import { Users, Shield, UserCheck, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface UserData {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  country: string | null
  city: string | null
  isActive: boolean
  createdAt: string
  _count: { orders: number; tasks: number }
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (roleFilter) params.set('role', roleFilter)
      const res = await fetch(`/api/admin/users?${params.toString()}`)
      const data = await res.json()
      setUsers(data.users || [])
    } catch {
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') fetchUsers()
  }, [session, roleFilter])

  const handleRoleChange = async (userId: string, role: string) => {
    if (!window.confirm(`هل أنت متأكد من تغيير صلاحية المستخدم؟`)) return
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      })
      if (res.ok) {
        toast.success('تم تحديث الصلاحية')
        fetchUsers()
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  if (!session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50"><Navbar /><div className="max-w-lg mx-auto px-4 py-20 text-center"><h2 className="text-2xl font-bold text-gray-800">غير مصرح</h2></div></div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">إدارة المستخدمين</h1>

        <div className="flex gap-2 mb-6">
          {[
            { key: '', label: 'الكل' },
            { key: 'CUSTOMER', label: 'العملاء' },
            { key: 'AGENT', label: 'المندوبين' },
            { key: 'ADMIN', label: 'المديرين' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setRoleFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                roleFilter === f.key ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">الاسم</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">البريد</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">الهاتف</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">الدولة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">الصلاحية</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">الطلبات</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">التاريخ</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">تغيير الصلاحية</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{user.name}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs" dir="ltr">{user.email}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs" dir="ltr">{user.phone || '-'}</td>
                      <td className="py-3 px-4 text-gray-500">{user.country || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          user.role === 'AGENT' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role === 'ADMIN' ? 'مدير' :
                           user.role === 'AGENT' ? 'مندوب' : 'عميل'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{user._count.orders}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{format(new Date(user.createdAt), 'yyyy/MM/dd')}</td>
                      <td className="py-3 px-4">
                        <div className="relative">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1 appearance-none pr-2 pl-6"
                          >
                            <option value="CUSTOMER">عميل</option>
                            <option value="AGENT">مندوب</option>
                            <option value="ADMIN">مدير</option>
                          </select>
                          <ChevronDown size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
