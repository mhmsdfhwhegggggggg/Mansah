import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // Admin routes - require ADMIN role
    if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
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
      authorized: ({ req, token }) => {
        // For API routes, return false so withAuth returns JSON 401
        // instead of redirecting to HTML login page
        if (req.nextUrl.pathname.startsWith('/api/')) {
          return !!token
        }
        return !!token
      },
    },
    pages: {
      signIn: '/auth/login',
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
