import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { surveyOperations } from '@/lib/database'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth()
    
    const resolvedParams = await params
    const surveyId = parseInt(resolvedParams.id)
    
    if (isNaN(surveyId)) {
      return NextResponse.json({ error: '無効なアンケートIDです' }, { status: 400 })
    }

    const body = await request.json()
    const { title, description, is_active } = body

    if (!title) {
      return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 })
    }

    // アンケートが存在することを確認
    const existingSurvey = await surveyOperations.findUnique(surveyId)
    if (!existingSurvey) {
      return NextResponse.json({ error: 'アンケートが見つかりません' }, { status: 404 })
    }

    // アンケートを更新
    const updatedSurvey = await surveyOperations.update(surveyId, {
      title,
      description: description || null,
      is_active: Boolean(is_active)
    })

    return NextResponse.json(updatedSurvey)
  } catch (error) {
    console.error('Survey update error:', error)
    return NextResponse.json(
      { error: 'アンケートの更新に失敗しました' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth()
    
    const resolvedParams = await params
    const surveyId = parseInt(resolvedParams.id)
    
    if (isNaN(surveyId)) {
      return NextResponse.json({ error: '無効なアンケートIDです' }, { status: 400 })
    }

    const survey = await surveyOperations.findUnique(surveyId, { include: { questions: true } })
    
    if (!survey) {
      return NextResponse.json({ error: 'アンケートが見つかりません' }, { status: 404 })
    }

    return NextResponse.json(survey)
  } catch (error) {
    console.error('Survey fetch error:', error)
    return NextResponse.json(
      { error: 'アンケートの取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth()
    
    const resolvedParams = await params
    const surveyId = parseInt(resolvedParams.id)
    
    if (isNaN(surveyId)) {
      return NextResponse.json({ error: '無効なアンケートIDです' }, { status: 400 })
    }

    // アンケートが存在することを確認
    const existingSurvey = await surveyOperations.findUnique(surveyId)
    if (!existingSurvey) {
      return NextResponse.json({ error: 'アンケートが見つかりません' }, { status: 404 })
    }

    // アンケートと関連データを削除
    await surveyOperations.delete(surveyId)

    return NextResponse.json({ message: 'アンケートを削除しました' })
  } catch (error) {
    console.error('Survey delete error:', error)
    return NextResponse.json(
      { error: 'アンケートの削除に失敗しました' },
      { status: 500 }
    )
  }
} 