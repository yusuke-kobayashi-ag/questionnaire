import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword, createAdminSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json(
        { error: 'パスワードが必要です' },
        { status: 400 }
      )
    }
    
    const isValid = await verifyAdminPassword(password)
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'パスワードが間違っています' },
        { status: 401 }
      )
    }
    
    await createAdminSession()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'ログインに失敗しました' },
      { status: 500 }
    )
  }
} 