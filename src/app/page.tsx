'use client'

import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ShoppingBag, Shield, Truck, CreditCard, Globe, Headphones, ArrowLeft, Star, ChevronLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ProductType } from '@/types'

const platforms = [
  { name: 'Amazon', nameAr: 'أمازون', key: 'AMAZON', color: 'from-orange-400 to-orange-600', icon: '🛒' },
  { name: 'AliExpress', nameAr: 'علي إكسبريس', key: 'ALIBABA', color: 'from-red-400 to-red-600', icon: '🏪' },
  { name: 'Shein', nameAr: 'شي إن', key: 'SHEIN', color: 'from-gray-700 to-black', icon: '👗' },
]

const features = [
  { icon: Globe, title: 'تسوق عالمي', desc: 'تصفح ملايين المنتجات من أكبر المتاجر العالمية' },
  { icon: CreditCard, title: 'دفع محلي', desc: 'ادفع بالريال اليمني أو السعودي بطرق مألوفة وآمنة' },
  { icon: Truck, title: 'شحن مباشر', desc: 'نتولى الشحن الدولي والتوصيل حتى باب منزلك' },
  { icon: Shield, title: 'ضمان وحماية', desc: 'تتبع طلبك في كل مرحلة مع ضمان حقوقك الكاملة' },
  { icon: Headphones, title: 'دعم مستمر', desc: 'فريق متخصص جاهز لمساعدتك في أي وقت' },
  { icon: ShoppingBag, title: 'أسعار تنافسية', desc: 'عمولة بسيطة وأسعار صرف عادلة وشفافة' },
]

const steps = [
  { num: '1', title: 'تصفح واختر', desc: 'استعرض المنتجات من أمازون وعلي إكسبريس وشي إن واختر ما يناسبك' },
  { num: '2', title: 'أضف للسلة وادفع', desc: 'أضف المنتجات لسلتك وادفع بالريال عبر تحويل بنكي أو محفظة إلكترونية' },
  { num: '3', title: 'نشتري ونشحن', desc: 'مندوبنا يشتري المنتج من الموقع الأصلي ويشحنه لعنوانك' },
  { num: '4', title: 'استلم طلبك', desc: 'تتبع شحنتك لحظة بلحظة واستلمها عند بابك' },
]

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductType[]>([])

  useEffect(() => {
    fetch('/api/products?featured=true&limit=6')
      .then(res => res.json())
      .then(data => setFeaturedProducts(data.products || []))
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-bg text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm mb-8 backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              SBN جاهزة للاستخدام
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              تسوق من العالم
              <br />
              <span className="text-primary-200">وادفع بعملتك المحلية</span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              SBN منصة وساطة إلكترونية تمكنك من شراء أي منتج من أمازون وعلي إكسبريس وشي إن
              بطرق دفع محلية وتوصيل مباشر إلى بابك
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/products" className="bg-white text-primary-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl shadow-black/20 flex items-center gap-2">
                ابدأ التسوق الآن
                <ArrowLeft size={20} />
              </Link>
              <Link href="/track" className="border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm">
                تتبع طلبك
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">تسوق من أكبر المتاجر العالمية</h2>
            <p className="text-gray-500">اختر المتجر وابدأ تصفح المنتجات</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <Link
                key={platform.key}
                href={`/portal/${platform.name.toLowerCase()}`}
                className="group card p-8 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-20 h-20 mx-auto mb-4 bg-gradient-to-br ${platform.color} rounded-2xl flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform`}>
                  {platform.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{platform.nameAr}</h3>
                <p className="text-gray-500 text-sm">{platform.name}</p>
                <div className="mt-4 flex items-center justify-center text-primary-600 font-bold text-sm group-hover:gap-2 transition-all">
                  الدخول للبوابة المباشرة 🚀
                  <ChevronLeft size={16} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">كيف تعمل SBN؟</h2>
            <p className="text-gray-500">أربع خطوات بسيطة للتسوق من العالم</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="w-16 h-16 mx-auto mb-6 gradient-bg rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary-600/30">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 -left-4 w-8 text-gray-300">
                    <ChevronLeft size={24} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">منتجات مميزة</h2>
                <p className="text-gray-500">أحدث المنتجات المختارة لك</p>
              </div>
              <Link href="/products" className="btn-secondary !py-2 !px-4 text-sm flex items-center gap-1">
                عرض الكل
                <ArrowLeft size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => {
                const images = typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (Array.isArray(product.images) ? product.images : [])
                return (
                  <Link key={product.id} href={`/products/${product.id}`} className="group card hover:shadow-xl transition-all duration-300">
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {images[0] && (
                        <Image src={images[0]} alt={product.titleAr || product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 100vw, 33vw" />
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold text-white ${
                          product.sourcePlatform === 'AMAZON' ? 'bg-orange-500' :
                          product.sourcePlatform === 'SHEIN' ? 'bg-black' : 'bg-red-500'
                        }`}>
                          {product.sourcePlatform === 'AMAZON' ? 'أمازون' :
                           product.sourcePlatform === 'SHEIN' ? 'شي إن' : 'علي إكسبريس'}
                        </span>
                      </div>
                      {product.originalPrice > product.price && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                          خصم {Math.round((1 - product.price / product.originalPrice) * 100)}%
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{product.titleAr || product.title}</h3>
                      <div className="flex items-center gap-1 mb-3">
                        {product.rating && (
                          <>
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-sm text-gray-600">{product.rating}</span>
                            <span className="text-xs text-gray-400">({product.reviewCount})</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-black text-primary-600">${product.price}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-sm text-gray-400 line-through mr-2">${product.originalPrice}</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">{product.currency}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-3">لماذا تختار SBN؟</h2>
            <p className="text-gray-500">نوفر لك تجربة تسوق عالمية بجودة ومصداقية</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card p-8 hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 gradient-bg rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-primary-600/20">
                  <feature.icon size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">ابدأ التسوق العالمي الآن</h2>
          <p className="text-lg text-white/80 mb-10">
            سجل حسابك مجاناً واستمتع بالتسوق من أكبر المتاجر العالمية بطرق دفع محلية
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register" className="bg-white text-primary-700 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all shadow-xl">
              أنشئ حساب مجاني
            </Link>
            <Link href="/products" className="border-2 border-white/30 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all">
              تصفح المنتجات
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
