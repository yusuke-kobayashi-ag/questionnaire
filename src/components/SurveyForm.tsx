'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuestionType } from '@/types'

interface QuestionFormData {
  questionText: string
  questionType: QuestionType
  minValue?: number
  maxValue?: number
  stepValue?: number
  options: { optionText: string }[]
}

interface SurveyFormData {
  title: string
  description: string
  questions: QuestionFormData[]
}

export default function SurveyForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<SurveyFormData>({
    title: '',
    description: '',
    questions: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, {
        questionText: '',
        questionType: QuestionType.TEXT_INPUT,
        options: []
      }]
    }))
  }

  const updateQuestion = (index: number, field: keyof QuestionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i === index) {
          const updatedQuestion = { ...q, [field]: value }
          
          // 質問タイプが変更された場合の特別処理
          if (field === 'questionType') {
            const newType = value as QuestionType
            
            // 比較スライダーの場合
            if (newType === QuestionType.COMPARISON_SLIDER) {
              updatedQuestion.minValue = -10
              updatedQuestion.maxValue = 10
              updatedQuestion.stepValue = 1
              updatedQuestion.options = [
                { optionText: '選択肢A' },
                { optionText: '選択肢B' }
              ]
            }
            // 通常のスライダーの場合
            else if (newType === QuestionType.SLIDER) {
              updatedQuestion.minValue = 0
              updatedQuestion.maxValue = 100
              updatedQuestion.stepValue = 1
              updatedQuestion.options = []
            }
            // 単一選択・複数選択の場合
            else if (newType === QuestionType.SINGLE_CHOICE || newType === QuestionType.MULTIPLE_CHOICE) {
              updatedQuestion.minValue = undefined
              updatedQuestion.maxValue = undefined
              updatedQuestion.stepValue = undefined
              if (updatedQuestion.options.length === 0) {
                updatedQuestion.options = [{ optionText: '' }]
              }
            }
            // その他の場合
            else {
              updatedQuestion.minValue = undefined
              updatedQuestion.maxValue = undefined
              updatedQuestion.stepValue = undefined
              updatedQuestion.options = []
            }
          }
          
          return updatedQuestion
        }
        return q
      })
    }))
  }

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  const addOption = (questionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: [...q.options, { optionText: '' }] }
          : q
      )
    }))
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => {
        if (i === questionIndex) {
          const updatedOptions = [...q.options]
          
          // 配列の長さを確保
          while (updatedOptions.length <= optionIndex) {
            updatedOptions.push({ optionText: '' })
          }
          
          updatedOptions[optionIndex] = { optionText: value }
          
          return { ...q, options: updatedOptions }
        }
        return q
      })
    }))
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === questionIndex 
          ? { ...q, options: q.options.filter((_, j) => j !== optionIndex) }
          : q
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/surveys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push('/admin')
      } else {
        const data = await response.json()
        setError(data.error || 'アンケートの作成に失敗しました')
      }
    } catch (error) {
      setError('アンケートの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const needsOptions = (type: QuestionType) => {
    return type === QuestionType.SINGLE_CHOICE || type === QuestionType.MULTIPLE_CHOICE || type === QuestionType.COMPARISON_SLIDER
  }

  const needsRange = (type: QuestionType) => {
    return type === QuestionType.SLIDER || type === QuestionType.COMPARISON_SLIDER
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Survey Basic Info */}
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-900">
              アンケートタイトル *
            </label>
            <input
              type="text"
              id="title"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-900">
              アンケート説明
            </label>
            <textarea
              id="description"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">質問</h3>
            <button
              type="button"
              onClick={addQuestion}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              質問を追加
            </button>
          </div>

          {formData.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-medium text-gray-900">
                  質問 {questionIndex + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="text-red-600 hover:text-red-900 text-sm"
                >
                  削除
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900">
                    質問文 *
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                    value={question.questionText}
                    onChange={(e) => updateQuestion(questionIndex, 'questionText', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900">
                    質問タイプ *
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                    value={question.questionType}
                    onChange={(e) => updateQuestion(questionIndex, 'questionType', e.target.value as QuestionType)}
                  >
                    <option value={QuestionType.TEXT_INPUT}>テキスト入力</option>
                    <option value={QuestionType.NUMBER_INPUT}>数値入力</option>
                    <option value={QuestionType.SINGLE_CHOICE}>単一選択</option>
                    <option value={QuestionType.MULTIPLE_CHOICE}>複数選択</option>
                    <option value={QuestionType.SLIDER}>スライダー</option>
                    <option value={QuestionType.COMPARISON_SLIDER}>比較スライダー</option>
                  </select>
                </div>
              </div>

              {/* Range inputs for sliders */}
              {needsRange(question.questionType) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      最小値
                    </label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                      value={question.minValue || ''}
                      onChange={(e) => updateQuestion(questionIndex, 'minValue', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      最大値
                    </label>
                    <input
                      type="number"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                      value={question.maxValue || ''}
                      onChange={(e) => updateQuestion(questionIndex, 'maxValue', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900">
                      ステップ
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                      value={question.stepValue || ''}
                      onChange={(e) => updateQuestion(questionIndex, 'stepValue', e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              )}

              {/* Options for choice questions */}
              {(question.questionType === QuestionType.SINGLE_CHOICE || question.questionType === QuestionType.MULTIPLE_CHOICE) && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-900">
                      選択肢
                    </label>
                    <button
                      type="button"
                      onClick={() => addOption(questionIndex)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      選択肢を追加
                    </button>
                  </div>

                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder={`選択肢 ${optionIndex + 1}`}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                        value={option.optionText}
                        onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Options for comparison slider */}
              {question.questionType === QuestionType.COMPARISON_SLIDER && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-900">
                    比較対象 *
                  </label>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">選択肢A</label>
                      <input
                        type="text"
                        required
                        placeholder="例: 製品A、チームA、方法A"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                        value={question.options[0]?.optionText || ''}
                        onChange={(e) => updateOption(questionIndex, 0, e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">選択肢B</label>
                      <input
                        type="text"
                        required
                        placeholder="例: 製品B、チームB、方法B"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
                        value={question.options[1]?.optionText || ''}
                        onChange={(e) => updateOption(questionIndex, 1, e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    回答者はスライダーを使って2つの選択肢のどちらにより近いかを選択します
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-md text-sm font-medium"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {loading ? '作成中...' : 'アンケートを作成'}
          </button>
        </div>
      </form>
    </div>
  )
} 