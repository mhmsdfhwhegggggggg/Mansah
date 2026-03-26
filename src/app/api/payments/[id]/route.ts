import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { paymentUpdateSchema } from '@/lib/validations'

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
    const parsed = paymentUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'بيانات غير صالحة' },
        { status: 400 }
      )
    }
    const { status, notes } = parsed.data

    const payment = await prisma.payment.update({
      where: { id: params.id },
      data: {
        status,
        notes: notes || undefined,
        confirmedBy: session.user.id,
        confirmedAt: status === 'CONFIRMED' ? new Date() : undefined,
      },
      include: {
        order: true,
      },
    })

    if (status === 'CONFIRMED') {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'PAYMENT_CONFIRMED' },
      })
      await prisma.orderStatus.create({
        data: {
          orderId: payment.orderId,
          status: 'PAYMENT_CONFIRMED',
          note: 'تم تأكيد الدفع من قبل الإدارة',
          createdBy: session.user.id,
        },
      })

      // Auto-create agent task for order fulfillment
      await prisma.task.create({
        data: {
          description: `تم تأكيد الدفع للطلب #${payment.order.orderNumber}. يرجى البدء بعملية الشراء والشحن.`,
          type: 'PURCHASE',
          priority: 'HIGH',
          orderId: payment.orderId,
        },
      })
    }

    if (status === 'REJECTED') {
      await prisma.orderStatus.create({
        data: {
          orderId: payment.orderId,
          status: 'PENDING',
          note: `تم رفض الدفع: ${notes || 'لم يتم التحقق'}`,
          createdBy: session.user.id,
        },
      })
    }

    return NextResponse.json({ payment })
  } catch (error) {
    console.error('Payment update error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
