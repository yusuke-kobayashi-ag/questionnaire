'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import QuestionEditForm from './QuestionEditForm'
import { QuestionType } from '@/types'

interface Option {
  id?: number
  optionText: string
  optionOrder: number
}

interface Question {
  id?: number
  questionText: string
  questionType: QuestionType
  questionOrder: number
  minValue?: number
  maxValue?: number
  stepValue?: number
  options: Option[]
}

interface Survey {
  id: number
  title: string
  description?: string
  is_active: boolean
  created_at: string
  questions: any[]
}

interface SurveyEditFormProps {
  survey: Survey
}

export default function SurveyEditForm({ survey }: SurveyEditFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: survey.title,
    description: survey.description || '',
    is_active: survey.is_active
  })
  
  // 質問データを変換
  const [questions, setQuestions] = useState<Question[]>(
    survey.questions.map((q: any) => ({
      id: q.id,
      questionText: q.question_text,
      questionType: q.question_type as QuestionType,
      questionOrder: q.question_order,
      minValue: q.min_value,
      maxValue: q.max_value,
      stepValue: q.step_value,
      options: (q.options || []).map((o: any) => ({
        id: o.id,
        optionText: o.option_text,
        optionOrder: o.option_order
      }))
    }))
  )
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // アンケート基本情報を更新
      const surveyResponse = await fetch(`/api/admin/surveys/${survey.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!surveyResponse.ok) {
        const data = await surveyResponse.json()
        throw new Error(data.error || 'アンケート更新に失敗しました')
      }

      // 既存質問の更新と新規質問の作成を処理
      const existingQuestions = questions.filter(q => q.id)
      const newQuestions = questions.filter(q => !q.id)

      // 既存質問を更新
      if (existingQuestions.length > 0) {
        const questionsResponse = await fetch(`/api/admin/surveys/${survey.id}/questions`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ questions: existingQuestions }),
        })

        if (!questionsResponse.ok) {
          const data = await questionsResponse.json()
          throw new Error(data.error || '質問更新に失敗しました')
        }
      }

      // 新規質問を作成
      for (const newQuestion of newQuestions) {
        const response = await fetch(`/api/admin/surveys/${survey.id}/questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            questionText: newQuestion.questionText,
            questionType: newQuestion.questionType,
            questionOrder: newQuestion.questionOrder,
            minValue: newQuestion.minValue,
            maxValue: newQuestion.maxValue,
            stepValue: newQuestion.stepValue,
            options: newQuestion.options
          }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || '新規質問作成に失敗しました')
        }
      }

      router.push(`/admin/surveys/${survey.id}`)
    } catch (error: any) {
      setError(error.message || '更新に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleQuestionUpdate = (index: number, updatedQuestion: Question) => {
    setQuestions(prev => prev.map((q, i) => i === index ? updatedQuestion : q))
  }

  const handleQuestionDelete = async (index: number) => {
    const question = questions[index]
    
    if (question.id) {
      try {
        const response = await fetch(`/api/admin/surveys/${survey.id}/questions`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ questionId: question.id }),
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || '質問の削除に失敗しました')
        }
      } catch (error: any) {
        setError(error.message || '質問の削除に失敗しました')
        return
      }
    }

    setQuestions(prev => prev.filter((_, i) => i !== index))
  }

  const addNewQuestion = () => {
    const newQuestion: Question = {
      questionText: '',
      questionType: QuestionType.TEXT_INPUT,
      questionOrder: questions.length + 1,
      options: []
    }
    setQuestions(prev => [...prev, newQuestion])
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <Link
            href={`/admin/surveys/${survey.id}`}
            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mb-2 inline-block"
          >
            ← 詳細に戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">アンケート編集</h1>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">基本情報</h2>
        </div>
        
        <div className="px-6 py-4 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              アンケートタイトル *
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              説明
            </label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-900">
                アンケートを有効にする
              </span>
            </label>
            <p className="text-xs text-gray-600 mt-1">
              有効にすると回答者がアンケートに回答できるようになります
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <Link
            href={`/admin/surveys/${survey.id}`}
            className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '更新中...' : '更新'}
          </button>
        </div>
      </form>

      {/* Questions Section */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">質問編集</h2>
            <button
              type="button"
              onClick={addNewQuestion}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              + 質問を追加
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            質問の内容、タイプ、選択肢を編集できます。
          </p>
        </div>
        <div className="p-6">
          {questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">質問がありません</p>
              <button
                type="button"
                onClick={addNewQuestion}
                className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                最初の質問を追加
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, index) => (
                <QuestionEditForm
                  key={index}
                  question={question}
                  index={index}
                  onUpdate={(updatedQuestion) => handleQuestionUpdate(index, updatedQuestion)}
                  onDelete={handleQuestionDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 