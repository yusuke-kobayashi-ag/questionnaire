import { NextRequest, NextResponse } from 'next/server'
import { surveyOperations, respondentOperations, responseOperations } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { surveyId, respondentInfo, answers } = await request.json()
    
    console.log('🔍 回答送信開始')
    console.log('Survey ID:', surveyId)
    console.log('Respondent Info:', respondentInfo)
    console.log('Answers:', answers)

    if (!surveyId || !respondentInfo || !answers) {
      console.log('❌ 必要な情報が不足')
      return NextResponse.json(
        { error: '必要な情報が不足しています' },
        { status: 400 }
      )
    }

    // Verify survey exists and is active
    console.log('🔍 アンケート存在確認中...')
    const survey = await surveyOperations.findUnique(surveyId)
    console.log('Survey found:', survey ? 'Yes' : 'No')

    if (!survey || !survey.is_active) {
      console.log('❌ アンケートが見つからないか無効')
      return NextResponse.json(
        { error: 'アンケートが見つかりません' },
        { status: 404 }
      )
    }

    // Create respondent
    console.log('🔍 回答者作成中...')
    const respondent = await respondentOperations.create({
      name: respondentInfo.name,
      email: respondentInfo.email,
      gender: respondentInfo.gender || null,
      age: respondentInfo.age || null,
    })
    console.log('✅ 回答者作成完了:', respondent.id)

    // Prepare responses
    console.log('🔍 回答データ準備中...')
    const responsesToCreate: any[] = []
    
    answers.forEach((answer: any, index: number) => {
      console.log(`回答 ${index + 1}:`, answer)
      
      if (answer.selectedOptions && answer.selectedOptions.length > 0) {
        // Handle multiple choice questions
        console.log('複数選択回答:', answer.selectedOptions)
        answer.selectedOptions.forEach((optionId: number) => {
          responsesToCreate.push({
            surveyId,
            respondentId: respondent.id,
            questionId: answer.questionId,
            optionId,
            attemptNumber: 1,
          })
        })
      } else {
        // Handle single response questions
        console.log('単一回答:', { answerText: answer.answerText, optionId: answer.optionId })
        responsesToCreate.push({
          surveyId,
          respondentId: respondent.id,
          questionId: answer.questionId,
          answerText: answer.answerText || null,
          optionId: answer.optionId || null,
          attemptNumber: 1,
        })
      }
    })

    console.log('🔍 保存予定の回答数:', responsesToCreate.length)
    console.log('保存データ:', responsesToCreate)

    // Create all responses
    console.log('🔍 回答データ保存中...')
    const savedResponses = await responseOperations.createMany(responsesToCreate)
    console.log('✅ 回答データ保存完了:', savedResponses.length, '件')

    return NextResponse.json({ 
      success: true, 
      message: '回答が正常に送信されました',
      respondentId: respondent.id 
    })

  } catch (error) {
    console.error('Error saving survey response:', error)
    return NextResponse.json(
      { error: '回答の保存に失敗しました' },
      { status: 500 }
    )
  }
} 