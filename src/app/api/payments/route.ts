import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: Record<string, unknown> = {}

    if (session.user.role === 'CUSTOMER') {
      where.userId = session.user.id
    }

    if (status) {
      where.status = status
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: { select: { id: true, orderNumber: true, status: true } },
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ])

    return NextResponse.json({
      payments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Payments fetch error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const body = await request.json()
    const {
      orderId, amount, currency, method,
      receiptImage, bankName, accountNumber, senderName, notes
    } = body

    if (!orderId || !amount || !method) {
      return NextResponse.json(
        { error: 'معرف الطلب والمبلغ وطريقة الدفع مطلوبة' },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId: session.user.id,
        amount,
        currency: currency || order.currency,
        method,
        status: method === 'STRIPE' ? 'CONFIRMED' : 'PENDING',
        receiptImage: receiptImage || null,
        bankName: bankName || null,
        accountNumber: accountNumber || null,
        senderName: senderName || null,
        notes: notes || null,
      },
      include: {
        order: { select: { id: true, orderNumber: true } },
      },
    })

    if (method === 'STRIPE') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAYMENT_CONFIRMED' },
      })
      await prisma.orderStatus.create({
        data: {
          orderId,
          status: 'PAYMENT_CONFIRMED',
          note: 'تم تأكيد الدفع عبر بطاقة الائتمان',
          createdBy: session.user.id,
        },
      })
    }

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    console.error('Payment create error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الدفعة' }, { status: 500 })
  }
}
