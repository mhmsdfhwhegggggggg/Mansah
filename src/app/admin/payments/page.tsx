'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Navbar from '@/components/layout/Navbar'
import { CreditCard, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react'
import { PaymentType } from '@/types'
import { PAYMENT_METHODS } from '@/lib/utils'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export default function AdminPaymentsPage() {
  const { data: session } = useSession()
  const [payments, setPayments] = useState<PaymentType[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<PaymentType | null>(null)

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      params.set('limit', '50')
      const res = await fetch(`/api/payments?${params.toString()}`)
      const data = await res.json()
      setPayments(data.payments || [])
    } catch {
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') fetchPayments()
  }, [session, statusFilter])

  const handleConfirm = async (paymentId: string) => {
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' }),
      })
      if (res.ok) {
        toast.success('تم تأكيد الدفع')
        fetchPayments()
        setSelectedPayment(null)
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const handleReject = async (paymentId: string, notes: string) => {
    try {
      const res = await fetch(`/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED', notes }),
      })
      if (res.ok) {
        toast.success('تم رفض الدفع')
        fetchPayments()
        setSelectedPayment(null)
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
        <h1 className="text-3xl font-bold text-gray-800 mb-8">إدارة المدفوعات</h1>

        <div className="flex gap-2 mb-6">
          {[
            { key: '', label: 'الكل' },
            { key: 'PENDING', label: 'معلقة' },
            { key: 'CONFIRMED', label: 'مؤكدة' },
            { key: 'REJECTED', label: 'مرفوضة' },
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

        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">جاري التحميل...</div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <CreditCard size={48} className="mx-auto mb-2" />
              <p>لا توجد مدفوعات</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">رقم الطلب</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">العميل</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">المبلغ</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">الطريقة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">الحالة</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">التاريخ</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-500">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const methodInfo = PAYMENT_METHODS[payment.method] || { labelAr: payment.method }
                    return (
                      <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-xs">{payment.order?.orderNumber}</td>
                        <td className="py-3 px-4">{payment.user?.name}</td>
                        <td className="py-3 px-4 font-bold">${payment.amount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-gray-500">{methodInfo.labelAr}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            payment.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                            payment.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {payment.status === 'CONFIRMED' ? 'مؤكد' :
                             payment.status === 'REJECTED' ? 'مرفوض' : 'معلق'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs">
                          {format(new Date(payment.createdAt), 'yyyy/MM/dd')}
                        </td>
                        <td className="py-3 px-4">
                          {payment.status === 'PENDING' && (
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleConfirm(payment.id)} className="p-1.5 hover:bg-green-100 rounded-lg text-green-600" title="تأكيد">
                                <CheckCircle2 size={16} />
                              </button>
                              <button onClick={() => handleReject(payment.id, 'تم الرفض من الإدارة')} className="p-1.5 hover:bg-red-100 rounded-lg text-red-600" title="رفض">
                                <XCircle size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
