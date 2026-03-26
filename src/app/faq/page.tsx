import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">الأسئلة الشائعة</h1>
        <div className="space-y-4">
          {[
            { q: 'كيف أقوم بطلب منتج؟', a: 'تصفح المنتجات المتاحة، أضف ما تريده إلى السلة، ثم أكمل عملية الشراء واختر طريقة الدفع المناسبة.' },
            { q: 'ما هي طرق الدفع المتاحة؟', a: 'نقبل التحويل البنكي، المحافظ الإلكترونية، رفع إشعار الحوالة، وبطاقات الائتمان الدولية عبر Stripe.' },
            { q: 'كم تستغرق مدة التوصيل؟', a: 'تختلف مدة التوصيل حسب المنتج والمتجر الأصلي، عادة من 7 إلى 30 يوم عمل.' },
            { q: 'هل يمكنني تتبع طلبي؟', a: 'نعم، يمكنك تتبع طلبك من خلال صفحة "تتبع الطلب" باستخدام رقم الطلب الخاص بك.' },
            { q: 'ما هي عمولة الخدمة؟', a: 'عمولة الخدمة هي 5% من قيمة المنتج الأصلية.' },
            { q: 'هل يمكنني إلغاء طلبي؟', a: 'يمكنك إلغاء طلبك قبل بدء عملية الشراء من المتجر الأصلي. بعد ذلك، تطبق سياسة الإرجاع.' },
          ].map((item, i) => (
            <div key={i} className="card p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{item.q}</h3>
              <p className="text-gray-600">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
