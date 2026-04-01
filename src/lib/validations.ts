import { z } from 'zod'

export const paymentCreateSchema = z.object({
  orderId: z.string().min(1, 'معرف الطلب مطلوب'),
  amount: z.number().positive('المبلغ يجب أن يكون أكبر من صفر'),
  currency: z.string().optional(),
  method: z.enum(['BANK_TRANSFER', 'MOBILE_WALLET', 'STRIPE', 'RECEIPT_UPLOAD']),
  receiptImage: z.string().url().optional().nullable(),
  bankName: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  senderName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const productCreateSchema = z.object({
  title: z.string().min(1, 'العنوان مطلوب'),
  titleAr: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  descriptionAr: z.string().optional().nullable(),
  price: z.number().positive('السعر يجب أن يكون أكبر من صفر'),
  originalPrice: z.number().positive().optional(),
  currency: z.string().optional(),
  images: z.union([z.string(), z.array(z.string())]).optional(),
  sourceUrl: z.string().url('رابط المصدر غير صالح'),
  sourcePlatform: z.enum(['AMAZON', 'ALIBABA', 'SHEIN', 'OTHER']),
  categoryId: z.string().optional().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  reviewCount: z.number().int().min(0).optional().nullable(),
  specifications: z.record(z.string(), z.unknown()).optional().nullable(),
  shippingWeight: z.number().positive().optional().nullable(),
  isFeatured: z.boolean().optional(),
})

export const categoryCreateSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب'),
  nameAr: z.string().min(1, 'الاسم بالعربية مطلوب'),
  slug: z.string().min(1, 'المعرف مطلوب').regex(/^[a-z0-9-]+$/, 'المعرف يجب أن يحتوي فقط على أحرف صغيرة وأرقام وشرطات'),
  icon: z.string().optional().nullable(),
  image: z.string().url().optional().nullable(),
  parentId: z.string().optional().nullable(),
})

export const orderCreateSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
    scrapedProduct: z.object({
      title: z.string(),
      titleAr: z.string().optional(),
      price: z.number(),
      originalPrice: z.number().optional(),
      image: z.string(),
      sourcePlatform: z.enum(['AMAZON', 'ALIBABA', 'SHEIN', 'OTHER']),
      sourceUrl: z.string(),
    }).optional()
  })).min(1, 'السلة فارغة'),
  shippingAddress: z.string().min(1, 'العنوان مطلوب'),
  shippingCity: z.string().optional(),
  shippingCountry: z.string().optional(),
  shippingPhone: z.string().optional(),
  currency: z.string().optional(),
  exchangeRate: z.number().positive().optional(),
  notes: z.string().optional(),
})

export const orderUpdateSchema = z.object({
  status: z.enum([
    'PENDING', 'PAYMENT_CONFIRMED', 'PURCHASING', 'PURCHASED',
    'SHIPPING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'REFUNDED',
  ]).optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
  cancelReason: z.string().optional(),
  estimatedDelivery: z.string().datetime().optional(),
})

export const paymentUpdateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'REJECTED', 'REFUNDED']),
  notes: z.string().optional(),
})

export const taskCreateSchema = z.object({
  orderId: z.string().min(1, 'معرف الطلب مطلوب'),
  agentId: z.string().optional().nullable(),
  type: z.enum(['PURCHASE', 'VERIFY_PRICE', 'SHIP', 'DELIVER']).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  description: z.string().optional().nullable(),
  sourcePlatform: z.enum(['AMAZON', 'ALIBABA', 'SHEIN', 'OTHER']).optional().nullable(),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  phone: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
})
