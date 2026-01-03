import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname

  // Skip middleware for static assets and API routes (except auth-related)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // static files
  ) {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: Record<string, unknown>) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Fast session check - getUser is faster than getSession for auth state
  const { data: { user } } = await supabase.auth.getUser()

  // Public routes - no auth required
  const publicRoutes = ['/', '/pricing', '/auth']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Handle auth route
  if (pathname === '/auth') {
    if (user) {
      // Quick check for subscription using single optimized query
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .maybeSingle()

      return NextResponse.redirect(
        new URL(subscription ? '/dashboard' : '/pricing', request.url)
      )
    }
    return response
  }

  // Protected routes
  const protectedRoutes = ['/dashboard', '/record', '/notes', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  if (isProtectedRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Optimized single query for subscription check
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle()

    if (!subscription) {
      return NextResponse.redirect(new URL('/pricing', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
