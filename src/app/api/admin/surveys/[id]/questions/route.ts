import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { questionOperations, optionOperations, surveyOperations } from '@/lib/database'

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
    const { questions } = body

    if (!Array.isArray(questions)) {
      return NextResponse.json({ error: '質問データが無効です' }, { status: 400 })
    }

    console.log('🔍 質問一括更新開始 surveyId:', surveyId, '質問数:', questions.length)

    const results = []

    for (const question of questions) {
      try {
        // 質問を更新
        const updatedQuestion = await questionOperations.update(question.id, {
          question_text: question.questionText,
          question_type: question.questionType,
          min_value: question.minValue || null,
          max_value: question.maxValue || null,
          step_value: question.stepValue || null
        })

        // 選択肢も更新（該当する質問タイプの場合）
        if (question.options && question.options.length > 0) {
          const optionsData = question.options.map((option: any, index: number) => ({
            option_text: option.optionText,
            option_order: index + 1
          }))

          await optionOperations.updateMany(question.id, optionsData)
        } else if (question.questionType !== 'SINGLE_CHOICE' && question.questionType !== 'MULTIPLE_CHOICE') {
          // 選択肢が不要な質問タイプの場合、既存の選択肢を削除
          await optionOperations.updateMany(question.id, [])
        }

        results.push(updatedQuestion)
      } catch (error) {
        console.error(`質問ID ${question.id} の更新エラー:`, error)
        throw error
      }
    }

    console.log('✅ 質問一括更新成功')
    return NextResponse.json({ success: true, questions: results })
  } catch (error) {
    console.error('Questions update error:', error)
    return NextResponse.json(
      { error: '質問の更新に失敗しました' },
      { status: 500 }
    )
  }
}

export async function POST(
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
    const { questionText, questionType, questionOrder, minValue, maxValue, stepValue, options } = body

    if (!questionText || !questionType) {
      return NextResponse.json({ error: '質問文と質問タイプは必須です' }, { status: 400 })
    }

    console.log('🔍 質問作成開始 surveyId:', surveyId)

    // 質問を作成
    const newQuestion = await questionOperations.create({
      survey_id: surveyId,
      question_text: questionText,
      question_type: questionType,
      question_order: questionOrder || 1,
      min_value: minValue || null,
      max_value: maxValue || null,
      step_value: stepValue || null
    })

    // 選択肢を作成（該当する質問タイプの場合）
    if (options && options.length > 0) {
      const optionsData = options.map((option: any, index: number) => ({
        option_text: option.optionText,
        option_order: index + 1
      }))

      await optionOperations.updateMany(newQuestion.id, optionsData)
    }

    console.log('✅ 質問作成成功')
    return NextResponse.json(newQuestion)
  } catch (error) {
    console.error('Question creation error:', error)
    return NextResponse.json(
      { error: '質問の作成に失敗しました' },
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
    
    const body = await request.json()
    const { questionId } = body

    if (!questionId) {
      return NextResponse.json({ error: '質問IDが必要です' }, { status: 400 })
    }

    console.log('🔍 質問削除開始 questionId:', questionId)

    await questionOperations.delete(questionId)

    console.log('✅ 質問削除成功')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Question deletion error:', error)
    return NextResponse.json(
      { error: '質問の削除に失敗しました' },
      { status: 500 }
    )
  }
} 