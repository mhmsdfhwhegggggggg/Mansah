'use client'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Package } from 'lucide-react'
import { useCartStore } from '@/store/cart'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore()

  const commission = Math.round(getTotal() * 0.05 * 100) / 100
  const total = getTotal() + commission

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-400 mb-4">السلة فارغة</h2>
          <p className="text-gray-400 mb-8">لم تقم بإضافة أي منتجات بعد</p>
          <Link href="/products" className="btn-primary inline-flex items-center gap-2">
            تصفح المنتجات
            <ArrowLeft size={16} />
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">سلة التسوق</h1>
            <p className="text-gray-500 mt-1">{items.length} منتج في السلة</p>
          </div>
          <button onClick={clearCart} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1">
            <Trash2 size={14} />
            إفراغ السلة
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="card p-4 flex gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.titleAr || item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Package size={24} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{item.titleAr || item.title}</h3>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold text-white ${
                        item.sourcePlatform === 'AMAZON' ? 'bg-orange-500' :
                        item.sourcePlatform === 'SHEIN' ? 'bg-black' : 'bg-red-500'
                      }`}>
                        {item.sourcePlatform === 'AMAZON' ? 'أمازون' :
                         item.sourcePlatform === 'SHEIN' ? 'شي إن' : 'علي إكسبريس'}
                      </span>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-3 py-1.5 hover:bg-gray-100">
                        <Minus size={14} />
                      </button>
                      <span className="px-4 py-1.5 font-bold text-sm border-x border-gray-200">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-3 py-1.5 hover:bg-gray-100">
                        <Plus size={14} />
                      </button>
                    </div>
                    <span className="font-bold text-primary-600">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-800 mb-4">ملخص الطلب</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>المجموع الفرعي ({items.length} منتج)</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>عمولة الخدمة (5%)</span>
                  <span>${commission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>الشحن</span>
                  <span className="text-green-600 font-medium">يحدد لاحقاً</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold text-lg text-gray-800">
                  <span>الإجمالي</span>
                  <span className="text-primary-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <Link href="/checkout" className="btn-primary w-full text-center mt-6 flex items-center justify-center gap-2">
                إتمام الطلب
                <ArrowLeft size={16} />
              </Link>

              <Link href="/products" className="block text-center text-sm text-gray-500 hover:text-primary-600 mt-4">
                متابعة التسوق
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
