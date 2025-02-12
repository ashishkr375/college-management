import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const { token } = req.nextauth;

    // If not logged in and trying to access protected routes, redirect to signin
    if (!token && pathname !== '/api/auth/signin') {
      return NextResponse.redirect(new URL('/api/auth/signin', req.url));
    }

    // Redirect based on user role if they're on the homepage
    if (token && pathname === '/') {
      switch (token.role) {
        case 'super_admin':
          return NextResponse.redirect(new URL('/admin/super-admin/dashboard', req.url));
        case 'dept_admin':
          return NextResponse.redirect(new URL('/admin/dept-admin/dashboard', req.url));
        case 'faculty':
          return NextResponse.redirect(new URL('/faculty/dashboard', req.url));
        case 'student':
          return NextResponse.redirect(new URL('/student/dashboard', req.url));
        default:
          return NextResponse.redirect(new URL('/api/auth/signin', req.url));
      }
    }

    // Role-based access control
    if (token) {
      // Super Admin routes
      if (pathname.startsWith('/admin/super-admin')) {
        if (token.role !== 'super_admin') {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }

      // Department Admin routes
      if (pathname.startsWith('/admin/dept-admin')) {
        if (token.role !== 'dept_admin') {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }

      // Faculty routes
      if (pathname.startsWith('/faculty')) {
        if (token.role !== 'faculty' && token.role !== 'dept_admin') {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }

      // Student routes
      if (pathname.startsWith('/student')) {
        if (token.role !== 'student') {
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
);

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/faculty/:path*',
    '/student/:path*',
    // '/api/auth/signin'
  ]
}; 