import { type NextRequest } from 'next/server'

export const DEV_USER = {
  id: 'dev-user-mika-bymik-0000-0000-0000-000000000001',
  email: 'mikagonz@gmail.com',
  role: 'authenticated',
}

export function isDevAuth(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== 'development') return false
  return req.cookies.get('dev-auth')?.value === 'true'
}
