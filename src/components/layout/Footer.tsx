import Link from 'next/link'
import { Package, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* About */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">م</span>
              </div>
              <span className="text-xl font-bold text-white">منصة</span>
            </div>
            <p className="text-sm leading-relaxed">
              منصة وساطة إلكترونية تمكنك من التسوق من أكبر المتاجر العالمية بطرق دفع محلية وشحن مباشر إلى بابك.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-4">روابط سريعة</h4>
            <ul className="space-y-2">
              <li><Link href="/products" className="hover:text-primary-400 transition-colors text-sm">المنتجات</Link></li>
              <li><Link href="/products?platform=AMAZON" className="hover:text-primary-400 transition-colors text-sm">أمازون</Link></li>
              <li><Link href="/products?platform=SHEIN" className="hover:text-primary-400 transition-colors text-sm">شي إن</Link></li>
              <li><Link href="/products?platform=ALIBABA" className="hover:text-primary-400 transition-colors text-sm">علي إكسبريس</Link></li>
              <li><Link href="/track" className="hover:text-primary-400 transition-colors text-sm">تتبع الطلب</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold mb-4">الدعم</h4>
            <ul className="space-y-2">
              <li><Link href="/how-it-works" className="hover:text-primary-400 transition-colors text-sm">كيف نعمل؟</Link></li>
              <li><Link href="/faq" className="hover:text-primary-400 transition-colors text-sm">الأسئلة الشائعة</Link></li>
              <li><Link href="/return-policy" className="hover:text-primary-400 transition-colors text-sm">سياسة الإرجاع</Link></li>
              <li><Link href="/terms" className="hover:text-primary-400 transition-colors text-sm">شروط الاستخدام</Link></li>
              <li><Link href="/privacy" className="hover:text-primary-400 transition-colors text-sm">سياسة الخصوصية</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-4">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Mail size={14} className="text-primary-400" />
                <span>support@mansah.com</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone size={14} className="text-primary-400" />
                <span dir="ltr">+967 XXX XXX XXX</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-primary-400" />
                <span>اليمن - صنعاء</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} منصة - Mansah. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Package size={14} />
            <span>تسوق عالمي بدفع محلي</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
