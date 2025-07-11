import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('🔍 データベーステーブル状態確認開始')
    
    const results: any = {
      timestamp: new Date().toISOString(),
      tables: {}
    }

    // 各テーブルの状態確認
    const tables = ['surveys', 'questions', 'options', 'respondents', 'responses']
    
    for (const table of tables) {
      try {
        console.log(`🔍 ${table}テーブル確認中...`)
        
        // テーブルの存在確認
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(5)

        if (error) {
          console.error(`❌ ${table}テーブルエラー:`, error)
          results.tables[table] = {
            exists: false,
            error: error.message,
            count: 0
          }
        } else {
          console.log(`✅ ${table}テーブル正常:`, data?.length || 0, '件')
          
          // カウント取得
          const { count, error: countError } = await supabase
            .from(table)
            .select('*', { count: 'exact', head: true })

          results.tables[table] = {
            exists: true,
            count: count || 0,
            sampleData: data?.slice(0, 2) || []
          }
        }
      } catch (err) {
        console.error(`❌ ${table}テーブル例外:`, err)
        results.tables[table] = {
          exists: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          count: 0
        }
      }
    }

    // 環境変数確認（一時的にデバッグ用）
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    results.environment = {
      supabaseUrl: url ? `${url.substring(0, 30)}...` : '未設定',
      supabaseKey: key ? `${key.substring(0, 30)}...` : '未設定',
      urlFull: url || 'なし',
      keyFull: key ? `${key.substring(0, 50)}...` : 'なし'
    }

    console.log('✅ データベース状態確認完了')
    return NextResponse.json(results)

  } catch (error) {
    console.error('❌ データベース状態確認エラー:', error)
    return NextResponse.json(
      {
        error: 'データベース状態確認に失敗しました',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 