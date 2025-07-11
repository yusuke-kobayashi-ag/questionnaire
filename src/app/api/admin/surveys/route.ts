import { NextRequest, NextResponse } from 'next/server'
import { surveyOperations } from '@/lib/database'
import { verifyAdminSession } from '@/lib/auth'

export async function GET() {
  try {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const surveys = await surveyOperations.findMany()

    return NextResponse.json(surveys)
  } catch (error) {
    console.error('Error fetching surveys:', error)
    return NextResponse.json(
      { error: 'アンケート一覧の取得に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await verifyAdminSession()
    if (!isAuthenticated) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { title, description, questions } = await request.json()

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'タイトルと質問が必要です' },
        { status: 400 }
      )
    }

    const survey = await surveyOperations.create({
      title,
      description,
      questions
    })

    return NextResponse.json(survey)
  } catch (error) {
    console.error('Error creating survey:', error)
    return NextResponse.json(
      { error: 'アンケートの作成に失敗しました' },
      { status: 500 }
    )
  }
} 