import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { categoryCreateSchema } from '@/lib/validations'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        children: true,
        _count: { select: { products: true } },
      },
      where: { parentId: null },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    logger.error('Categories fetch error', error, 'categories')
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
    const parsed = categoryCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'بيانات غير صالحة' },
        { status: 400 }
      )
    }
    const { name, nameAr, slug, icon, image, parentId } = parsed.data

    const category = await prisma.category.create({
      data: {
        name,
        nameAr,
        slug,
        icon: icon || null,
        image: image || null,
        parentId: parentId || null,
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    logger.error('Category create error', error, 'categories')
    return NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
  }
}
