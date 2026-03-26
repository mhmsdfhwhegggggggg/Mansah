import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    // Rate limit: 20 requests per minute
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(`track:${ip}`, RATE_LIMITS.track)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'عدد كبير من المحاولات. يرجى المحاولة لاحقاً' },
        { status: 429 }
      )
    }

    // Require authentication to prevent IDOR
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const orderNumber = searchParams.get('orderNumber')

    if (!orderNumber) {
      return NextResponse.json({ error: 'رقم الطلب مطلوب' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        totalAmount: true,
        currency: true,
        trackingNumber: true,
        estimatedDelivery: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            price: true,
            product: { select: { title: true, titleAr: true, images: true } },
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          select: { status: true, note: true, createdAt: true },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // Customers can only track their own orders
    if (session.user.role === 'CUSTOMER' && order.userId !== session.user.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    // Remove userId from response to avoid leaking user info
    const { userId: _userId, ...safeOrder } = order
    return NextResponse.json({ order: safeOrder })
  } catch (error) {
    logger.error('Track order error', error, 'track')
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
