import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">سياسة الإرجاع</h1>
        <div className="card p-8 prose prose-lg max-w-none" dir="rtl">
          <h2 className="text-xl font-bold text-gray-800 mb-4">1. شروط الإرجاع</h2>
          <p className="text-gray-600 mb-6">يمكن إرجاع المنتجات خلال 14 يوماً من تاريخ الاستلام بشرط أن يكون المنتج في حالته الأصلية ولم يتم استخدامه.</p>

          <h2 className="text-xl font-bold text-gray-800 mb-4">2. المنتجات غير القابلة للإرجاع</h2>
          <p className="text-gray-600 mb-6">لا يمكن إرجاع المنتجات المخصصة أو المنتجات القابلة للتلف أو منتجات العناية الشخصية بعد فتحها.</p>

          <h2 className="text-xl font-bold text-gray-800 mb-4">3. إجراءات الإرجاع</h2>
          <p className="text-gray-600 mb-6">للبدء بعملية الإرجاع، تواصل معنا عبر البريد الإلكتروني أو الهاتف وسنرشدك خلال الخطوات اللازمة.</p>

          <h2 className="text-xl font-bold text-gray-800 mb-4">4. استرداد المبالغ</h2>
          <p className="text-gray-600 mb-6">يتم استرداد المبلغ خلال 7-14 يوم عمل بعد استلام المنتج المرتجع والتحقق من حالته. عمولة الخدمة غير قابلة للاسترداد.</p>

          <h2 className="text-xl font-bold text-gray-800 mb-4">5. تكاليف الشحن</h2>
          <p className="text-gray-600 mb-6">يتحمل العميل تكاليف شحن الإرجاع إلا في حالة وجود عيب في المنتج أو خطأ في الطلب.</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
