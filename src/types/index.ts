export interface ProductType {
  id: string
  title: string
  titleAr?: string | null
  description?: string | null
  descriptionAr?: string | null
  price: number
  originalPrice: number
  currency: string
  images: string
  sourceUrl: string
  sourcePlatform: string
  categoryId?: string | null
  category?: CategoryType | null
  inStock: boolean
  rating?: number | null
  reviewCount?: number | null
  specifications?: string | null
  shippingWeight?: number | null
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export interface CategoryType {
  id: string
  name: string
  nameAr: string
  slug: string
  icon?: string | null
  image?: string | null
  parentId?: string | null
  children?: CategoryType[]
  products?: ProductType[]
}

export interface OrderType {
  id: string
  orderNumber: string
  userId: string
  user?: UserType
  status: string
  totalAmount: number
  commissionAmount: number
  shippingCost: number
  currency: string
  exchangeRate: number
  shippingAddress?: string | null
  shippingCity?: string | null
  shippingCountry?: string | null
  shippingPhone?: string | null
  trackingNumber?: string | null
  notes?: string | null
  cancelReason?: string | null
  estimatedDelivery?: string | null
  createdAt: string
  updatedAt: string
  items?: OrderItemType[]
  payments?: PaymentType[]
  tasks?: TaskType[]
  statusHistory?: OrderStatusType[]
}

export interface OrderItemType {
  id: string
  orderId: string
  productId: string
  product?: ProductType
  quantity: number
  price: number
  totalPrice: number
  sourceUrl?: string | null
}

export interface OrderStatusType {
  id: string
  orderId: string
  status: string
  note?: string | null
  createdBy?: string | null
  createdAt: string
}

export interface PaymentType {
  id: string
  orderId: string
  userId: string
  amount: number
  currency: string
  method: string
  status: string
  receiptImage?: string | null
  transactionId?: string | null
  bankName?: string | null
  accountNumber?: string | null
  senderName?: string | null
  notes?: string | null
  confirmedBy?: string | null
  confirmedAt?: string | null
  createdAt: string
  updatedAt: string
  order?: OrderType
  user?: UserType
}

export interface TaskType {
  id: string
  orderId: string
  order?: OrderType
  agentId?: string | null
  agent?: UserType
  type: string
  status: string
  priority: string
  description?: string | null
  result?: string | null
  sourcePlatform?: string | null
  purchaseConfirmation?: string | null
  trackingNumber?: string | null
  startedAt?: string | null
  completedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface UserType {
  id: string
  name: string
  email: string
  phone?: string | null
  role: string
  country?: string | null
  city?: string | null
  address?: string | null
  avatar?: string | null
  isActive: boolean
  createdAt: string
}

export interface CartItemType {
  id: string
  userId: string
  productId: string
  product: ProductType
  quantity: number
}
