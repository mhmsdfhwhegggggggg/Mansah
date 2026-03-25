import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const platform = searchParams.get('platform') || ''
    const category = searchParams.get('category') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sort = searchParams.get('sort') || 'newest'
    const featured = searchParams.get('featured') === 'true'

    const where: Record<string, unknown> = { isActive: true }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { titleAr: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (platform) {
      where.sourcePlatform = platform
    }

    if (category) {
      where.categoryId = category
    }

    if (featured) {
      where.isFeatured = true
    }

    const orderBy: Record<string, string> = {}
    switch (sort) {
      case 'price_asc':
        orderBy.price = 'asc'
        break
      case 'price_desc':
        orderBy.price = 'desc'
        break
      case 'rating':
        orderBy.rating = 'desc'
        break
      default:
        orderBy.createdAt = 'desc'
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المنتجات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title, titleAr, description, descriptionAr, price, originalPrice,
      currency, images, sourceUrl, sourcePlatform, categoryId,
      rating, reviewCount, specifications, shippingWeight, isFeatured
    } = body

    if (!title || !price || !sourceUrl || !sourcePlatform) {
      return NextResponse.json(
        { error: 'العنوان والسعر ورابط المصدر والمنصة مطلوبة' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        title,
        titleAr: titleAr || null,
        description: description || null,
        descriptionAr: descriptionAr || null,
        price,
        originalPrice: originalPrice || price,
        currency: currency || 'USD',
        images: typeof images === 'string' ? images : JSON.stringify(images || []),
        sourceUrl,
        sourcePlatform,
        categoryId: categoryId || null,
        rating: rating || null,
        reviewCount: reviewCount || null,
        specifications: specifications ? JSON.stringify(specifications) : null,
        shippingWeight: shippingWeight || null,
        isFeatured: isFeatured || false,
      },
      include: { category: true },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Product create error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء المنتج' },
      { status: 500 }
    )
  }
}
