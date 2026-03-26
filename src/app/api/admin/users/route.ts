import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const userUpdateSchema = z.object({
  userId: z.string().min(1, 'معرف المستخدم مطلوب'),
  role: z.enum(['CUSTOMER', 'AGENT', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)

    const where: Record<string, unknown> = {}
    if (role) where.role = role

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true, role: true,
          country: true, city: true, isActive: true, createdAt: true,
          _count: { select: { orders: true, tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    logger.error('Users fetch error', error, 'admin/users')
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = userUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'بيانات غير صالحة' },
        { status: 400 }
      )
    }
    const { userId, role, isActive } = parsed.data

    // Prevent admin from changing their own role
    if (userId === session.user.id && role && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'لا يمكنك تغيير دورك الخاص' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    logger.error('User update error', error, 'admin/users')
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
