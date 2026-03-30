'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ClipboardList, ArrowLeft, User, Clock, CheckCircle, AlertCircle, Play } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Task {
  id: string
  type: string
  status: string
  priority: string
  description: string | null
  trackingNumber: string | null
  startedAt: string | null
  completedAt: string | null
  createdAt: string
  order: {
    id: string
    orderNumber: string
    totalAmount: number
    currency: string
    user: { name: string; email: string }
  }
  agent: { id: string; name: string; email: string } | null
}

interface Agent {
  id: string
  name: string
  email: string
}

const taskTypeLabels: Record<string, string> = {
  PURCHASE: 'شراء',
  VERIFY_PRICE: 'تحقق من السعر',
  SHIP: 'شحن',
  DELIVER: 'توصيل',
}

const taskStatusLabels: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  ASSIGNED: 'معين',
  IN_PROGRESS: 'قيد التنفيذ',
  COMPLETED: 'مكتمل',
  FAILED: 'فشل',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  ASSIGNED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-gray-100 text-gray-600',
  NORMAL: 'bg-blue-100 text-blue-600',
  HIGH: 'bg-orange-100 text-orange-600',
  URGENT: 'bg-red-100 text-red-600',
}

export default function AdminTasksPage() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [assignModal, setAssignModal] = useState<Task | null>(null)
  const [selectedAgent, setSelectedAgent] = useState('')

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      if (typeFilter) params.set('type', typeFilter)
      const res = await fetch(`/api/tasks?${params}`)
      const data = await res.json()
      setTasks(data.tasks || [])
    } catch {
      toast.error('خطأ في تحميل المهام')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, typeFilter])

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/admin/users?role=AGENT')
      const data = await res.json()
      setAgents(data.users || [])
    } catch {
      console.error('Error fetching agents')
    }
  }

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (session?.user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    fetchTasks()
    fetchAgents()
  }, [authStatus, session, router, fetchTasks])

  const handleAssign = async () => {
    if (!assignModal || !selectedAgent) return
    try {
      const res = await fetch(`/api/tasks/${assignModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: selectedAgent, status: 'ASSIGNED' }),
      })
      if (res.ok) {
        toast.success('تم تعيين المهمة')
        setAssignModal(null)
        setSelectedAgent('')
        fetchTasks()
      } else {
        toast.error('خطأ في تعيين المهمة')
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const pendingCount = tasks.filter(t => t.status === 'PENDING').length
  const inProgressCount = tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length
  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-gray-400 hover:text-gray-600">
              <ArrowLeft size={20} />
            </Link>
            <ClipboardList className="text-primary-600" size={24} />
            <h1 className="text-xl font-bold text-gray-800">إدارة المهام</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border-r-4 border-yellow-400">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{pendingCount}</p>
                <p className="text-sm text-gray-500">قيد الانتظار</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-r-4 border-blue-400">
            <div className="flex items-center gap-3">
              <Play size={20} className="text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{inProgressCount}</p>
                <p className="text-sm text-gray-500">قيد التنفيذ</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-r-4 border-green-400">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-800">{completedCount}</p>
                <p className="text-sm text-gray-500">مكتملة</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field appearance-none min-w-[160px]"
          >
            <option value="">كل الحالات</option>
            <option value="PENDING">قيد الانتظار</option>
            <option value="ASSIGNED">معين</option>
            <option value="IN_PROGRESS">قيد التنفيذ</option>
            <option value="COMPLETED">مكتمل</option>
            <option value="FAILED">فشل</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field appearance-none min-w-[160px]"
          >
            <option value="">كل الأنواع</option>
            <option value="PURCHASE">شراء</option>
            <option value="VERIFY_PRICE">تحقق من السعر</option>
            <option value="SHIP">شحن</option>
            <option value="DELIVER">توصيل</option>
          </select>
        </div>

        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[task.status]}`}>
                      {taskStatusLabels[task.status]}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      {taskTypeLabels[task.type]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 font-medium">
                    طلب #{task.order.orderNumber} - {task.order.user.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    المبلغ: {task.order.totalAmount} {task.order.currency}
                  </p>
                  {task.description && (
                    <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                  )}
                  {task.trackingNumber && (
                    <p className="text-xs text-green-600 mt-1">رقم التتبع: {task.trackingNumber}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    {task.agent ? (
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <User size={14} />
                        {task.agent.name}
                      </span>
                    ) : (
                      <button
                        onClick={() => { setAssignModal(task); setSelectedAgent('') }}
                        className="px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100"
                      >
                        تعيين مندوب
                      </button>
                    )}
                  </div>
                  <span className="text-xs text-gray-400">
                    {format(new Date(task.createdAt), 'dd MMM yyyy', { locale: ar })}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle size={48} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">لا توجد مهام</p>
            </div>
          )}
        </div>
      </div>

      {assignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">تعيين مندوب للمهمة</h2>
            <p className="text-sm text-gray-600 mb-4">
              طلب #{assignModal.order.orderNumber} - {taskTypeLabels[assignModal.type]}
            </p>
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="input-field w-full mb-4 appearance-none"
            >
              <option value="">اختر المندوب</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name} ({agent.email})</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={handleAssign} disabled={!selectedAgent} className="btn-primary flex-1 disabled:opacity-50">
                تعيين
              </button>
              <button onClick={() => setAssignModal(null)} className="px-6 py-2.5 border rounded-xl text-gray-600 hover:bg-gray-50">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
