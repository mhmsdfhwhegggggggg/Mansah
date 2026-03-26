import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const [
      totalOrders,
      pendingOrders,
      confirmedPayments,
      pendingPayments,
      totalProducts,
      totalUsers,
      totalAgents,
      pendingTasks,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'CONFIRMED' } }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.user.count({ where: { role: 'AGENT' } }),
      prisma.task.count({ where: { status: { in: ['PENDING', 'ASSIGNED'] } } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          payments: { select: { status: true, method: true } },
        },
      }),
    ])

    const totalRevenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'CONFIRMED' },
    })

    return NextResponse.json({
      stats: {
        totalOrders,
        pendingOrders,
        confirmedPayments,
        pendingPayments,
        totalProducts,
        totalUsers,
        totalAgents,
        pendingTasks,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
      recentOrders,
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
