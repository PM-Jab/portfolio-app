import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from '@/lib/session'

const protectedRoutes = ['/dashboard', '/assets', '/transactions', '/analytics', '/reports']
const publicRoutes = ['/login', '/register']

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtected = protectedRoutes.some(r => path.startsWith(r))
  const isPublic = publicRoutes.some(r => path.startsWith(r))

  const cookie = req.cookies.get('session')?.value
  const session = await decrypt(cookie)

  if (isProtected && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isPublic && session?.userId) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
