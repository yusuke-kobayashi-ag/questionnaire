import { supabase } from './supabase'

// Supabase接続テスト
export async function testSupabaseConnection() {
  try {
    console.log('🔍 Supabase接続テストを開始...')
    
    // 1. Supabaseクライアントの初期化確認
    if (!supabase) {
      throw new Error('Supabaseクライアントが初期化されていません')
    }
    console.log('✅ Supabaseクライアント初期化: OK')

    // 2. 環境変数の確認
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Supabase環境変数が設定されていません')
    }
    console.log('✅ 環境変数設定: OK')
    console.log(`   URL: ${url}`)
    console.log(`   Key: ${key.substring(0, 20)}...`)

    // 3. データベース接続テスト（surveysテーブルの存在確認）
    const { data, error } = await supabase
      .from('surveys')
      .select('count')
      .limit(1)

    if (error) {
      console.error('❌ データベース接続エラー:', error)
      throw error
    }
    
    console.log('✅ データベース接続: OK')
    console.log('✅ surveysテーブル: 存在確認済み')

    // 4. テーブル構造の確認
    const { data: tableData, error: tableError } = await supabase
      .from('surveys')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ テーブル構造確認エラー:', tableError)
    } else {
      console.log('✅ テーブル構造確認: OK')
    }

    return {
      success: true,
      message: 'Supabase接続テスト完了',
      url,
      tablesCount: data?.length || 0
    }

  } catch (error) {
    console.error('❌ Supabase接続テスト失敗:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : '不明なエラー',
      error
    }
  }
}

// 簡単な接続確認
export async function quickConnectionTest() {
  try {
    const { data, error } = await supabase
      .from('surveys')
      .select('id')
      .limit(1)
    
    return { success: !error, error }
  } catch (error) {
    return { success: false, error }
  }
} 