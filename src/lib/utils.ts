export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `MNS-${timestamp}-${random}`
}

export function formatCurrency(amount: number, currency: string = 'YER'): string {
  const currencyMap: Record<string, { symbol: string; locale: string }> = {
    YER: { symbol: 'ر.ي', locale: 'ar-YE' },
    SAR: { symbol: 'ر.س', locale: 'ar-SA' },
    USD: { symbol: '$', locale: 'en-US' },
    AED: { symbol: 'د.إ', locale: 'ar-AE' },
  }

  const config = currencyMap[currency] || currencyMap.USD
  return `${amount.toLocaleString(config.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${config.symbol}`
}

export function calculateCommission(price: number, rate: number = 0.05): number {
  return Math.round(price * rate * 100) / 100
}

export function convertCurrency(amount: number, exchangeRate: number): number {
  return Math.round(amount * exchangeRate * 100) / 100
}

export const ORDER_STATUSES: Record<string, { label: string; labelAr: string; color: string }> = {
  PENDING: { label: 'Pending', labelAr: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800' },
  PAYMENT_CONFIRMED: { label: 'Payment Confirmed', labelAr: 'تم تأكيد الدفع', color: 'bg-blue-100 text-blue-800' },
  PURCHASING: { label: 'Purchasing', labelAr: 'جاري الشراء', color: 'bg-indigo-100 text-indigo-800' },
  PURCHASED: { label: 'Purchased', labelAr: 'تم الشراء', color: 'bg-purple-100 text-purple-800' },
  SHIPPING: { label: 'Shipping', labelAr: 'جاري الشحن', color: 'bg-cyan-100 text-cyan-800' },
  IN_TRANSIT: { label: 'In Transit', labelAr: 'في الطريق', color: 'bg-orange-100 text-orange-800' },
  DELIVERED: { label: 'Delivered', labelAr: 'تم التسليم', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', labelAr: 'ملغي', color: 'bg-red-100 text-red-800' },
  REFUNDED: { label: 'Refunded', labelAr: 'مسترجع', color: 'bg-gray-100 text-gray-800' },
}

export const PAYMENT_METHODS: Record<string, { label: string; labelAr: string }> = {
  BANK_TRANSFER: { label: 'Bank Transfer', labelAr: 'تحويل بنكي' },
  MOBILE_WALLET: { label: 'Mobile Wallet', labelAr: 'محفظة إلكترونية' },
  STRIPE: { label: 'Credit/Debit Card', labelAr: 'بطاقة ائتمان/خصم' },
  RECEIPT_UPLOAD: { label: 'Receipt Upload', labelAr: 'رفع إشعار حوالة' },
}

export const SOURCE_PLATFORMS: Record<string, { label: string; icon: string; color: string }> = {
  AMAZON: { label: 'Amazon', icon: '🛒', color: 'bg-orange-500' },
  ALIBABA: { label: 'AliExpress', icon: '🏪', color: 'bg-red-500' },
  SHEIN: { label: 'Shein', icon: '👗', color: 'bg-black' },
  OTHER: { label: 'Other', icon: '🌐', color: 'bg-gray-500' },
}

export function getStatusStep(status: string): number {
  const steps = ['PENDING', 'PAYMENT_CONFIRMED', 'PURCHASING', 'PURCHASED', 'SHIPPING', 'IN_TRANSIT', 'DELIVERED']
  return steps.indexOf(status)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
