import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json({ order })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Track order error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
