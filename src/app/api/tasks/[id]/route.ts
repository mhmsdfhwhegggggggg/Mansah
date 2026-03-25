import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

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
    const { status, result, purchaseConfirmation, trackingNumber, agentId } = body

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
      let orderStatus = ''
      let orderUpdate: Record<string, unknown> = {}

      switch (task.type) {
        case 'PURCHASE':
          orderStatus = 'PURCHASED'
          break
        case 'SHIP':
          orderStatus = 'SHIPPING'
          if (trackingNumber) {
            orderUpdate.trackingNumber = trackingNumber
          }
          break
        case 'DELIVER':
          orderStatus = 'DELIVERED'
          break
      }

      if (orderStatus) {
        orderUpdate.status = orderStatus
        await prisma.order.update({
          where: { id: task.orderId },
          data: orderUpdate,
        })
        await prisma.orderStatus.create({
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
    console.error('Task update error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
