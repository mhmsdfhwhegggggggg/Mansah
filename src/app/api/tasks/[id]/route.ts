import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const taskUpdateSchema = z.object({
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'FAILED']).optional(),
  result: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
  purchaseConfirmation: z.string().optional(),
  trackingNumber: z.string().optional(),
  agentId: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = taskUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'بيانات غير صالحة' },
        { status: 400 }
      )
    }
    const { status, result, purchaseConfirmation, trackingNumber, agentId } = parsed.data

    // AGENT can only update tasks assigned to them
    if (session.user.role === 'AGENT') {
      const existingTask = await prisma.task.findUnique({
        where: { id: params.id },
        select: { agentId: true },
      })
      if (!existingTask || existingTask.agentId !== session.user.id) {
        return NextResponse.json(
          { error: 'غير مصرح - هذه المهمة غير مسندة إليك' },
          { status: 403 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (result) updateData.result = typeof result === 'string' ? result : JSON.stringify(result)
    if (purchaseConfirmation) updateData.purchaseConfirmation = purchaseConfirmation
    if (trackingNumber) updateData.trackingNumber = trackingNumber
    if (agentId) updateData.agentId = agentId

    if (status === 'IN_PROGRESS' && !updateData.startedAt) {
      updateData.startedAt = new Date()
    }
    if (status === 'COMPLETED') {
      updateData.completedAt = new Date()
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        order: true,
        agent: { select: { id: true, name: true } },
      },
    })

    // Update order status based on task completion
    if (status === 'COMPLETED') {
      let orderStatus: OrderStatus | null = null
      const orderUpdate: Record<string, unknown> = {}

      switch (task.type) {
        case 'PURCHASE':
          orderStatus = OrderStatus.PURCHASED
          break
        case 'SHIP':
          orderStatus = OrderStatus.SHIPPING
          if (trackingNumber) {
            orderUpdate.trackingNumber = trackingNumber
          }
          break
        case 'DELIVER':
          orderStatus = OrderStatus.DELIVERED
          break
      }

      if (orderStatus) {
        orderUpdate.status = orderStatus
        await prisma.order.update({
          where: { id: task.orderId },
          data: orderUpdate,
        })
        await prisma.orderStatusLog.create({
          data: {
            orderId: task.orderId,
            status: orderStatus,
            note: `تم إكمال مهمة ${task.type}`,
            createdBy: session.user.id,
          },
        })
      }
    }

    return NextResponse.json({ task })
  } catch (error) {
    logger.error('Task update error', error, 'tasks/[id]')
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
