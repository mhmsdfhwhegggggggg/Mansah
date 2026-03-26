import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { paymentUpdateSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'

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

    if (status === 'CONFIRMED') {
      // Wrap all confirmation operations in a transaction
      const payment = await prisma.$transaction(async (tx) => {
        const updatedPayment = await tx.payment.update({
          where: { id: params.id },
          data: {
            status,
            notes: notes || undefined,
            confirmedBy: session.user.id,
            confirmedAt: new Date(),
          },
          include: { order: true },
        })

        await tx.order.update({
          where: { id: updatedPayment.orderId },
          data: { status: 'PAYMENT_CONFIRMED' },
        })

        await tx.orderStatusLog.create({
          data: {
            orderId: updatedPayment.orderId,
            status: 'PAYMENT_CONFIRMED',
            note: 'تم تأكيد الدفع من قبل الإدارة',
            createdBy: session.user.id,
          },
        })

        // Auto-create agent task for order fulfillment
        // Load-balanced assignment: pick the agent with the fewest open tasks
        const agents = await tx.user.findMany({
          where: { role: 'AGENT', isActive: true },
          select: {
            id: true,
            _count: {
              select: {
                tasks: { where: { status: { in: ['PENDING', 'ASSIGNED', 'IN_PROGRESS'] } } },
              },
            },
          },
        })
        const availableAgent = agents.length > 0
          ? agents.sort((a, b) => a._count.tasks - b._count.tasks)[0]
          : null

        await tx.task.create({
          data: {
            description: `تم تأكيد الدفع للطلب #${updatedPayment.order.orderNumber}. يرجى البدء بعملية الشراء والشحن.`,
            type: 'PURCHASE',
            priority: 'HIGH',
            orderId: updatedPayment.orderId,
            agentId: availableAgent?.id || null,
            status: availableAgent ? 'ASSIGNED' : 'PENDING',
          },
        })

        return updatedPayment
      })

      return NextResponse.json({ payment })
    }

    if (status === 'REJECTED') {
      const payment = await prisma.$transaction(async (tx) => {
        const updatedPayment = await tx.payment.update({
          where: { id: params.id },
          data: {
            status,
            notes: notes || undefined,
            confirmedBy: null,
            confirmedAt: null,
          },
          include: { order: true },
        })

        await tx.orderStatusLog.create({
          data: {
            orderId: updatedPayment.orderId,
            status: 'PENDING',
            note: `تم رفض الدفع: ${notes || 'لم يتم التحقق'}`,
            createdBy: session.user.id,
          },
        })

        return updatedPayment
      })

      return NextResponse.json({ payment })
    }

    // For other statuses (e.g., REFUNDED)
    const payment = await prisma.payment.update({
      where: { id: params.id },
      data: {
        status,
        notes: notes || undefined,
      },
      include: { order: true },
    })

    return NextResponse.json({ payment })
  } catch (error) {
    logger.error('Payment update error', error, 'payments/[id]')
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
