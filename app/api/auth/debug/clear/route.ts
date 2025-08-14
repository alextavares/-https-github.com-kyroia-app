import { NextResponse } from 'next/server'

export async function GET() {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3099'
  const res = NextResponse.redirect(new URL('/auth/signin', base))

  // Clear NextAuth cookies to recover from JWT decryption errors after secret change
  res.cookies.set('next-auth.session-token', '', { maxAge: 0, path: '/' })
  res.cookies.set('__Secure-next-auth.session-token', '', { maxAge: 0, path: '/' })
  res.cookies.set('next-auth.csrf-token', '', { maxAge: 0, path: '/' })

  return res
}


