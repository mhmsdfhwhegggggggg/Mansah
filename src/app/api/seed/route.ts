import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  // Block in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'غير متاح في بيئة الإنتاج' }, { status: 403 })
  }

  // Rate limit: 3 requests per minute
  const ip = getClientIp(request)
  const rateLimitResult = checkRateLimit(`seed:${ip}`, RATE_LIMITS.seed)
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'عدد كبير من المحاولات. يرجى المحاولة لاحقاً' },
      { status: 429 }
    )
  }

  // Always require seed secret key
  const seedSecret = process.env.SEED_SECRET_KEY
  if (!seedSecret) {
    return NextResponse.json({ error: 'مفتاح SEED_SECRET_KEY غير معيّن' }, { status: 403 })
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${seedSecret}`) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    // Create admin user - passwords from environment variables
    const adminPass = process.env.SEED_ADMIN_PASSWORD || 'Admin@Mansah2024!'
    const agentPass = process.env.SEED_AGENT_PASSWORD || 'Agent@Mansah2024!'
    const customerPass = process.env.SEED_CUSTOMER_PASSWORD || 'Customer@Mansah2024!'

    const adminPassword = await bcrypt.hash(adminPass, 12)
    const admin = await prisma.user.upsert({
      where: { email: 'admin@mansah.com' },
      update: {},
      create: {
        name: 'مدير المنصة',
        email: 'admin@mansah.com',
        password: adminPassword,
        role: 'ADMIN',
        country: 'اليمن',
        city: 'صنعاء',
        phone: '+967700000000',
      },
    })

    // Create agent user
    const agentPassword = await bcrypt.hash(agentPass, 12)
    const agent = await prisma.user.upsert({
      where: { email: 'agent@mansah.com' },
      update: {},
      create: {
        name: 'مندوب الشراء',
        email: 'agent@mansah.com',
        password: agentPassword,
        role: 'AGENT',
        country: 'الإمارات',
        city: 'دبي',
        phone: '+971500000000',
      },
    })

    // Create test customer
    const customerPassword = await bcrypt.hash(customerPass, 12)
    const customer = await prisma.user.upsert({
      where: { email: 'customer@test.com' },
      update: {},
      create: {
        name: 'عميل تجريبي',
        email: 'customer@test.com',
        password: customerPassword,
        role: 'CUSTOMER',
        country: 'اليمن',
        city: 'صنعاء',
        phone: '+967711111111',
      },
    })

    // Create categories
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { slug: 'electronics' },
        update: {},
        create: { name: 'Electronics', nameAr: 'إلكترونيات', slug: 'electronics', icon: '📱' },
      }),
      prisma.category.upsert({
        where: { slug: 'fashion' },
        update: {},
        create: { name: 'Fashion', nameAr: 'أزياء وموضة', slug: 'fashion', icon: '👗' },
      }),
      prisma.category.upsert({
        where: { slug: 'home' },
        update: {},
        create: { name: 'Home & Garden', nameAr: 'المنزل والحديقة', slug: 'home', icon: '🏠' },
      }),
      prisma.category.upsert({
        where: { slug: 'beauty' },
        update: {},
        create: { name: 'Beauty', nameAr: 'الجمال والعناية', slug: 'beauty', icon: '💄' },
      }),
      prisma.category.upsert({
        where: { slug: 'sports' },
        update: {},
        create: { name: 'Sports', nameAr: 'رياضة', slug: 'sports', icon: '⚽' },
      }),
      prisma.category.upsert({
        where: { slug: 'toys' },
        update: {},
        create: { name: 'Toys & Games', nameAr: 'ألعاب', slug: 'toys', icon: '🎮' },
      }),
    ])

    // Create sample products
    const sampleProducts = [
      {
        title: 'Apple AirPods Pro 2nd Generation',
        titleAr: 'سماعات أبل إيربودز برو الجيل الثاني',
        description: 'Active Noise Cancellation, Adaptive Transparency, Personalized Spatial Audio',
        descriptionAr: 'إلغاء ضوضاء نشط، شفافية تكيفية، صوت مكاني مخصص',
        price: 249.99,
        originalPrice: 249.99,
        currency: 'USD',
        images: JSON.stringify(['https://picsum.photos/seed/airpods/400/400', 'https://picsum.photos/seed/airpods2/400/400']),
        sourceUrl: 'https://www.amazon.com/dp/B0D1XD1ZV3',
        sourcePlatform: 'AMAZON',
        categoryId: categories[0].id,
        rating: 4.7,
        reviewCount: 15234,
        isFeatured: true,
      },
      {
        title: 'Samsung Galaxy S24 Ultra',
        titleAr: 'سامسونج جالكسي S24 ألترا',
        description: 'AI-powered smartphone with 200MP camera and S Pen',
        descriptionAr: 'هاتف ذكي مدعوم بالذكاء الاصطناعي مع كاميرا 200 ميجابكسل وقلم S',
        price: 1299.99,
        originalPrice: 1299.99,
        currency: 'USD',
        images: JSON.stringify(['https://picsum.photos/seed/samsung/400/400', 'https://picsum.photos/seed/samsung2/400/400']),
        sourceUrl: 'https://www.amazon.com/dp/B0CMDL2K3V',
        sourcePlatform: 'AMAZON',
        categoryId: categories[0].id,
        rating: 4.5,
        reviewCount: 8921,
        isFeatured: true,
      },
      {
        title: 'Elegant Summer Dress Collection',
        titleAr: 'مجموعة فساتين صيفية أنيقة',
        description: 'Beautiful floral print summer dress, available in multiple colors',
        descriptionAr: 'فستان صيفي جميل بطباعة زهور، متوفر بألوان متعددة',
        price: 29.99,
        originalPrice: 45.99,
        currency: 'USD',
        images: JSON.stringify(['https://picsum.photos/seed/dress/400/400', 'https://picsum.photos/seed/dress2/400/400']),
        sourceUrl: 'https://www.shein.com/product-123',
        sourcePlatform: 'SHEIN',
        categoryId: categories[1].id,
        rating: 4.2,
        reviewCount: 3456,
        isFeatured: true,
      },
      {
        title: 'Wireless Bluetooth Headphones',
        titleAr: 'سماعات بلوتوث لاسلكية',
        description: 'Over-ear headphones with noise cancellation and 40-hour battery',
        descriptionAr: 'سماعات أذن فوقية مع إلغاء ضوضاء وبطارية 40 ساعة',
        price: 35.99,
        originalPrice: 59.99,
        currency: 'USD',
        images: JSON.stringify(['https://picsum.photos/seed/headphones/400/400']),
        sourceUrl: 'https://www.aliexpress.com/item/123',
        sourcePlatform: 'ALIBABA',
        categoryId: categories[0].id,
        rating: 4.3,
        reviewCount: 12500,
        isFeatured: true,
      },
      {
        title: 'Smart Watch Fitness Tracker',
        titleAr: 'ساعة ذكية لتتبع اللياقة',
        description: 'Heart rate monitor, GPS, waterproof, 7-day battery life',
        descriptionAr: 'مراقب معدل ضربات القلب، GPS، مقاوم للماء، بطارية 7 أيام',
        price: 45.00,
        originalPrice: 79.99,
        currency: 'USD',
        images: JSON.stringify(['https://picsum.photos/seed/watch/400/400']),
        sourceUrl: 'https://www.aliexpress.com/item/456',
        sourcePlatform: 'ALIBABA',
        categoryId: categories[0].id,
        rating: 4.1,
        reviewCount: 8765,
        isFeatured: false,
      },
      {
        title: 'Portable Blender USB Rechargeable',
        titleAr: 'خلاط محمول قابل للشحن USB',
        description: 'Mini juicer blender for smoothies and shakes, 380ml capacity',
        descriptionAr: 'خلاط عصير صغير للسموذي والمخفوقات، سعة 380 مل',
        price: 18.50,
        originalPrice: 28.00,
        currency: 'USD',
        images: JSON.stringify(['https://picsum.photos/seed/blender/400/400']),
        sourceUrl: 'https://www.aliexpress.com/item/789',
        sourcePlatform: 'ALIBABA',
        categoryId: categories[2].id,
        rating: 4.4,
        reviewCount: 5678,
        isFeatured: false,
      },
      {
        title: 'Men Casual Sneakers Running Shoes',
        titleAr: 'حذاء رياضي كاجوال رجالي',
        description: 'Lightweight breathable running shoes for men, multiple colors',
        descriptionAr: 'حذاء جري خفيف الوزن قابل للتنفس للرجال، ألوان متعددة',
        price: 32.00,
        originalPrice: 55.00,
        currency: 'USD',
        images: JSON.stringify(['https://picsum.photos/seed/shoes/400/400']),
        sourceUrl: 'https://www.shein.com/product-456',
        sourcePlatform: 'SHEIN',
        categoryId: categories[4].id,
        rating: 4.0,
        reviewCount: 2345,
        isFeatured: false,
      },
      {
        title: 'LED Desk Lamp with Wireless Charger',
        titleAr: 'مصباح مكتب LED مع شاحن لاسلكي',
        description: 'Dimmable desk lamp with USB port and wireless charging base',
        descriptionAr: 'مصباح مكتب قابل للتعتيم مع منفذ USB وقاعدة شحن لاسلكي',
        price: 42.99,
        originalPrice: 59.99,
        currency: 'USD',
        images: JSON.stringify(['https://picsum.photos/seed/lamp/400/400']),
        sourceUrl: 'https://www.amazon.com/dp/LAMP123',
        sourcePlatform: 'AMAZON',
        categoryId: categories[2].id,
        rating: 4.6,
        reviewCount: 1890,
        isFeatured: true,
      },
      {
        title: 'Korean Skincare Set 10-Step',
        titleAr: 'مجموعة العناية بالبشرة الكورية 10 خطوات',
        description: 'Complete Korean skincare routine set with cleanser, toner, serum, and moisturizer',
        descriptionAr: 'مجموعة روتين العناية بالبشرة الكورية الكاملة مع غسول ومنظف وسيروم ومرطب',
        price: 55.00,
        originalPrice: 85.00,
        currency: 'USD',
        images: JSON.stringify(['https://picsum.photos/seed/skincare/400/400']),
        sourceUrl: 'https://www.amazon.com/dp/SKINCARE',
        sourcePlatform: 'AMAZON',
        categoryId: categories[3].id,
        rating: 4.8,
        reviewCount: 4567,
        isFeatured: true,
      },
      {
        title: 'Gaming Mechanical Keyboard RGB',
        titleAr: 'لوحة مفاتيح ميكانيكية للألعاب RGB',
        description: 'Hot-swappable mechanical keyboard with RGB backlight and custom switches',
        descriptionAr: 'لوحة مفاتيح ميكانيكية قابلة للتبديل مع إضاءة خلفية RGB ومفاتيح مخصصة',
        price: 65.00,
        originalPrice: 89.99,
        currency: 'USD',
        images: JSON.stringify(['https://picsum.photos/seed/keyboard/400/400']),
        sourceUrl: 'https://www.aliexpress.com/item/KB789',
        sourcePlatform: 'ALIBABA',
        categoryId: categories[0].id,
        rating: 4.5,
        reviewCount: 3210,
        isFeatured: false,
      },
    ]

    for (const product of sampleProducts) {
      await prisma.product.create({ data: product })
    }

    // Create exchange rates
    await Promise.all([
      prisma.exchangeRate.upsert({
        where: { fromCurrency_toCurrency: { fromCurrency: 'USD', toCurrency: 'YER' } },
        update: { rate: 250.5 },
        create: { fromCurrency: 'USD', toCurrency: 'YER', rate: 250.5 },
      }),
      prisma.exchangeRate.upsert({
        where: { fromCurrency_toCurrency: { fromCurrency: 'USD', toCurrency: 'SAR' } },
        update: { rate: 3.75 },
        create: { fromCurrency: 'USD', toCurrency: 'SAR', rate: 3.75 },
      }),
      prisma.exchangeRate.upsert({
        where: { fromCurrency_toCurrency: { fromCurrency: 'USD', toCurrency: 'AED' } },
        update: { rate: 3.67 },
        create: { fromCurrency: 'USD', toCurrency: 'AED', rate: 3.67 },
      }),
    ])

    return NextResponse.json({
      message: 'تم تهيئة البيانات بنجاح',
      data: {
        admin: { email: admin.email },
        agent: { email: agent.email },
        customer: { email: customer.email },
        products: sampleProducts.length,
        categories: categories.length,
      },
    })
  } catch (error) {
    logger.error('Seed error', error, 'seed')
    return NextResponse.json({ error: 'حدث خطأ أثناء تهيئة البيانات' }, { status: 500 })
  }
}
