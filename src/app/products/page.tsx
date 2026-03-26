'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Image from 'next/image'
import { Search, SlidersHorizontal, Star, ChevronDown, Package } from 'lucide-react'
import { ProductType } from '@/types'

const platformFilters = [
  { key: '', label: 'الكل' },
  { key: 'AMAZON', label: 'أمازون' },
  { key: 'ALIBABA', label: 'علي إكسبريس' },
  { key: 'SHEIN', label: 'شي إن' },
]

const sortOptions = [
  { key: 'newest', label: 'الأحدث' },
  { key: 'price_asc', label: 'السعر: الأقل أولاً' },
  { key: 'price_desc', label: 'السعر: الأعلى أولاً' },
  { key: 'rating', label: 'التقييم' },
]

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-pulse text-gray-400">جاري التحميل...</div></div>}>
      <ProductsContent />
    </Suspense>
  )
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<ProductType[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [platform, setPlatform] = useState(searchParams.get('platform') || '')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (platform) params.set('platform', platform)
      params.set('sort', sort)
      params.set('page', page.toString())
      params.set('limit', '12')

      const res = await fetch(`/api/products?${params.toString()}`)
      const data = await res.json()
      setProducts(data.products || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [platform, sort, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">المنتجات</h1>
          <p className="text-gray-500">تصفح أفضل المنتجات من المتاجر العالمية</p>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن منتج..."
                  className="input-field pr-10"
                />
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Platform filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <SlidersHorizontal size={16} className="text-gray-400" />
              {platformFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => { setPlatform(f.key); setPage(1) }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    platform === f.key
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1) }}
                className="input-field !w-auto pr-10 pl-4 appearance-none text-sm"
              >
                {sortOptions.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-400 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-400">جرب تغيير معايير البحث أو التصفية</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const images = JSON.parse(product.images || '[]')
                return (
                  <Link key={product.id} href={`/products/${product.id}`} className="group card hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {images[0] ? (
                        <Image src={images[0]} alt={product.titleAr || product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package size={48} />
                        </div>
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
                      <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 text-sm">{product.titleAr || product.title}</h3>
                      {product.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          <Star size={12} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-gray-600">{product.rating}</span>
                          <span className="text-xs text-gray-400">({product.reviewCount})</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-black text-primary-600">${product.price}</span>
                          {product.originalPrice > product.price && (
                            <span className="text-xs text-gray-400 line-through mr-2">${product.originalPrice}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-10 h-10 rounded-xl font-medium transition-all ${
                      page === p
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
