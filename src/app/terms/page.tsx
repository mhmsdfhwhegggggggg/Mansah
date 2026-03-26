import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">شروط الاستخدام</h1>
        <div className="card p-8 prose prose-lg max-w-none" dir="rtl">
          <h2 className="text-xl font-bold text-gray-800 mb-4">1. القبول بالشروط</h2>
          <p className="text-gray-600 mb-6">باستخدامك لمنصة &quot;منصة&quot; فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.</p>

          <h2 className="text-xl font-bold text-gray-800 mb-4">2. وصف الخدمة</h2>
          <p className="text-gray-600 mb-6">منصة هي خدمة وساطة إلكترونية تتيح للعملاء المحليين شراء المنتجات من المتاجر العالمية مثل أمازون وعلي إكسبريس وشي إن باستخدام وسائل الدفع المحلية.</p>

          <h2 className="text-xl font-bold text-gray-800 mb-4">3. حسابات المستخدمين</h2>
          <p className="text-gray-600 mb-6">يجب عليك تقديم معلومات دقيقة وكاملة عند إنشاء حسابك. أنت مسؤول عن الحفاظ على سرية كلمة المرور الخاصة بك وعن جميع الأنشطة التي تتم تحت حسابك.</p>

          <h2 className="text-xl font-bold text-gray-800 mb-4">4. الأسعار والرسوم</h2>
          <p className="text-gray-600 mb-6">الأسعار المعروضة هي أسعار المنتجات في المتاجر الأصلية بالإضافة إلى عمولة الخدمة (5%) وتكاليف الشحن. قد تتغير الأسعار بناءً على أسعار الصرف.</p>

          <h2 className="text-xl font-bold text-gray-800 mb-4">5. تحديد المسؤولية</h2>
          <p className="text-gray-600 mb-6">منصة هي وسيط فقط ولا تتحمل مسؤولية جودة المنتجات أو عيوب التصنيع. المسؤولية تقع على المتجر الأصلي.</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
