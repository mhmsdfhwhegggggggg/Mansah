# Mansah Platform - Requirements & Implementation Details

## Overview

Electronic brokerage platform enabling customers in countries with limited international payment methods (Yemen, Saudi Arabia, etc.) to purchase from global marketplaces using local payment methods with direct shipping.

## Database Schema

### Models

1. **User** - Multi-role user accounts (CUSTOMER, AGENT, ADMIN)
2. **Product** - Products scraped/imported from global marketplaces
3. **Category** - Product categories with parent-child hierarchy
4. **Order** - Customer purchase orders with shipping details
5. **OrderItem** - Individual items within an order
6. **OrderStatus** - Status history tracking for orders
7. **Payment** - Payment records with multiple method support
8. **AgentTask** - Tasks assigned to agents for order fulfillment

### Key Relationships
- User -> Orders (one-to-many)
- Order -> OrderItems -> Product (many-to-many through OrderItem)
- Order -> Payments (one-to-many)
- Order -> AgentTasks (one-to-many)
- Order -> OrderStatus (one-to-many history)
- Category -> Products (one-to-many)
- Category -> Category (self-referencing parent-child)

## API Routes

### Authentication
- `POST /api/auth/register` - User registration with bcrypt password hashing
- `GET/POST /api/auth/nextauth` - NextAuth.js session management

### Products
- `GET /api/products` - List products with search, platform filter, sorting, pagination
- `GET /api/products/[id]` - Single product details with category

### Orders
- `GET /api/orders` - List user orders (filtered by session user)
- `POST /api/orders` - Create new order with items and commission calculation
- `GET /api/orders/[id]` - Order details with items, payments, status history
- `PUT /api/orders/[id]` - Update order status (admin only)

### Payments
- `GET /api/payments` - List payments with status filter
- `POST /api/payments` - Create payment for an order
- `PUT /api/payments/[id]` - Confirm/reject payment (admin only)

### Tasks
- `GET /api/tasks` - List agent tasks with status filter
- `POST /api/tasks` - Create task for order (auto-created on payment confirmation)
- `PUT /api/tasks/[id]` - Update task status, add tracking number

### Admin
- `GET /api/admin/stats` - Dashboard statistics (order counts, revenue, user counts)
- `GET /api/admin/users` - List all users with order counts
- `PUT /api/admin/users` - Update user role

### Other
- `GET /api/categories` - List categories with hierarchy
- `GET /api/track?orderNumber=XXX` - Public order tracking
- `GET /api/seed` - Seed database with sample data

## Frontend Pages

### Public Pages
1. **Landing Page** (`/`) - Hero section, features, how-it-works, platforms showcase
2. **Products** (`/products`) - Product grid with search, platform filter, sort, pagination
3. **Product Detail** (`/products/[id]`) - Full product info, add to cart
4. **Order Tracking** (`/track`) - Public tracking by order number

### Authentication
5. **Login** (`/auth/login`) - Email/password login
6. **Register** (`/auth/register`) - Registration with name, email, phone, country, city

### Customer Pages (Authenticated)
7. **Cart** (`/cart`) - Shopping cart with quantity management, commission calculation
8. **Checkout** (`/checkout`) - Shipping address form, payment method selection
9. **Orders** (`/orders`) - List of customer orders with status badges
10. **Order Detail** (`/orders/[id]`) - 7-step progress tracker, items, status history

### Admin Pages (ADMIN role)
11. **Admin Dashboard** (`/admin`) - 8 stat cards, recent orders table
12. **Admin Orders** (`/admin/orders`) - Orders management with status filtering/updating
13. **Admin Payments** (`/admin/payments`) - Payment confirmation/rejection
14. **Admin Users** (`/admin/users`) - User role management

### Agent Pages (AGENT role)
15. **Agent Dashboard** (`/agent`) - Task queue with stats, status filtering, task completion

## Business Logic

### Commission
- 5% commission on all orders (configurable via NEXT_PUBLIC_COMMISSION_RATE)
- Commission calculated at checkout and stored in order record

### Payment Flow
1. Customer places order and selects payment method
2. Payment record created with PENDING status
3. Admin reviews and confirms/rejects payment
4. On confirmation, order status moves to PAYMENT_CONFIRMED
5. Agent task auto-created for order fulfillment

### Order Fulfillment
1. Agent receives task in dashboard
2. Agent starts task (status: IN_PROGRESS)
3. Agent purchases from global marketplace
4. Agent enters tracking number
5. Agent completes task
6. Order status updated through: PURCHASING -> PURCHASED -> SHIPPING -> IN_TRANSIT -> DELIVERED

### Supported Platforms
- Amazon (AMAZON)
- AliExpress (ALIBABA)
- Shein (SHEIN)
- Other (OTHER)

### Supported Currencies
- Default: YER (Yemeni Rial)
- Configurable exchange rates per order

## Security
- Password hashing with bcryptjs
- Session-based authentication via NextAuth.js
- Role-based access control on API routes and pages
- CSRF protection via NextAuth
- No secrets committed to repository
