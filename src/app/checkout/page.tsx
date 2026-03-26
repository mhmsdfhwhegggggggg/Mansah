'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import { useCartStore } from '@/store/cart'
import { CreditCard, Building2, Smartphone, Upload, MapPin, ArrowLeft, Shield, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

const paymentMethods = [
  { key: 'BANK_TRANSFER', label: 'تحويل بنكي', icon: Building2, desc: 'حوالة إلى حسابنا البنكي' },
  { key: 'MOBILE_WALLET', label: 'محفظة إلكترونية', icon: Smartphone, desc: 'دفع عبر محفظة إلكترونية' },
  { key: 'RECEIPT_UPLOAD', label: 'رفع إشعار حوالة', icon: Upload, desc: 'ارفع صورة الإيصال بعد الدفع' },
  { key: 'STRIPE', label: 'بطاقة ائتمان/خصم', icon: CreditCard, desc: 'ادفع ببطاقتك الدولية مباشرة' },
]

export default function CheckoutPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER')
  const [shipping, setShipping] = useState({
    address: '',
    city: '',
    country: 'اليمن',
    phone: '',
  })
  const [bankInfo] = useState({
    bankName: 'البنك الأهلي اليمني',
    accountNumber: 'XXXX-XXXX-XXXX-1234',
    accountName: 'منصة للتجارة الإلكترونية',
  })

  const commission = Math.round(getTotal() * 0.05 * 100) / 100
  const total = getTotal() + commission

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">يجب تسجيل الدخول أولاً</h2>
          <p className="text-gray-500 mb-8">قم بتسجيل الدخول أو إنشاء حساب جديد لإتمام الطلب</p>
          <Link href="/auth/login" className="btn-primary">تسجيل الدخول</Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-4">السلة فارغة</h2>
          <Link href="/products" className="btn-primary">تصفح المنتجات</Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shipping.address || !shipping.city || !shipping.phone) {
      toast.error('يرجى ملء جميع بيانات الشحن')
      return
    }

    setLoading(true)

    try {
      // Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress: shipping.address,
          shippingCity: shipping.city,
          shippingCountry: shipping.country,
          shippingPhone: shipping.phone,
          currency: 'USD',
          exchangeRate: 1,
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok) {
        toast.error(orderData.error || 'حدث خطأ أثناء إنشاء الطلب')
        return
      }

      // Create payment
      const paymentRes = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.order.id,
          amount: total,
          currency: 'USD',
          method: paymentMethod,
        }),
      })

      const paymentData = await paymentRes.json()

      if (!paymentRes.ok) {
        toast.error(paymentData.error || 'حدث خطأ أثناء إنشاء الدفعة')
        return
      }

      clearCart()
      toast.success('تم إنشاء الطلب بنجاح!')
      router.push(`/orders/${orderData.order.id}`)
    } catch {
      toast.error('حدث خطأ، يرجى المحاولة مرة أخرى')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">إتمام الطلب</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Info */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin size={20} className="text-primary-600" />
                  <h2 className="text-lg font-bold text-gray-800">عنوان الشحن</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">العنوان التفصيلي</label>
                    <input
                      type="text"
                      value={shipping.address}
                      onChange={(e) => setShipping({ ...shipping, address: e.target.value })}
                      className="input-field"
                      placeholder="الشارع، الحي، رقم المبنى"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">المدينة</label>
                    <input
                      type="text"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      className="input-field"
                      placeholder="المدينة"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">الدولة</label>
                    <select
                      value={shipping.country}
                      onChange={(e) => setShipping({ ...shipping, country: e.target.value })}
                      className="input-field"
                    >
                      <option value="اليمن">اليمن</option>
                      <option value="السعودية">السعودية</option>
                      <option value="الإمارات">الإمارات</option>
                      <option value="مصر">مصر</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                      className="input-field"
                      placeholder="+967 XXX XXX XXX"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="card p-6">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard size={20} className="text-primary-600" />
                  <h2 className="text-lg font-bold text-gray-800">طريقة الدفع</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.key}
                      type="button"
                      onClick={() => setPaymentMethod(method.key)}
                      className={`p-4 rounded-xl border-2 text-right transition-all ${
                        paymentMethod === method.key
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <method.icon size={20} className={paymentMethod === method.key ? 'text-primary-600' : 'text-gray-400'} />
                        <div>
                          <p className="font-bold text-sm text-gray-800">{method.label}</p>
                          <p className="text-xs text-gray-500">{method.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Bank Transfer Info */}
                {(paymentMethod === 'BANK_TRANSFER' || paymentMethod === 'RECEIPT_UPLOAD') && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-bold text-blue-800 text-sm mb-2">معلومات الحساب البنكي:</h4>
                    <div className="space-y-1 text-sm text-blue-700">
                      <p>البنك: {bankInfo.bankName}</p>
                      <p>رقم الحساب: {bankInfo.accountNumber}</p>
                      <p>اسم الحساب: {bankInfo.accountName}</p>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      * قم بتحويل المبلغ ثم سيتم تأكيد الدفع من قبل الإدارة خلال ساعات
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-800 mb-4">ملخص الطلب</h3>

                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                        {item.image && <Image src={item.image} alt="" fill className="object-cover" sizes="48px" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.titleAr || item.title}</p>
                        <p className="text-xs text-gray-500">الكمية: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <hr className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>المجموع الفرعي</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>عمولة الخدمة (5%)</span>
                    <span>${commission.toFixed(2)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg text-gray-800">
                    <span>الإجمالي</span>
                    <span className="text-primary-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      تأكيد الطلب
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 justify-center">
                  <Shield size={14} />
                  <span>طلبك محمي وآمن 100%</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
