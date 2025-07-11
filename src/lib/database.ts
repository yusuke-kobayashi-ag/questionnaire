import { supabase } from './supabase'

// Survey operations
export const surveyOperations = {
  async findMany(options?: { where?: { isActive?: boolean } }) {
    try {
      let query = supabase
        .from('surveys')
        .select(`
          *,
          questions(
            *,
            options(*)
          )
        `)
        .order('created_at', { ascending: false })

      if (options?.where?.isActive !== undefined) {
        query = query.eq('is_active', options.where.isActive)
      }

      const { data, error } = await query
      if (error) {
        console.error('Error in findMany:', error)
        throw error
      }
      
      // Transform snake_case to camelCase
      return (data || []).map(survey => ({
        ...survey,
        createdAt: survey.created_at,
        isActive: survey.is_active,
        questions: survey.questions?.map((q: any) => ({
          ...q,
          surveyId: q.survey_id,
          questionText: q.question_text,
          questionType: q.question_type,
          questionOrder: q.question_order,
          minValue: q.min_value,
          maxValue: q.max_value,
          stepValue: q.step_value,
          createdAt: q.created_at,
          options: q.options?.map((o: any) => ({
            ...o,
            questionId: o.question_id,
            optionText: o.option_text,
            optionOrder: o.option_order,
            createdAt: o.created_at
          }))
        }))
      }))
    } catch (error) {
      console.error('Error in findMany:', error)
      throw error
    }
  },

  async findUnique(id: number, options?: { include?: any }) {
    try {
      console.log('🔍 Survey findUnique開始 ID:', id, 'options:', options)
      
      // 基本のアンケート情報を取得
      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single()

      if (surveyError) {
        console.error('❌ Survey取得エラー:', surveyError)
        throw surveyError
      }
      
      if (!survey) {
        console.log('❌ Survey not found')
        return null
      }

      let result: any = {
        ...survey,
        createdAt: survey.created_at,
        isActive: survey.is_active
      }

      if (options?.include?.questions) {
        console.log('🔍 関連データも取得します')
        
        // 質問を取得
        const { data: questions, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('survey_id', id)
          .order('question_order')

        if (questionsError) {
          console.error('❌ Questions取得エラー:', questionsError)
          throw questionsError
        }

        // 各質問の選択肢を取得
        const questionsWithOptions = await Promise.all(
          (questions || []).map(async (question: any) => {
            const { data: options, error: optionsError } = await supabase
              .from('options')
              .select('*')
              .eq('question_id', question.id)
              .order('option_order')

            if (optionsError) {
              console.error('❌ Options取得エラー:', optionsError)
            }

            return {
              ...question,
              surveyId: question.survey_id,
              questionText: question.question_text,
              questionType: question.question_type,
              questionOrder: question.question_order,
              minValue: question.min_value,
              maxValue: question.max_value,
              stepValue: question.step_value,
              createdAt: question.created_at,
              options: (options || []).map((o: any) => ({
                ...o,
                questionId: o.question_id,
                optionText: o.option_text,
                optionOrder: o.option_order,
                createdAt: o.created_at
              })),
              responses: [] // 後で設定
            }
          })
        )

        // アンケート全体の回答を取得
        const { data: responses, error: responsesError } = await supabase
          .from('responses')
          .select('*')
          .eq('survey_id', id)

        if (responsesError) {
          console.error('❌ Responses取得エラー:', responsesError)
          console.log('設定されている回答数: 0')
        } else {
          console.log('設定されている回答数:', responses?.length || 0)
        }

        // 回答者情報を取得
        let respondents: any[] = []
        const respondentIds = Array.from(new Set((responses || []).map((r: any) => r.respondent_id)))
        
        if (respondentIds.length > 0) {
          const { data: respondentsData, error: respondentsError } = await supabase
            .from('respondents')
            .select('*')
            .in('id', respondentIds)

          if (respondentsError) {
            console.error('❌ Respondents取得エラー:', respondentsError)
          } else {
            respondents = respondentsData || []
          }
        }

        // オプション情報を取得（選択肢回答用）
        let allOptions: any[] = []
        if (questionsWithOptions.length > 0) {
          const optionIds = Array.from(new Set((responses || []).map((r: any) => r.option_id).filter(Boolean)))
          if (optionIds.length > 0) {
            const { data: optionsData, error: allOptionsError } = await supabase
              .from('options')
              .select('*')
              .in('id', optionIds)

            if (!allOptionsError) {
              allOptions = optionsData || []
            }
          }
        }

        // 回答データを変換
        const transformedResponses = (responses || []).map((r: any) => {
          const respondent = respondents?.find((resp: any) => resp.id === r.respondent_id)
          const option = allOptions.find((opt: any) => opt.id === r.option_id)
          
          return {
            ...r,
            surveyId: r.survey_id,
            respondentId: r.respondent_id,
            questionId: r.question_id,
            answerText: r.answer_text,
            optionId: r.option_id,
            attemptNumber: r.attempt_number,
            createdAt: r.created_at,
            respondent: respondent ? {
              ...respondent,
              createdAt: respondent.created_at
            } : null,
            option: option ? {
              ...option,
              questionId: option.question_id,
              optionText: option.option_text,
              optionOrder: option.option_order,
              createdAt: option.created_at
            } : null
          }
        })

        // 各質問に対応する回答を設定
        questionsWithOptions.forEach((question: any) => {
          question.responses = transformedResponses.filter((r: any) => r.questionId === question.id)
        })

        result.questions = questionsWithOptions
        result.responses = transformedResponses

        console.log('📊 詳細データ構造:')
        console.log('- Questions:', questionsWithOptions.length)
        questionsWithOptions.forEach((q: any, index: number) => {
          console.log(`  Q${index + 1}: ${q.questionText} (${q.questionType}) - 回答数: ${q.responses?.length || 0}`)
        })
        console.log('- Total Responses:', transformedResponses.length)
        console.log('- Unique Respondents:', Array.from(new Set(transformedResponses.map((r: any) => r.respondentId))).length)
      }
      
      console.log('✅ Survey findUnique 成功')
      console.log('取得したデータ構造:', {
        id: result.id,
        title: result.title,
        questionsCount: result.questions?.length || 0,
        responsesCount: result.responses?.length || 0
      })
      
      return result
    } catch (error) {
      console.error('❌ Error in findUnique:', error)
      throw error
    }
  },

  async create(surveyData: {
    title: string
    description?: string
    questions: Array<{
      questionText: string
      questionType: string
      questionOrder: number
      minValue?: number
      maxValue?: number
      stepValue?: number
      options?: Array<{
        optionText: string
        optionOrder: number
      }>
    }>
  }) {
    try {
      // Create survey
      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .insert({
          title: surveyData.title,
          description: surveyData.description
        })
        .select()
        .single()

      if (surveyError) {
        console.error('Survey creation error:', surveyError)
        throw surveyError
      }

      // Create questions
      const questionsToInsert = surveyData.questions.map((q, index) => ({
        survey_id: survey.id,
        question_text: q.questionText,
        question_type: q.questionType,
        question_order: index + 1,
        min_value: q.minValue,
        max_value: q.maxValue,
        step_value: q.stepValue
      }))

      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert)
        .select()

      if (questionsError) {
        console.error('Questions creation error:', questionsError)
        throw questionsError
      }

      // Create options
      const allOptions: any[] = []
      surveyData.questions.forEach((q, qIndex) => {
        if (q.options) {
          q.options.forEach((option, oIndex) => {
            allOptions.push({
              question_id: questions[qIndex].id,
              option_text: option.optionText,
              option_order: oIndex + 1
            })
          })
        }
      })

      if (allOptions.length > 0) {
        const { error: optionsError } = await supabase
          .from('options')
          .insert(allOptions)

        if (optionsError) {
          console.error('Options creation error:', optionsError)
          throw optionsError
        }
      }

      // Return survey with transformed field names for consistency
      return {
        ...survey,
        createdAt: survey.created_at,
        isActive: survey.is_active
      }
    } catch (error) {
      console.error('Error in survey creation:', error)
      throw error
    }
  },

  async update(id: number, updateData: {
    title?: string
    description?: string | null
    is_active?: boolean
  }) {
    try {
      console.log('🔍 Survey update開始 ID:', id, 'データ:', updateData)
      
      const { data: survey, error } = await supabase
        .from('surveys')
        .update({
          title: updateData.title,
          description: updateData.description,
          is_active: updateData.is_active
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Survey update エラー:', error)
        throw error
      }
      
      console.log('✅ Survey update 成功:', survey)
      
      // Return survey with transformed field names for consistency
      return {
        ...survey,
        createdAt: survey.created_at,
        isActive: survey.is_active
      }
    } catch (error) {
      console.error('❌ Error in survey update:', error)
      throw error
    }
  },

  async delete(id: number) {
    try {
      console.log('🗑️ Survey delete開始 ID:', id)
      
      // 関連する回答を削除
      const { error: responsesError } = await supabase
        .from('responses')
        .delete()
        .eq('survey_id', id)

      if (responsesError) {
        console.error('❌ Responses削除エラー:', responsesError)
        throw responsesError
      }

      // 関連する選択肢を削除（質問に紐づくもの）
      const { data: questions } = await supabase
        .from('questions')
        .select('id')
        .eq('survey_id', id)

      if (questions && questions.length > 0) {
        const questionIds = questions.map((q: any) => q.id)
        const { error: optionsError } = await supabase
          .from('options')
          .delete()
          .in('question_id', questionIds)

        if (optionsError) {
          console.error('❌ Options削除エラー:', optionsError)
          throw optionsError
        }
      }

      // 関連する質問を削除
      const { error: questionsError } = await supabase
        .from('questions')
        .delete()
        .eq('survey_id', id)

      if (questionsError) {
        console.error('❌ Questions削除エラー:', questionsError)
        throw questionsError
      }

      // アンケート本体を削除
      const { error: surveyError } = await supabase
        .from('surveys')
        .delete()
        .eq('id', id)

      if (surveyError) {
        console.error('❌ Survey削除エラー:', surveyError)
        throw surveyError
      }

      console.log('✅ Survey delete 成功')
      return true
    } catch (error) {
      console.error('❌ Error in delete:', error)
      throw error
    }
  }
}

// Question operations
export const questionOperations = {
  async update(id: number, updateData: {
    question_text?: string
    question_type?: string
    min_value?: number | null
    max_value?: number | null
    step_value?: number | null
  }) {
    try {
      console.log('🔍 Question update開始 ID:', id, 'データ:', updateData)
      
      const { data: question, error } = await supabase
        .from('questions')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Question update エラー:', error)
        throw error
      }
      
      console.log('✅ Question update 成功:', question)
      return question
    } catch (error) {
      console.error('❌ Error in question update:', error)
      throw error
    }
  },

  async create(questionData: {
    survey_id: number
    question_text: string
    question_type: string
    question_order: number
    min_value?: number
    max_value?: number
    step_value?: number
  }) {
    try {
      console.log('🔍 Question create開始:', questionData)
      
      const { data: question, error } = await supabase
        .from('questions')
        .insert(questionData)
        .select()
        .single()

      if (error) {
        console.error('❌ Question create エラー:', error)
        throw error
      }
      
      console.log('✅ Question create 成功:', question)
      return question
    } catch (error) {
      console.error('❌ Error in question create:', error)
      throw error
    }
  },

  async delete(id: number) {
    try {
      console.log('🔍 Question delete開始 ID:', id)
      
      // まず関連する選択肢を削除
      const { error: optionsError } = await supabase
        .from('options')
        .delete()
        .eq('question_id', id)

      if (optionsError) {
        console.error('❌ Options delete エラー:', optionsError)
        throw optionsError
      }

      // 質問を削除
      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Question delete エラー:', error)
        throw error
      }
      
      console.log('✅ Question delete 成功')
      return true
    } catch (error) {
      console.error('❌ Error in question delete:', error)
      throw error
    }
  }
}

// Option operations
export const optionOperations = {
  async updateMany(questionId: number, options: Array<{
    id?: number
    option_text: string
    option_order: number
  }>) {
    try {
      console.log('🔍 Options updateMany開始 questionId:', questionId, 'options:', options)
      
      // 既存の選択肢をすべて削除
      const { error: deleteError } = await supabase
        .from('options')
        .delete()
        .eq('question_id', questionId)

      if (deleteError) {
        console.error('❌ Options delete エラー:', deleteError)
        throw deleteError
      }

      // 新しい選択肢を挿入
      if (options.length > 0) {
        const optionsToInsert = options.map(option => ({
          question_id: questionId,
          option_text: option.option_text,
          option_order: option.option_order
        }))

        const { data, error: insertError } = await supabase
          .from('options')
          .insert(optionsToInsert)
          .select()

        if (insertError) {
          console.error('❌ Options insert エラー:', insertError)
          throw insertError
        }

        console.log('✅ Options updateMany 成功:', data)
        return data
      }

      return []
    } catch (error) {
      console.error('❌ Error in options updateMany:', error)
      throw error
    }
  }
}

// Respondent operations
export const respondentOperations = {
  async create(data: {
    name: string
    email: string
    gender?: string
    age?: number
  }) {
    try {
      console.log('🔍 Supabase respondents挿入開始:', data)
      
      const { data: respondent, error } = await supabase
        .from('respondents')
        .insert({
          name: data.name,
          email: data.email,
          gender: data.gender,
          age: data.age
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Supabase respondents挿入エラー:', error)
        throw error
      }
      
      console.log('✅ Supabase respondents挿入成功:', respondent)
      
      // Transform to camelCase
      return {
        ...respondent,
        createdAt: respondent.created_at
      }
    } catch (error) {
      console.error('❌ Error in respondent creation:', error)
      throw error
    }
  }
}

// Response operations
export const responseOperations = {
  async createMany(responses: Array<{
    surveyId: number
    respondentId: number
    questionId: number
    answerText?: string
    optionId?: number
    attemptNumber?: number
  }>) {
    try {
      console.log('🔍 Supabase responses挿入開始:', responses.length, '件')
      
      const responsesToInsert = responses.map(r => ({
        survey_id: r.surveyId,
        respondent_id: r.respondentId,
        question_id: r.questionId,
        answer_text: r.answerText,
        option_id: r.optionId,
        attempt_number: r.attemptNumber || 1
      }))
      
      console.log('変換後データ:', responsesToInsert)

      const { data, error } = await supabase
        .from('responses')
        .insert(responsesToInsert)
        .select()

      if (error) {
        console.error('❌ Supabase responses挿入エラー:', error)
        console.error('エラー詳細:', error.message, error.details, error.hint)
        throw error
      }
      
      console.log('✅ Supabase responses挿入成功:', data?.length || 0, '件')
      console.log('挿入されたデータ:', data)
      
      return data?.map(r => ({
        ...r,
        surveyId: r.survey_id,
        respondentId: r.respondent_id,
        questionId: r.question_id,
        answerText: r.answer_text,
        optionId: r.option_id,
        attemptNumber: r.attempt_number,
        createdAt: r.created_at
      })) || []
    } catch (error) {
      console.error('❌ Error in response creation:', error)
      throw error
    }
  }
} 