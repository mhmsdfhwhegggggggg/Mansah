import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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
    console.error('Order fetch error:', error)
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

    const body = await request.json()
    const { status, trackingNumber, notes, cancelReason, estimatedDelivery } = body

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
      await prisma.orderStatus.create({
        data: {
          orderId: params.id,
          status,
          note: notes || `تم تحديث الحالة إلى ${status}`,
          createdBy: session.user.id,
        },
      })
    }

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order update error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
