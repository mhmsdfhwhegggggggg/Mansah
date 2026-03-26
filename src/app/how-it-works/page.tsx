import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Search, CreditCard, Package, Truck } from 'lucide-react'

export default function HowItWorksPage() {
  const steps = [
    { icon: Search, title: 'تصفح المنتجات', desc: 'ابحث عن المنتجات التي تريدها من أمازون وعلي إكسبريس وشي إن.' },
    { icon: CreditCard, title: 'ادفع بطريقتك', desc: 'اختر طريقة الدفع المحلية المناسبة لك: تحويل بنكي، محفظة إلكترونية، أو بطاقة ائتمان.' },
    { icon: Package, title: 'نشتري لك', desc: 'فريقنا يقوم بشراء المنتج من المتجر الأصلي نيابة عنك.' },
    { icon: Truck, title: 'نوصل إليك', desc: 'نشحن المنتج مباشرة إلى عنوانك مع إمكانية تتبع الشحنة.' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">كيف نعمل؟</h1>
        <p className="text-gray-500 text-center mb-12">أربع خطوات بسيطة للحصول على منتجاتك المفضلة من أي مكان في العالم</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="card p-6 text-center">
              <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                <step.icon size={28} className="text-white" />
              </div>
              <div className="text-sm font-bold text-primary-600 mb-2">الخطوة {i + 1}</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
