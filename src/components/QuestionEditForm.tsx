'use client'

import { useState } from 'react'
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

interface QuestionEditFormProps {
  question: Question
  index: number
  onUpdate: (question: Question) => void
  onDelete: (index: number) => void
}

export default function QuestionEditForm({ question, index, onUpdate, onDelete }: QuestionEditFormProps) {
  const [formData, setFormData] = useState(question)

  const handleChange = (field: keyof Question, value: any) => {
    const updatedQuestion = { ...formData, [field]: value }
    setFormData(updatedQuestion)
    onUpdate(updatedQuestion)
  }

  const handleOptionChange = (optionIndex: number, field: keyof Option, value: string | number) => {
    const updatedOptions = [...formData.options]
    
    // 配列の長さを確保
    while (updatedOptions.length <= optionIndex) {
      updatedOptions.push({ optionText: '', optionOrder: updatedOptions.length + 1 })
    }
    
    updatedOptions[optionIndex] = { ...updatedOptions[optionIndex], [field]: value }
    handleChange('options', updatedOptions)
  }

  const addOption = () => {
    const newOption: Option = {
      optionText: '',
      optionOrder: formData.options.length + 1
    }
    handleChange('options', [...formData.options, newOption])
  }

  const removeOption = (optionIndex: number) => {
    const updatedOptions = formData.options
      .filter((_, i) => i !== optionIndex)
      .map((option, i) => ({ ...option, optionOrder: i + 1 }))
    handleChange('options', updatedOptions)
  }

  const showOptions = formData.questionType === QuestionType.SINGLE_CHOICE || 
                     formData.questionType === QuestionType.MULTIPLE_CHOICE

  const showComparisonOptions = formData.questionType === QuestionType.COMPARISON_SLIDER

  const showSliderSettings = formData.questionType === QuestionType.SLIDER || 
                            formData.questionType === QuestionType.COMPARISON_SLIDER

  return (
    <div className="border border-gray-300 rounded-lg p-6 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">質問 {index + 1}</h3>
        <button
          type="button"
          onClick={() => onDelete(index)}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          削除
        </button>
      </div>

      <div className="space-y-4">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            質問文 *
          </label>
          <textarea
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            value={formData.questionText}
            onChange={(e) => handleChange('questionText', e.target.value)}
          />
        </div>

        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            質問タイプ *
          </label>
          <select
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            value={formData.questionType}
            onChange={(e) => {
              const newType = e.target.value as QuestionType
              const updatedQuestion = {
                ...formData,
                questionType: newType,
                options: newType === QuestionType.SINGLE_CHOICE || newType === QuestionType.MULTIPLE_CHOICE
                  ? formData.options.length > 0 ? formData.options : [{ optionText: '', optionOrder: 1 }]
                  : newType === QuestionType.COMPARISON_SLIDER
                  ? formData.options.length >= 2 ? formData.options.slice(0, 2) : [
                      { optionText: '選択肢A', optionOrder: 1 },
                      { optionText: '選択肢B', optionOrder: 2 }
                    ]
                  : [],
                minValue: newType === QuestionType.SLIDER ? 0 : newType === QuestionType.COMPARISON_SLIDER ? -10 : undefined,
                maxValue: newType === QuestionType.SLIDER ? 100 : newType === QuestionType.COMPARISON_SLIDER ? 10 : undefined,
                stepValue: newType === QuestionType.SLIDER || newType === QuestionType.COMPARISON_SLIDER ? 1 : undefined
              }
              setFormData(updatedQuestion)
              onUpdate(updatedQuestion)
            }}
          >
            <option value={QuestionType.TEXT_INPUT}>テキスト入力</option>
            <option value={QuestionType.NUMBER_INPUT}>数値入力</option>
            <option value={QuestionType.SINGLE_CHOICE}>単一選択</option>
            <option value={QuestionType.MULTIPLE_CHOICE}>複数選択</option>
            <option value={QuestionType.SLIDER}>スライダー</option>
            <option value={QuestionType.COMPARISON_SLIDER}>比較スライダー</option>
          </select>
        </div>

        {/* Slider Settings */}
        {showSliderSettings && (
          <div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  最小値
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  value={formData.minValue || 0}
                  onChange={(e) => handleChange('minValue', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  最大値
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  value={formData.maxValue || 100}
                  onChange={(e) => handleChange('maxValue', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  ステップ
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  value={formData.stepValue || 1}
                  onChange={(e) => handleChange('stepValue', parseInt(e.target.value))}
                />
              </div>
            </div>
            {formData.questionType === QuestionType.COMPARISON_SLIDER && (
              <p className="text-xs text-gray-500 mt-2">
                比較スライダーでは中央が0（中立）になります。例：-5〜+5、-10〜+10
              </p>
            )}
          </div>
        )}

        {/* Options */}
        {showOptions && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-900">
                選択肢 *
              </label>
              <button
                type="button"
                onClick={addOption}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                + 選択肢を追加
              </button>
            </div>
            <div className="space-y-2">
              {formData.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <input
                    type="text"
                    required
                    placeholder={`選択肢 ${optionIndex + 1}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                    value={option.optionText}
                    onChange={(e) => handleOptionChange(optionIndex, 'optionText', e.target.value)}
                  />
                  {formData.options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOption(optionIndex)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      削除
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Options */}
        {showComparisonOptions && (
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              比較対象 *
            </label>
            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">選択肢A</label>
                <input
                  type="text"
                  required
                  placeholder="例: 製品A、チームA、方法A"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  value={formData.options[0]?.optionText || ''}
                  onChange={(e) => handleOptionChange(0, 'optionText', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">選択肢B</label>
                <input
                  type="text"
                  required
                  placeholder="例: 製品B、チームB、方法B"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  value={formData.options[1]?.optionText || ''}
                  onChange={(e) => handleOptionChange(1, 'optionText', e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              回答者はスライダーを使って2つの選択肢のどちらにより近いかを選択します
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 