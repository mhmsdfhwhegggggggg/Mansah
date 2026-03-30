import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    if (!resend) {
      console.warn('Resend not configured (RESEND_API_KEY missing), skipping email send')
      return false
    }

    const { error } = await resend.emails.send({
      from: `${process.env.NEXT_PUBLIC_APP_NAME || 'منصة Mansah'} <${process.env.EMAIL_FROM || 'onboarding@resend.dev'}>`,
      to: [to],
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    })

    if (error) {
      console.error('Resend email error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

// Email templates
export function orderStatusEmail(orderNumber: string, status: string, customerName: string): EmailOptions {
  const statusMap: Record<string, string> = {
    PENDING: 'قيد الانتظار',
    PAYMENT_CONFIRMED: 'تم تأكيد الدفع',
    PURCHASING: 'جاري الشراء',
    PURCHASED: 'تم الشراء',
    SHIPPING: 'جاري الشحن',
    IN_TRANSIT: 'في الطريق',
    DELIVERED: 'تم التوصيل',
    CANCELLED: 'ملغي',
    REFUNDED: 'مسترجع',
  }

  const statusAr = statusMap[status] || status

  return {
    to: '',
    subject: `تحديث حالة الطلب #${orderNumber}`,
    html: `
      <div dir="rtl" style="font-family: 'Tajawal', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">منصة</h1>
        </div>
        <div style="background: #fff; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-bottom: 16px;">مرحباً ${customerName}</h2>
          <p style="color: #4b5563; font-size: 16px;">تم تحديث حالة طلبك رقم <strong>#${orderNumber}</strong></p>
          <div style="background: #fff7ed; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="color: #ea580c; font-size: 20px; font-weight: bold; margin: 0;">${statusAr}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">شكراً لتسوقك معنا!</p>
        </div>
      </div>
    `,
  }
}

export function welcomeEmail(customerName: string): EmailOptions {
  return {
    to: '',
    subject: 'مرحباً بك في منصة!',
    html: `
      <div dir="rtl" style="font-family: 'Tajawal', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">منصة</h1>
        </div>
        <div style="background: #fff; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-bottom: 16px;">مرحباً ${customerName}!</h2>
          <p style="color: #4b5563; font-size: 16px;">نحن سعداء بانضمامك إلى منصة - بوابتك للأسواق العالمية.</p>
          <p style="color: #4b5563; font-size: 16px;">يمكنك الآن تصفح المنتجات وطلبها من مختلف المتاجر العالمية.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/products" style="background: #f97316; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">تصفح المنتجات</a>
          </div>
        </div>
      </div>
    `,
  }
}

export function paymentConfirmationEmail(orderNumber: string, amount: number, currency: string): EmailOptions {
  return {
    to: '',
    subject: `تأكيد الدفع - طلب #${orderNumber}`,
    html: `
      <div dir="rtl" style="font-family: 'Tajawal', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">منصة</h1>
        </div>
        <div style="background: #fff; padding: 30px; border-radius: 12px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-bottom: 16px;">تم تأكيد الدفع</h2>
          <p style="color: #4b5563;">تم استلام الدفع بنجاح لطلبك رقم <strong>#${orderNumber}</strong></p>
          <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="color: #16a34a; font-size: 24px; font-weight: bold; margin: 0;">${amount.toLocaleString()} ${currency}</p>
          </div>
        </div>
      </div>
    `,
  }
}
