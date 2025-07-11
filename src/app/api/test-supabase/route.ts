import { NextResponse } from 'next/server'
import { testSupabaseConnection } from '@/lib/supabase-test'

export async function GET() {
  try {
    const testResult = await testSupabaseConnection()
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      ...testResult
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        message: 'テスト実行中にエラーが発生しました',
        error: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    )
  }
} 