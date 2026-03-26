import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { registerSchema } from '@/lib/validations'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 requests per minute
    const ip = getClientIp(request)
    const rateLimitResult = checkRateLimit(`register:${ip}`, RATE_LIMITS.register)
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'عدد كبير من المحاولات. يرجى المحاولة لاحقاً' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'بيانات غير صالحة' },
        { status: 400 }
      )
    }
    const { name, email, password, phone, country, city } = parsed.data

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        country: country || null,
        city: city || null,
      },
    })

    return NextResponse.json(
      {
        message: 'تم إنشاء الحساب بنجاح',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Registration error', error, 'auth/register')
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب' },
      { status: 500 }
    )
  }
}
