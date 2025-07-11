'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuestionType } from '@/types'
import ComparisonSlider from './ComparisonSlider'

interface Option {
  id: number
  optionText: string
  optionOrder: number
}

interface Question {
  id: number
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
  questions: Question[]
}

interface SurveyResponseFormProps {
  survey: Survey
}

interface RespondentInfo {
  name: string
  email: string
  gender: string
  age: number | ''
}

interface Answer {
  questionId: number
  answerText?: string
  optionId?: number
  selectedOptions?: number[]
}

export default function SurveyResponseForm({ survey }: SurveyResponseFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [respondentInfo, setRespondentInfo] = useState<RespondentInfo>({
    name: '',
    email: '',
    gender: '',
    age: ''
  })
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalSteps = survey.questions.length + 1 // +1 for respondent info

  const handleRespondentInfoChange = (field: keyof RespondentInfo, value: string | number) => {
    setRespondentInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleAnswerChange = (questionId: number, answerData: Partial<Answer>) => {
    setAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === questionId)
      const newAnswer = { questionId, ...answerData }
      
      if (existingIndex >= 0) {
        const newAnswers = [...prev]
        newAnswers[existingIndex] = { ...newAnswers[existingIndex], ...newAnswer }
        return newAnswers
      } else {
        return [...prev, newAnswer]
      }
    })
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/surveys/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surveyId: survey.id,
          respondentInfo,
          answers
        }),
      })

      if (response.ok) {
        router.push(`/surveys/${survey.id}/thank-you`)
      } else {
        const data = await response.json()
        setError(data.error || '回答の送信に失敗しました')
      }
    } catch (error) {
      setError('回答の送信に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const renderRespondentForm = () => (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        回答者情報
      </h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            お名前 *
          </label>
          <input
            type="text"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            value={respondentInfo.name}
            onChange={(e) => handleRespondentInfoChange('name', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            メールアドレス *
          </label>
          <input
            type="email"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            value={respondentInfo.email}
            onChange={(e) => handleRespondentInfoChange('email', e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            性別
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            value={respondentInfo.gender}
            onChange={(e) => handleRespondentInfoChange('gender', e.target.value)}
          >
            <option value="">選択してください</option>
            <option value="male">男性</option>
            <option value="female">女性</option>
            <option value="other">その他</option>
            <option value="prefer-not-to-say">回答しない</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            年齢
          </label>
          <input
            type="number"
            min="1"
            max="120"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            value={respondentInfo.age}
            onChange={(e) => handleRespondentInfoChange('age', e.target.value ? parseInt(e.target.value) : '')}
          />
        </div>
      </div>
    </div>
  )

  const renderQuestion = (question: Question) => {
    const currentAnswer = answers.find(a => a.questionId === question.id)

    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          質問 {question.questionOrder}
        </h2>
        
        <div className="mb-6">
          <p className="text-gray-900 text-lg mb-4">
            {question.questionText}
          </p>
          
          {question.questionType === QuestionType.TEXT_INPUT && (
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              rows={4}
              value={currentAnswer?.answerText || ''}
              onChange={(e) => handleAnswerChange(question.id, { answerText: e.target.value })}
            />
          )}
          
          {question.questionType === QuestionType.NUMBER_INPUT && (
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              value={currentAnswer?.answerText || ''}
              onChange={(e) => handleAnswerChange(question.id, { answerText: e.target.value })}
            />
          )}
          
          {question.questionType === QuestionType.SINGLE_CHOICE && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <label key={option.id} className="flex items-center">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value={option.id}
                    checked={currentAnswer?.optionId === option.id}
                    onChange={(e) => handleAnswerChange(question.id, { optionId: parseInt(e.target.value) })}
                    className="mr-2"
                  />
                  <span className="text-gray-900">{option.optionText}</span>
                </label>
              ))}
            </div>
          )}
          
          {question.questionType === QuestionType.MULTIPLE_CHOICE && (
            <div className="space-y-2">
              {question.options.map((option) => (
                <label key={option.id} className="flex items-center">
                  <input
                    type="checkbox"
                    value={option.id}
                    checked={currentAnswer?.selectedOptions?.includes(option.id) || false}
                    onChange={(e) => {
                      const selectedOptions = currentAnswer?.selectedOptions || []
                      if (e.target.checked) {
                        handleAnswerChange(question.id, { 
                          selectedOptions: [...selectedOptions, option.id] 
                        })
                      } else {
                        handleAnswerChange(question.id, { 
                          selectedOptions: selectedOptions.filter(id => id !== option.id) 
                        })
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-gray-900">{option.optionText}</span>
                </label>
              ))}
            </div>
          )}
          
          {question.questionType === QuestionType.SLIDER && (
            <div className="space-y-4">
              <input
                type="range"
                min={question.minValue || 0}
                max={question.maxValue || 100}
                step={question.stepValue || 1}
                value={currentAnswer?.answerText || question.minValue || 0}
                onChange={(e) => handleAnswerChange(question.id, { answerText: e.target.value })}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-900">
                <span>{question.minValue || 0}</span>
                <span className="font-medium">{currentAnswer?.answerText || question.minValue || 0}</span>
                <span>{question.maxValue || 100}</span>
              </div>
            </div>
          )}

          {question.questionType === QuestionType.COMPARISON_SLIDER && (
            <ComparisonSlider
              optionA={question.options?.[0]?.optionText || '選択肢A'}
              optionB={question.options?.[1]?.optionText || '選択肢B'}
              value={parseInt(currentAnswer?.answerText || String(question.minValue || 0))}
              minValue={question.minValue || -10}
              maxValue={question.maxValue || 10}
              onChange={(value) => handleAnswerChange(question.id, { answerText: String(value) })}
            />
          )}
        </div>
      </div>
    )
  }

  const isCurrentStepValid = () => {
    if (currentStep === 0) {
      return respondentInfo.name && respondentInfo.email
    }
    
    const currentQuestion = survey.questions[currentStep - 1]
    const currentAnswer = answers.find(a => a.questionId === currentQuestion.id)
    
    if (!currentAnswer) return false
    
    if (currentQuestion.questionType === QuestionType.TEXT_INPUT || 
        currentQuestion.questionType === QuestionType.NUMBER_INPUT ||
        currentQuestion.questionType === QuestionType.SLIDER ||
        currentQuestion.questionType === QuestionType.COMPARISON_SLIDER) {
      return currentAnswer.answerText !== undefined && currentAnswer.answerText !== ''
    }
    
    if (currentQuestion.questionType === QuestionType.SINGLE_CHOICE) {
      return currentAnswer.optionId !== undefined
    }
    
    if (currentQuestion.questionType === QuestionType.MULTIPLE_CHOICE) {
      return currentAnswer.selectedOptions && currentAnswer.selectedOptions.length > 0
    }
    
    return false
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-900">
            進捗: {currentStep + 1} / {totalSteps}
          </span>
          <span className="text-sm text-gray-900">
            {Math.round(((currentStep + 1) / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      {currentStep === 0 ? renderRespondentForm() : renderQuestion(survey.questions[currentStep - 1])}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          前へ
        </button>
        
        {currentStep < totalSteps - 1 ? (
          <button
            onClick={handleNext}
            disabled={!isCurrentStepValid()}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            次へ
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!isCurrentStepValid() || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '送信中...' : '回答を送信'}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  )
} 