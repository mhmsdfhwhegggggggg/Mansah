'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import { ClipboardList, CheckCircle2, Clock, Package, AlertCircle, Play, Eye, Truck } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface TaskData {
  id: string
  type: string
  status: string
  priority: string
  description: string | null
  sourcePlatform: string | null
  trackingNumber: string | null
  createdAt: string
  startedAt: string | null
  completedAt: string | null
  order: {
    id: string
    orderNumber: string
    totalAmount: number
    user: { name: string; phone: string | null; country: string | null; city: string | null }
    items: Array<{
      quantity: number
      product: { title: string; titleAr: string | null; sourceUrl: string; images: string }
    }>
  }
  agent: { id: string; name: string } | null
}

export default function AgentDashboard() {
  const { data: session } = useSession()
  const [tasks, setTasks] = useState<TaskData[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null)
  const [trackingNumber, setTrackingNumber] = useState('')

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      params.set('limit', '50')
      const res = await fetch(`/api/tasks?${params.toString()}`)
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch {
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session && (session.user.role === 'AGENT' || session.user.role === 'ADMIN')) {
      fetchTasks()
    }
  }, [session, statusFilter])

  const handleStartTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      })
      if (res.ok) {
        toast.success('تم بدء المهمة')
        fetchTasks()
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      const body: Record<string, string> = { status: 'COMPLETED' }
      if (trackingNumber) body.trackingNumber = trackingNumber

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        toast.success('تم إكمال المهمة')
        fetchTasks()
        setSelectedTask(null)
        setTrackingNumber('')
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  if (!session || (session.user.role !== 'AGENT' && session.user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">غير مصرح</h2>
          <p className="text-gray-500">هذه الصفحة للمندوبين فقط</p>
        </div>
      </div>
    )
  }

  const pendingCount = tasks.filter(t => t.status === 'PENDING' || t.status === 'ASSIGNED').length
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS').length
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">لوحة المندوب</h1>
          <p className="text-gray-500 mt-1">مرحباً، {session.user.name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="card p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
              <Clock size={22} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{pendingCount}</p>
              <p className="text-sm text-gray-500">مهام معلقة</p>
            </div>
          </div>
          <div className="card p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Play size={22} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{inProgressCount}</p>
              <p className="text-sm text-gray-500">قيد التنفيذ</p>
            </div>
          </div>
          <div className="card p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle2 size={22} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-800">{completedCount}</p>
              <p className="text-sm text-gray-500">مكتملة</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: '', label: 'الكل' },
            { key: 'PENDING', label: 'معلقة' },
            { key: 'ASSIGNED', label: 'مسندة' },
            { key: 'IN_PROGRESS', label: 'قيد التنفيذ' },
            { key: 'COMPLETED', label: 'مكتملة' },
          ].map((f) => (
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

        {/* Tasks List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-20">
            <ClipboardList size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-400">لا توجد مهام</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => {
              const isUrgent = task.priority === 'URGENT'
              const isPending = task.status === 'PENDING' || task.status === 'ASSIGNED'
              const isInProgress = task.status === 'IN_PROGRESS'

              return (
                <div key={task.id} className={`card p-6 ${isUrgent ? 'border-r-4 border-r-red-500' : ''}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          task.type === 'PURCHASE' ? 'bg-blue-100 text-blue-800' :
                          task.type === 'SHIP' ? 'bg-purple-100 text-purple-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {task.type === 'PURCHASE' ? 'شراء' :
                           task.type === 'SHIP' ? 'شحن' : 'تسليم'}
                        </span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                          task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status === 'COMPLETED' ? 'مكتمل' :
                           task.status === 'IN_PROGRESS' ? 'قيد التنفيذ' :
                           task.status === 'ASSIGNED' ? 'مسند' : 'معلق'}
                        </span>
                        {isUrgent && (
                          <span className="px-2 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-800">عاجل</span>
                        )}
                      </div>

                      <h3 className="font-bold text-gray-800">طلب #{task.order.orderNumber}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        العميل: {task.order.user.name} - {task.order.user.country} / {task.order.user.city}
                      </p>

                      {/* Products */}
                      <div className="mt-3 space-y-2">
                        {task.order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden flex-shrink-0 relative">
                              {JSON.parse(item.product.images || '[]')[0] && (
                                <Image src={JSON.parse(item.product.images)[0]} alt="" fill className="object-cover" sizes="40px" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-800 truncate">{item.product.titleAr || item.product.title}</p>
                              <p className="text-xs text-gray-500">الكمية: {item.quantity}</p>
                            </div>
                            <a href={item.product.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline flex-shrink-0">
                              رابط المنتج
                            </a>
                          </div>
                        ))}
                      </div>

                      <p className="text-xs text-gray-400 mt-3">
                        {format(new Date(task.createdAt), 'yyyy/MM/dd HH:mm')}
                        {task.startedAt && ` | بدأ: ${format(new Date(task.startedAt), 'HH:mm')}`}
                        {task.completedAt && ` | اكتمل: ${format(new Date(task.completedAt), 'HH:mm')}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <button
                          onClick={() => handleStartTask(task.id)}
                          className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1"
                        >
                          <Play size={14} />
                          ابدأ المهمة
                        </button>
                      )}
                      {isInProgress && (
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-green-700 flex items-center gap-1"
                        >
                          <CheckCircle2 size={14} />
                          إكمال
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Complete Task Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedTask(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-gray-800 mb-2">إكمال المهمة</h3>
              <p className="text-sm text-gray-500 mb-6">طلب #{selectedTask.order.orderNumber}</p>

              {(selectedTask.type === 'SHIP' || selectedTask.type === 'PURCHASE') && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم التتبع (اختياري)</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="input-field"
                    placeholder="أدخل رقم تتبع الشحنة"
                    dir="ltr"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleCompleteTask(selectedTask.id)}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-green-700 flex-1 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  تأكيد الإكمال
                </button>
                <button
                  onClick={() => { setSelectedTask(null); setTrackingNumber('') }}
                  className="btn-secondary flex-1"
                >
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
