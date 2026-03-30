'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ShoppingCart, Star, ExternalLink, Minus, Plus, Shield, Truck, ArrowRight, Package } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { ProductType } from '@/types'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<ProductType | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`)
        const data = await res.json()
        setProduct(data.product)
      } catch {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.id])

  const handleAddToCart = () => {
    if (!product) return
    const images = JSON.parse(product.images || '[]')
    addItem({
      productId: product.id,
      title: product.title,
      titleAr: product.titleAr || undefined,
      price: product.price,
      originalPrice: product.originalPrice,
      image: images[0] || '',
      quantity,
      sourcePlatform: product.sourcePlatform,
      sourceUrl: product.sourceUrl,
    })
    toast.success('تمت الإضافة إلى السلة')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-10 bg-gray-200 rounded w-1/3" />
              <div className="h-20 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <Package size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-400 mb-4">المنتج غير موجود</h2>
          <Link href="/products" className="btn-primary">العودة للمنتجات</Link>
        </div>
      </div>
    )
  }

  const images = JSON.parse(product.images || '[]')
  const commissionRate = parseFloat(process.env.NEXT_PUBLIC_COMMISSION_RATE || '0.05')
  const commission = Math.round(product.price * commissionRate * 100) / 100
  const totalPrice = product.price + commission

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary-600">الرئيسية</Link>
          <ArrowRight size={12} />
          <Link href="/products" className="hover:text-primary-600">المنتجات</Link>
          <ArrowRight size={12} />
          <span className="text-gray-800 font-medium truncate max-w-xs">{product.titleAr || product.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            <div className="card overflow-hidden mb-4">
              <div className="aspect-square bg-gray-100 relative">
                {images[selectedImage] ? (
                  <Image src={images[selectedImage]} alt={product.titleAr || product.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Package size={64} />
                  </div>
                )}
              </div>
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all relative ${
                      selectedImage === index ? 'border-primary-600 shadow-lg' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold text-white mb-3 ${
                product.sourcePlatform === 'AMAZON' ? 'bg-orange-500' :
                product.sourcePlatform === 'SHEIN' ? 'bg-black' : 'bg-red-500'
              }`}>
                {product.sourcePlatform === 'AMAZON' ? 'أمازون' :
                 product.sourcePlatform === 'SHEIN' ? 'شي إن' : 'علي إكسبريس'}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{product.titleAr || product.title}</h1>
              {product.titleAr && (
                <p className="text-gray-500 text-sm" dir="ltr">{product.title}</p>
              )}
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={16} className={star <= Math.round(product.rating!) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                  ))}
                </div>
                <span className="font-bold text-gray-700">{product.rating}</span>
                <span className="text-sm text-gray-400">({product.reviewCount} تقييم)</span>
              </div>
            )}

            {/* Price */}
            <div className="card p-6 mb-6">
              <div className="flex items-end gap-3 mb-4">
                <span className="text-4xl font-black text-primary-600">${product.price}</span>
                {product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs font-bold">
                      خصم {Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </span>
                  </>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>سعر المنتج</span>
                  <span>${product.price}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>عمولة الخدمة (5%)</span>
                  <span>${commission}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-bold text-gray-800">
                  <span>الإجمالي</span>
                  <span className="text-primary-600">${totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-gray-100 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="px-6 py-3 font-bold text-lg border-x border-gray-200">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-gray-100 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary flex-1 flex items-center justify-center gap-2 text-lg !py-3.5">
                <ShoppingCart size={20} />
                أضف للسلة
              </button>
            </div>

            {/* Source Link */}
            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-8"
            >
              <ExternalLink size={14} />
              عرض المنتج في الموقع الأصلي
            </a>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                <Shield size={20} className="text-green-600" />
                <div>
                  <p className="text-sm font-bold text-green-800">ضمان الحماية</p>
                  <p className="text-xs text-green-600">حقوقك محفوظة</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                <Truck size={20} className="text-blue-600" />
                <div>
                  <p className="text-sm font-bold text-blue-800">شحن دولي</p>
                  <p className="text-xs text-blue-600">حتى بابك</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                <Star size={20} className="text-purple-600" />
                <div>
                  <p className="text-sm font-bold text-purple-800">منتج أصلي</p>
                  <p className="text-xs text-purple-600">من الموقع الرسمي</p>
                </div>
              </div>
            </div>

            {/* Description */}
            {(product.descriptionAr || product.description) && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-800 mb-3">وصف المنتج</h3>
                <p className="text-gray-600 leading-relaxed">{product.descriptionAr || product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
