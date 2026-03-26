import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { orderUpdateSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'
import { createAuditLog, createNotification } from '@/lib/audit'

// Valid order status transitions (state machine)
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PAYMENT_CONFIRMED', 'CANCELLED'],
  PAYMENT_CONFIRMED: ['PURCHASING', 'CANCELLED', 'REFUNDED'],
  PURCHASING: ['PURCHASED', 'CANCELLED', 'REFUNDED'],
  PURCHASED: ['SHIPPING', 'CANCELLED', 'REFUNDED'],
  SHIPPING: ['IN_TRANSIT', 'CANCELLED'],
  IN_TRANSIT: ['DELIVERED', 'CANCELLED'],
  DELIVERED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, country: true, city: true } },
        items: { include: { product: true } },
        payments: true,
        tasks: { include: { agent: { select: { id: true, name: true } } } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
    }

    if (session.user.role === 'CUSTOMER' && order.userId !== session.user.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    return NextResponse.json({ order })
  } catch (error) {
    logger.error('Order fetch error', error, 'orders/[id]')
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
    }

    // Only ADMIN and AGENT can update orders
    if (session.user.role !== 'ADMIN' && session.user.role !== 'AGENT') {
      return NextResponse.json({ error: 'غير مصرح - يجب أن تكون مديراً أو مندوباً' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = orderUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'بيانات غير صالحة' },
        { status: 400 }
      )
    }
    const { status, trackingNumber, notes, cancelReason, estimatedDelivery } = parsed.data

    // Validate state transition
    if (status) {
      const currentOrder = await prisma.order.findUnique({
        where: { id: params.id },
        select: { status: true },
      })
      if (!currentOrder) {
        return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
      }
      const allowed = VALID_TRANSITIONS[currentOrder.status]
      if (allowed && !allowed.includes(status)) {
        return NextResponse.json(
          { error: `لا يمكن الانتقال من ${currentOrder.status} إلى ${status}` },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (trackingNumber) updateData.trackingNumber = trackingNumber
    if (notes !== undefined) updateData.notes = notes
    if (cancelReason) updateData.cancelReason = cancelReason
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery)

    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      include: {
        items: { include: { product: true } },
        payments: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (status) {
      await prisma.orderStatusLog.create({
        data: {
          orderId: params.id,
          status,
          note: notes || `تم تحديث الحالة إلى ${status}`,
          createdBy: session.user.id,
        },
      })

      // Create audit log
      await createAuditLog({
        adminId: session.user.id,
        action: 'UPDATE',
        entityType: 'ORDER',
        entityId: params.id,
        newData: { status, trackingNumber, notes },
      })

      // Notify customer about order status change
      await createNotification({
        userId: order.userId,
        type: 'ORDER_UPDATE',
        title: 'تحديث حالة الطلب',
        message: `تم تحديث حالة طلبك إلى ${status}`,
        relatedEntityId: params.id,
      })
    }

    return NextResponse.json({ order })
  } catch (error) {
    logger.error('Order update error', error, 'orders/[id]')
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
