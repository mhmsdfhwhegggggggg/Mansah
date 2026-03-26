import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        reviews: {
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'المنتج غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المنتج' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const body = await request.json()
    const { title, titleAr, description, descriptionAr, price, originalPrice, currency, images, sourceUrl, sourcePlatform, categoryId, rating, reviewCount, specifications, shippingWeight, isFeatured, inStock, isActive } = body

    const updateData: Record<string, unknown> = {}
    if (title !== undefined) updateData.title = title
    if (titleAr !== undefined) updateData.titleAr = titleAr
    if (description !== undefined) updateData.description = description
    if (descriptionAr !== undefined) updateData.descriptionAr = descriptionAr
    if (price !== undefined) updateData.price = price
    if (originalPrice !== undefined) updateData.originalPrice = originalPrice
    if (currency !== undefined) updateData.currency = currency
    if (images !== undefined) updateData.images = typeof images === 'string' ? images : JSON.stringify(images)
    if (sourceUrl !== undefined) updateData.sourceUrl = sourceUrl
    if (sourcePlatform !== undefined) updateData.sourcePlatform = sourcePlatform
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (rating !== undefined) updateData.rating = rating
    if (reviewCount !== undefined) updateData.reviewCount = reviewCount
    if (specifications !== undefined) updateData.specifications = specifications ? JSON.stringify(specifications) : null
    if (shippingWeight !== undefined) updateData.shippingWeight = shippingWeight
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured
    if (inStock !== undefined) updateData.inStock = inStock
    if (isActive !== undefined) updateData.isActive = isActive

    const product = await prisma.product.update({
      where: { id: params.id },
      data: updateData,
      include: { category: true },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Product update error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث المنتج' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    await prisma.product.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({ message: 'تم حذف المنتج بنجاح' })
  } catch (error) {
    console.error('Product delete error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف المنتج' },
      { status: 500 }
    )
  }
}
