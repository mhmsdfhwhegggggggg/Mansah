import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin routes - require ADMIN role
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
      // Redirect to home if logged in but wrong role (not back to login)
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Agent routes - require AGENT role
    if (pathname.startsWith('/agent') && token?.role !== 'AGENT') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // Protect admin API routes at middleware level
    if (pathname.startsWith('/api/admin') && token?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/admin/:path*',
    '/agent/:path*',
    '/orders/:path*',
    '/checkout',
    '/api/admin/:path*',
  ],
}
