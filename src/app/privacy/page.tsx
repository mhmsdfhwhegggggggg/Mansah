import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية | منصة',
  description: 'سياسة الخصوصية وحماية البيانات في منصة للتسوق الإلكتروني',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">سياسة الخصوصية</h1>
        <div className="card p-8 prose prose-lg max-w-none" dir="rtl">
          <h2 className="text-xl font-bold text-gray-800 mb-4">1. جمع المعلومات</h2>
          <p className="text-gray-600 mb-6">نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حساب أو تقديم طلب، بما في ذلك الاسم والبريد الإلكتروني ورقم الهاتف وعنوان الشحن.</p>

          <h2 className="text-xl font-bold text-gray-800 mb-4">2. استخدام المعلومات</h2>
          <p className="text-gray-600 mb-6">نستخدم معلوماتك لمعالجة الطلبات والتواصل معك بشأن حالة طلباتك وتحسين خدماتنا.</p>

          <h2 className="text-xl font-bold text-gray-800 mb-4">3. حماية المعلومات</h2>
          <p className="text-gray-600 mb-6">نتخذ إجراءات أمنية مناسبة لحماية معلوماتك الشخصية من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف.</p>

          <h2 className="text-xl font-bold text-gray-800 mb-4">4. مشاركة المعلومات</h2>
          <p className="text-gray-600 mb-6">لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة إلا عند الضرورة لتنفيذ طلباتك أو عندما يقتضي القانون ذلك.</p>

          <h2 className="text-xl font-bold text-gray-800 mb-4">5. حقوقك</h2>
          <p className="text-gray-600 mb-6">يحق لك طلب الوصول إلى بياناتك الشخصية أو تصحيحها أو حذفها في أي وقت عن طريق التواصل معنا.</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
