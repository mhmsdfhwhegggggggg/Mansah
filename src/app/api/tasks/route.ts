import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100)

    const where: Record<string, unknown> = {}

    if (session.user.role === 'AGENT') {
      where.agentId = session.user.id
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          order: {
            include: {
              user: { select: { id: true, name: true, phone: true, country: true, city: true } },
              items: { include: { product: true } },
            },
          },
          agent: { select: { id: true, name: true } },
        },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.task.count({ where }),
    ])

    return NextResponse.json({
      tasks,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Tasks fetch error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const body = await request.json()
    const { orderId, agentId, type, priority, description, sourcePlatform } = body

    const task = await prisma.task.create({
      data: {
        orderId,
        agentId: agentId || null,
        type: type || 'PURCHASE',
        status: agentId ? 'ASSIGNED' : 'PENDING',
        priority: priority || 'NORMAL',
        description: description || null,
        sourcePlatform: sourcePlatform || null,
      },
      include: {
        order: { include: { items: { include: { product: true } } } },
        agent: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Task create error:', error)
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
