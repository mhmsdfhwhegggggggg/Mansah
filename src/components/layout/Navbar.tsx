'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import { ShoppingCart, User, Menu, X, Search, Package, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react'
import { useCartStore } from '@/store/cart'

export default function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const cartItemCount = useCartStore((s) => s.getItemCount())

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <nav className="sticky top-0 z-50 glass shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">م</span>
            </div>
            <span className="text-xl font-bold text-gray-800">منصة</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="ابحث عن منتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
              />
              <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600">
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Nav Items */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/products" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
              المنتجات
            </Link>
            <Link href="/track" className="text-gray-600 hover:text-primary-600 font-medium transition-colors flex items-center gap-1">
              <Package size={16} />
              تتبع الطلب
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors">
              <ShoppingCart size={22} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 gradient-bg rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{session.user.name?.[0]}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{session.user.name}</span>
                  <ChevronDown size={14} />
                </button>

                {userMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fadeIn">
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                      <Package size={16} />
                      طلباتي
                    </Link>
                    {(session.user.role === 'ADMIN') && (
                      <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                        <LayoutDashboard size={16} />
                        لوحة التحكم
                      </Link>
                    )}
                    {(session.user.role === 'AGENT') && (
                      <Link href="/agent" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>
                        <LayoutDashboard size={16} />
                        لوحة المندوب
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={() => { signOut(); setUserMenuOpen(false) }}
                      className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                    >
                      <LogOut size={16} />
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="btn-primary text-sm !px-4 !py-2">
                تسجيل الدخول
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fadeIn">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن منتجات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 rounded-xl border border-gray-200 focus:border-primary-500 outline-none"
                />
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search size={18} />
                </button>
              </div>
            </form>
            <div className="flex flex-col gap-2">
              <Link href="/products" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>المنتجات</Link>
              <Link href="/track" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>تتبع الطلب</Link>
              <Link href="/cart" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                <ShoppingCart size={16} /> السلة {cartItemCount > 0 && `(${cartItemCount})`}
              </Link>
              {session ? (
                <>
                  <Link href="/orders" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>طلباتي</Link>
                  {session.user.role === 'ADMIN' && <Link href="/admin" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>لوحة التحكم</Link>}
                  {session.user.role === 'AGENT' && <Link href="/agent" className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(false)}>لوحة المندوب</Link>}
                  <button onClick={() => signOut()} className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-right">تسجيل الخروج</button>
                </>
              ) : (
                <Link href="/auth/login" className="btn-primary text-center text-sm" onClick={() => setMobileMenuOpen(false)}>تسجيل الدخول</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
