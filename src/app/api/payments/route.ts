import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { paymentCreateSchema } from '@/lib/validations'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100)

    const where: Record<string, unknown> = {}

    // CUSTOMER can only see their own payments, AGENT can only see payments for orders with tasks assigned to them
    if (session.user.role === 'CUSTOMER') {
      where.userId = session.user.id
    } else if (session.user.role === 'AGENT') {
      where.order = {
        tasks: {
          some: { agentId: session.user.id },
        },
      }
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
    logger.error('Payments fetch error', error, 'payments')
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

    // Rate limit: 10 requests per minute
    const ip = getClientIp(request)
    const rateLimitResult = await checkRateLimit(`paymentCreate:${ip}`, RATE_LIMITS.paymentCreate)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'عدد كبير من المحاولات. يرجى المحاولة لاحقاً' },
        { status: 429 }
      )
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    // Verify the order belongs to the current user
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'غير مصرح - هذا الطلب لا يخصك' }, { status: 403 })
    }

    // Prevent duplicate confirmed payments for the same order
    const existingConfirmedPayment = await prisma.payment.findFirst({
      where: { orderId, status: 'CONFIRMED' },
    })
    if (existingConfirmedPayment) {
      return NextResponse.json(
        { error: 'هذا الطلب لديه دفعة مؤكدة بالفعل' },
        { status: 400 }
      )
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
    logger.error('Payment create error', error, 'payments')
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الدفعة' }, { status: 500 })
  }
}
