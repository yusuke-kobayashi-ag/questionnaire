import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_SESSION_COOKIE = 'admin_session'

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    throw new Error('Admin password not configured')
  }
  
  // For development, use plain text comparison
  // In production, you should hash the password
  return password === adminPassword
}

export async function createAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionToken = generateSessionToken()
  
  cookieStore.set(ADMIN_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  })
}

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)
  
  if (!sessionToken) {
    return false
  }
  
  // In a real app, you would verify the token against a database
  // For this demo, we'll consider any token valid
  return true
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_SESSION_COOKIE)
}

export async function requireAdminAuth(): Promise<void> {
  const isAuthenticated = await verifyAdminSession()
  if (!isAuthenticated) {
    redirect('/admin/login')
  }
}

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
} 