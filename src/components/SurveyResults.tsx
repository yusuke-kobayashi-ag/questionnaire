'use client'

import { useState, useMemo } from 'react'
import { QuestionType } from '@/types'
import Link from 'next/link'

interface Respondent {
  id: number
  name: string
  email: string
  gender?: string
  age?: number
  createdAt: Date
}

interface Option {
  id: number
  optionText: string
  optionOrder: number
}

interface Response {
  id: number
  answerText?: string
  optionId?: number
  respondent: Respondent
  option?: Option
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
  responses: Response[]
}

interface Survey {
  id: number
  title: string
  description?: string
  questions: Question[]
  responses: Response[]
}

interface SurveyResultsProps {
  survey: Survey
}

export default function SurveyResults({ survey }: SurveyResultsProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'respondents'>('summary')

  // デバッグ用ログ
  console.log('🎯 SurveyResults component received data:')
  console.log('Survey:', survey?.title)
  console.log('Questions:', survey?.questions?.length || 0)
  console.log('Responses:', survey?.responses?.length || 0)
  console.log('Sample responses:', survey?.responses?.slice(0, 2))

  const statistics = useMemo(() => {
    // 安全にデータにアクセス
    const responses = survey.responses || []
    const totalResponses = new Set(responses.filter(r => r.respondent).map(r => r.respondent.id)).size
    
    console.log('📊 Statistics calculation:')
    console.log('- Raw responses:', responses.length)
    console.log('- Responses with respondent:', responses.filter(r => r.respondent).length)
    console.log('- Unique respondents:', totalResponses)
    
    const questionStats = survey.questions.map(question => {
      const questionResponses = question.responses || []
      const uniqueRespondents = new Set(questionResponses.filter(r => r.respondent).map(r => r.respondent.id)).size

      console.log(`📊 Question "${question.questionText}":`, {
        responses: questionResponses.length,
        withRespondent: questionResponses.filter(r => r.respondent).length,
        uniqueRespondents
      })

      let stats: any = {
        questionId: question.id,
        questionText: question.questionText,
        questionType: question.questionType,
        totalResponses: uniqueRespondents,
        responseRate: totalResponses > 0 ? (uniqueRespondents / totalResponses * 100).toFixed(1) : '0.0'
      }

      if (question.questionType === QuestionType.TEXT_INPUT) {
        stats.textResponses = questionResponses
          .filter(r => r.respondent)
          .map(r => ({
            respondentId: r.respondent.id,
            respondentName: r.respondent.name,
            answer: r.answerText || '',
            createdAt: r.respondent.createdAt
          }))
      } else if (question.questionType === QuestionType.NUMBER_INPUT || 
                 question.questionType === QuestionType.SLIDER ||
                 question.questionType === QuestionType.COMPARISON_SLIDER) {
        const numericValues = questionResponses
          .map(r => parseFloat(r.answerText || '0'))
          .filter(v => !isNaN(v))
        
        if (numericValues.length > 0) {
          stats.numericStats = {
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            average: numericValues.reduce((a, b) => a + b, 0) / numericValues.length,
            count: numericValues.length
          }
        }
      } else if (question.questionType === QuestionType.SINGLE_CHOICE ||
                 question.questionType === QuestionType.MULTIPLE_CHOICE) {
        const optionCounts = question.options.map(option => {
          const count = questionResponses.filter(r => r.optionId === option.id).length
          return {
            optionId: option.id,
            optionText: option.optionText,
            count,
            percentage: totalResponses > 0 ? (count / totalResponses * 100).toFixed(1) : '0.0'
          }
        })
        stats.optionStats = optionCounts
      }

      return stats
    })

    console.log('📊 Final statistics:', { totalResponses, questionStatsCount: questionStats.length })

    return { totalResponses, questionStats }
  }, [survey])

  const exportToCSV = () => {
    const csvData = []
    
    // Header row
    const headers = ['回答者ID', '回答者名', 'メール', '性別', '年齢', '回答日時']
    survey.questions.forEach(question => {
      headers.push(`Q${question.questionOrder}: ${question.questionText}`)
    })
    csvData.push(headers.join(','))

    // Data rows
    const respondents = Array.from(new Set(survey.responses?.filter(r => r.respondent).map(r => r.respondent.id) || []))
      .map(id => survey.responses?.find(r => r.respondent && r.respondent.id === id)?.respondent)
      .filter(Boolean)

    respondents.forEach(respondent => {
      const row = [
        respondent!.id,
        `"${respondent!.name}"`,
        respondent!.email,
        respondent!.gender || '',
        respondent!.age || '',
        `"${new Date(respondent!.createdAt).toLocaleString('ja-JP', {
          year: 'numeric',
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })}"`
      ]

      survey.questions.forEach(question => {
        const questionResponses = (question.responses || []).filter(r => r.respondent && r.respondent.id === respondent!.id)
        
        if (question.questionType === QuestionType.MULTIPLE_CHOICE) {
          const answers = questionResponses.map(r => r.option?.optionText || '').join('; ')
          row.push(`"${answers}"`)
        } else {
          const response = questionResponses[0]
          if (response) {
            if (response.answerText) {
              row.push(`"${response.answerText}"`)
            } else if (response.option) {
              row.push(`"${response.option.optionText}"`)
            } else {
              row.push('')
            }
          } else {
            row.push('')
          }
        }
      })

      csvData.push(row.join(','))
    })

    const csvString = csvData.join('\n')
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `survey_${survey.id}_results.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const renderQuestionStats = (stats: any) => {
    return (
      <div key={stats.questionId} className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Q{survey.questions.find(q => q.id === stats.questionId)?.questionOrder}: {stats.questionText}
          </h3>
          <div className="text-sm text-gray-500">
            回答率: {stats.responseRate}% ({stats.totalResponses}人)
          </div>
        </div>

        {stats.textResponses && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">回答一覧:</h4>
            <div className="max-h-64 overflow-y-auto">
              {stats.textResponses.map((response: any, index: number) => (
                <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                  <p className="text-gray-800">{response.answer}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    <span className="font-medium">{response.respondentName}</span>
                    <span className="mx-2">-</span>
                    <span>
                      {new Date(response.createdAt).toLocaleDateString('ja-JP')} {' '}
                      {new Date(response.createdAt).toLocaleTimeString('ja-JP', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.numericStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded">
              <div className="text-sm text-blue-600">最小値</div>
              <div className="text-lg font-semibold">{stats.numericStats.min}</div>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <div className="text-sm text-green-600">最大値</div>
              <div className="text-lg font-semibold">{stats.numericStats.max}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <div className="text-sm text-purple-600">平均値</div>
              <div className="text-lg font-semibold">{stats.numericStats.average.toFixed(2)}</div>
            </div>
            <div className="bg-orange-50 p-3 rounded">
              <div className="text-sm text-orange-600">回答数</div>
              <div className="text-lg font-semibold">{stats.numericStats.count}</div>
            </div>
          </div>
        )}

        {stats.optionStats && (
          <div className="space-y-3">
            {stats.optionStats.map((option: any) => (
              <div key={option.optionId} className="flex items-center justify-between">
                <span className="text-gray-700">{option.optionText}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${option.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-16">
                    {option.count}人 ({option.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      {/* Navigation and Export */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'summary'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              統計サマリー
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              詳細結果
            </button>
            <button
              onClick={() => setActiveTab('respondents')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'respondents'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              回答者一覧
            </button>
          </nav>
        </div>
        
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            総回答数: {statistics.totalResponses}人
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportToCSV}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              CSV出力
            </button>
            <Link
              href="/admin"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              管理画面に戻る
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">統計サマリー</h2>
          {statistics.totalResponses === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">まだ回答がありません</p>
              <p className="text-sm mt-2">アンケートに回答が集まると、ここに統計が表示されます。</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-800">総回答数</h3>
              <p className="text-2xl font-bold text-blue-900">{statistics.totalResponses}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">質問数</h3>
              <p className="text-2xl font-bold text-green-900">{survey.questions?.length || 0}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-800">平均回答率</h3>
              <p className="text-2xl font-bold text-purple-900">
                {statistics.questionStats.length > 0
                  ? (statistics.questionStats.reduce((acc, stat) => acc + parseFloat(stat.responseRate), 0) / statistics.questionStats.length).toFixed(1)
                  : '0.0'}%
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'details' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">詳細結果</h2>
          {statistics.questionStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">質問データが見つかりません</p>
              <p className="text-sm mt-2">アンケートに質問を追加してください。</p>
            </div>
          ) : statistics.totalResponses === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">まだ回答がありません</p>
              <p className="text-sm mt-2">回答が集まると、ここに詳細結果が表示されます。</p>
            </div>
          ) : (
            statistics.questionStats.map(renderQuestionStats)
          )}
        </div>
      )}

      {activeTab === 'respondents' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">回答者一覧</h2>
          </div>
          {statistics.totalResponses === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">まだ回答者がいません</p>
              <p className="text-sm mt-2">アンケートに回答があると、ここに回答者一覧が表示されます。</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      回答者名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      メール
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      性別
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      年齢
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      回答日時
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.from(new Set(survey.responses?.filter(r => r.respondent).map(r => r.respondent.id) || []))
                    .map(id => survey.responses?.find(r => r.respondent && r.respondent.id === id)?.respondent)
                    .filter(Boolean)
                    .map((respondent) => (
                      <tr key={respondent!.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {respondent!.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {respondent!.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {respondent!.gender || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {respondent!.age || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex flex-col">
                            <span>{new Date(respondent!.createdAt).toLocaleDateString('ja-JP')}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(respondent!.createdAt).toLocaleTimeString('ja-JP', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 