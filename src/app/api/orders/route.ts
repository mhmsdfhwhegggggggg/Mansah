import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { generateOrderNumber } from '@/lib/utils'
import { orderCreateSchema } from '@/lib/validations'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100)
    const status = searchParams.get('status') || ''

    const where: Record<string, unknown> = {}

    if (session.user.role === 'CUSTOMER') {
      where.userId = session.user.id
    }

    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          items: { include: { product: true } },
          payments: true,
          tasks: { include: { agent: { select: { id: true, name: true } } } },
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    logger.error('Orders fetch error', error, 'orders')
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الطلبات' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Rate limit: 10 requests per minute
    const ip = getClientIp(request)
    const rateLimitResult = await checkRateLimit(`orderCreate:${ip}`, RATE_LIMITS.orderCreate)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'عدد كبير من المحاولات. يرجى المحاولة لاحقاً' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = orderCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'بيانات غير صالحة' },
        { status: 400 }
      )
    }
    const {
      items, shippingAddress, shippingCity, shippingCountry,
      shippingPhone, currency, exchangeRate, notes
    } = parsed.data

    const commissionRate = parseFloat(process.env.NEXT_PUBLIC_COMMISSION_RATE || '0.05')

    let totalAmount = 0
    const orderItems = []

    for (const item of items) {
      let product = await prisma.product.findUnique({ where: { id: item.productId } })
      
      // If it's a freshly scraped product, save it to DB on the fly!
      if (!product && item.productId.startsWith('scrape_') && item.scrapedProduct) {
         product = await prisma.product.create({
            data: {
               title: item.scrapedProduct.title,
               titleAr: item.scrapedProduct.titleAr,
               price: item.scrapedProduct.price,
               originalPrice: item.scrapedProduct.originalPrice || item.scrapedProduct.price,
               currency: 'USD',
               images: JSON.stringify([item.scrapedProduct.image]),
               sourcePlatform: item.scrapedProduct.sourcePlatform as any,
               sourceUrl: item.scrapedProduct.sourceUrl,
               isActive: true,
            }
         })
         // Update item's productId to the newly generated DB ID
         item.productId = product.id
      }

      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `المنتج ${item.productId} غير متوفر` },
          { status: 400 }
        )
      }

      const itemTotal = product.price * item.quantity
      totalAmount += itemTotal
      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
        totalPrice: itemTotal,
        sourceUrl: product.sourceUrl,
      })
    }

    const commissionAmount = Math.round(totalAmount * commissionRate * 100) / 100
    const finalTotal = totalAmount + commissionAmount
    const rate = exchangeRate || 1

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        status: 'PENDING',
        totalAmount: finalTotal * rate,
        commissionAmount: commissionAmount * rate,
        shippingCost: 0,
        currency: currency || 'USD',
        exchangeRate: rate,
        shippingAddress,
        shippingCity,
        shippingCountry,
        shippingPhone,
        notes,
        items: { create: orderItems },
        statusHistory: {
          create: {
            status: 'PENDING',
            note: 'تم إنشاء الطلب',
            createdBy: session.user.id,
          },
        },
      },
      include: {
        items: { include: { product: true } },
        statusHistory: true,
      },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    logger.error('Order create error', error, 'orders')
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الطلب' }, { status: 500 })
  }
}
