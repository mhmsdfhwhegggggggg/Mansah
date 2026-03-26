'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: 'اليمن',
    city: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين')
      return
    }

    if (form.password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'حدث خطأ')
        return
      }

      toast.success('تم إنشاء الحساب بنجاح! يمكنك تسجيل الدخول الآن')
      router.push('/auth/login')
    } catch {
      toast.error('حدث خطأ أثناء إنشاء الحساب')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-primary-600 font-bold text-xl">م</span>
            </div>
            <span className="text-2xl font-bold text-white">منصة</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">إنشاء حساب جديد</h1>
          <p className="text-white/60">سجل الآن وابدأ التسوق العالمي</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم الكامل</label>
              <div className="relative">
                <input type="text" name="name" value={form.name} onChange={handleChange} className="input-field pr-10" placeholder="أدخل اسمك الكامل" required />
                <User size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <input type="email" name="email" value={form.email} onChange={handleChange} className="input-field pr-10" placeholder="example@email.com" required dir="ltr" />
                <Mail size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الهاتف</label>
              <div className="relative">
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="input-field pr-10" placeholder="+967 XXX XXX XXX" dir="ltr" />
                <Phone size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">الدولة</label>
                <div className="relative">
                  <select name="country" value={form.country} onChange={handleChange} className="input-field pr-10 appearance-none">
                    <option value="اليمن">اليمن</option>
                    <option value="السعودية">السعودية</option>
                    <option value="الإمارات">الإمارات</option>
                    <option value="مصر">مصر</option>
                    <option value="الأردن">الأردن</option>
                    <option value="عمان">عمان</option>
                    <option value="البحرين">البحرين</option>
                    <option value="الكويت">الكويت</option>
                    <option value="قطر">قطر</option>
                  </select>
                  <MapPin size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">المدينة</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} className="input-field" placeholder="المدينة" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className="input-field pr-10 pl-10" placeholder="6 أحرف على الأقل" required />
                <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">تأكيد كلمة المرور</label>
              <div className="relative">
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} className="input-field pr-10" placeholder="أعد كتابة كلمة المرور" required />
                <Lock size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5 !mt-6">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={18} />
                  إنشاء الحساب
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              لديك حساب بالفعل؟{' '}
              <Link href="/auth/login" className="text-primary-600 font-medium hover:text-primary-700">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
