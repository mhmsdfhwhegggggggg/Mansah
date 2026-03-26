import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { paymentCreateSchema } from '@/lib/validations'

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
    const parsed = paymentCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'بيانات غير صالحة' },
        { status: 400 }
      )
    }
    const {
      orderId, amount, currency, method,
      receiptImage, bankName, accountNumber, senderName, notes
    } = parsed.data

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // Verify the order belongs to the current user
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'غير مصرح - هذا الطلب لا يخصك' }, { status: 403 })
    }

    const payment = await prisma.payment.create({
      data: {
        orderId,
        userId: session.user.id,
        amount,
        currency: currency || order.currency,
        method,
        status: 'PENDING',
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

    // Stripe payments require server-side verification via webhook
    // All payments start as PENDING and must be confirmed by admin or webhook

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    console.error('Payment create error:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الدفعة' }, { status: 500 })
  }
}
