'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Package, Plus, Edit, Trash2, Search, Filter, ArrowLeft, Eye, EyeOff, Star } from 'lucide-react'
import toast from 'react-hot-toast'

interface Product {
  id: string
  title: string
  titleAr: string | null
  price: number
  originalPrice: number
  currency: string
  sourcePlatform: string
  inStock: boolean
  isActive: boolean
  isFeatured: boolean
  images: string
  category: { id: string; name: string; nameAr: string } | null
  createdAt: string
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    titleAr: '',
    description: '',
    descriptionAr: '',
    price: '',
    originalPrice: '',
    currency: 'USD',
    sourceUrl: '',
    sourcePlatform: 'AMAZON',
    images: '',
    inStock: true,
    isFeatured: false,
  })

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (search) params.set('search', search)
      if (platform) params.set('platform', platform)
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch {
      toast.error('خطأ في تحميل المنتجات')
    } finally {
      setLoading(false)
    }
  }, [page, search, platform])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
      return
    }
    if (session?.user?.role !== 'ADMIN') {
      router.push('/')
      return
    }
    fetchProducts()
  }, [status, session, router, fetchProducts])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const body = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.originalPrice),
        images: formData.images || '["https://via.placeholder.com/400"]',
      }

      const url = editProduct ? `/api/products/${editProduct.id}` : '/api/products'
      const method = editProduct ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'حدث خطأ')
        return
      }

      toast.success(editProduct ? 'تم تحديث المنتج' : 'تم إضافة المنتج')
      setShowAddModal(false)
      setEditProduct(null)
      resetForm()
      fetchProducts()
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        toast.error('خطأ في حذف المنتج')
        return
      }
      toast.success('تم حذف المنتج')
      fetchProducts()
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const handleEdit = (product: Product) => {
    setEditProduct(product)
    setFormData({
      title: product.title,
      titleAr: product.titleAr || '',
      description: '',
      descriptionAr: '',
      price: product.price.toString(),
      originalPrice: product.originalPrice.toString(),
      currency: product.currency,
      sourceUrl: '',
      sourcePlatform: product.sourcePlatform,
      images: product.images,
      inStock: product.inStock,
      isFeatured: product.isFeatured,
    })
    setShowAddModal(true)
  }

  const resetForm = () => {
    setFormData({
      title: '',
      titleAr: '',
      description: '',
      descriptionAr: '',
      price: '',
      originalPrice: '',
      currency: 'USD',
      sourceUrl: '',
      sourcePlatform: 'AMAZON',
      images: '',
      inStock: true,
      isFeatured: false,
    })
  }

  const toggleActive = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      })
      if (res.ok) {
        toast.success(product.isActive ? 'تم إلغاء تفعيل المنتج' : 'تم تفعيل المنتج')
        fetchProducts()
      }
    } catch {
      toast.error('حدث خطأ')
    }
  }

  const getFirstImage = (images: string) => {
    try {
      const arr = JSON.parse(images)
      return Array.isArray(arr) ? arr[0] : 'https://via.placeholder.com/100'
    } catch {
      return 'https://via.placeholder.com/100'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="text-gray-400 hover:text-gray-600">
                <ArrowLeft size={20} />
              </Link>
              <Package className="text-primary-600" size={24} />
              <h1 className="text-xl font-bold text-gray-800">إدارة المنتجات</h1>
            </div>
            <button
              onClick={() => { resetForm(); setEditProduct(null); setShowAddModal(true) }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              إضافة منتج
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="input-field pr-10 w-full"
            />
          </div>
          <div className="relative">
            <Filter size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={platform}
              onChange={(e) => { setPlatform(e.target.value); setPage(1) }}
              className="input-field pr-10 appearance-none min-w-[160px]"
            >
              <option value="">كل المنصات</option>
              <option value="AMAZON">Amazon</option>
              <option value="ALIBABA">Alibaba</option>
              <option value="SHEIN">Shein</option>
              <option value="OTHER">أخرى</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">المنتج</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">السعر</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">المنصة</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">الحالة</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">مميز</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={getFirstImage(product.images)}
                          alt={product.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{product.title}</p>
                          {product.category && (
                            <p className="text-xs text-gray-500">{product.category.nameAr}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-gray-800">${product.price}</p>
                      {product.originalPrice > product.price && (
                        <p className="text-xs text-gray-400 line-through">${product.originalPrice}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                        {product.sourcePlatform}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => toggleActive(product)} className="flex items-center gap-1">
                        {product.isActive ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <Eye size={14} /> مفعل
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-sm">
                            <EyeOff size={14} /> معطل
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      {product.isFeatured && <Star size={16} className="text-yellow-500 fill-yellow-500" />}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      لا توجد منتجات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 p-4 border-t">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded text-sm ${p === page ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج (إنجليزي)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج (عربي)</label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">الوصف (إنجليزي)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field min-h-[80px]"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر الأصلي</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">العملة</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="input-field appearance-none"
                  >
                    <option value="USD">USD</option>
                    <option value="YER">YER</option>
                    <option value="SAR">SAR</option>
                    <option value="AED">AED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المنصة المصدر</label>
                  <select
                    value={formData.sourcePlatform}
                    onChange={(e) => setFormData({ ...formData, sourcePlatform: e.target.value })}
                    className="input-field appearance-none"
                  >
                    <option value="AMAZON">Amazon</option>
                    <option value="ALIBABA">Alibaba</option>
                    <option value="SHEIN">Shein</option>
                    <option value="OTHER">أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رابط المنتج الأصلي</label>
                  <input
                    type="url"
                    value={formData.sourceUrl}
                    onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                    className="input-field"
                    dir="ltr"
                    required={!editProduct}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">روابط الصور (JSON Array)</label>
                <input
                  type="text"
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="input-field"
                  dir="ltr"
                  placeholder='["https://example.com/image1.jpg"]'
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-4 h-4 rounded text-primary-600"
                  />
                  <span className="text-sm text-gray-700">متوفر في المخزون</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded text-primary-600"
                  />
                  <span className="text-sm text-gray-700">منتج مميز</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editProduct ? 'تحديث المنتج' : 'إضافة المنتج'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditProduct(null) }}
                  className="px-6 py-2.5 border rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
