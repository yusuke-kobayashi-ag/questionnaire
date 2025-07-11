import { surveyOperations } from '@/lib/database'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireAdminAuth } from '@/lib/auth'
import PublicUrlSection from '@/components/PublicUrlSection'

interface SurveyDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SurveyDetailPage({ params }: SurveyDetailPageProps) {
  await requireAdminAuth()
  
  const resolvedParams = await params
  const surveyId = parseInt(resolvedParams.id)
  
  if (isNaN(surveyId)) {
    notFound()
  }

  const survey = await surveyOperations.findUnique(surveyId, { include: { questions: true } })
  
  if (!survey) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Link
              href="/admin"
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mb-2 inline-block"
            >
              ← アンケート一覧に戻る
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/admin/surveys/${survey.id}/edit`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              編集
            </Link>
            <Link
              href={`/admin/surveys/${survey.id}/results`}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              結果を見る
            </Link>
          </div>
        </div>

        {/* Survey Info */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">アンケート情報</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            <div>
              <dt className="text-sm font-medium text-gray-900">タイトル</dt>
              <dd className="text-sm text-gray-900 mt-1">{survey.title}</dd>
            </div>
            {survey.description && (
              <div>
                <dt className="text-sm font-medium text-gray-900">説明</dt>
                <dd className="text-sm text-gray-900 mt-1">{survey.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-900">ステータス</dt>
              <dd className="mt-1">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    survey.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {survey.is_active ? '有効' : '無効'}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-900">作成日</dt>
              <dd className="text-sm text-gray-900 mt-1">
                {new Date(survey.created_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-900">質問数</dt>
              <dd className="text-sm text-gray-900 mt-1">{survey.questions.length}問</dd>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">質問一覧</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {survey.questions.map((question: any, index: number) => (
              <div key={question.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      質問 {index + 1}: {question.question_text}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      タイプ: {question.question_type}
                    </p>
                    {(question.question_type === 'SLIDER' || question.question_type === 'COMPARISON_SLIDER') && (
                      <p className="text-xs text-gray-600">
                        範囲: {question.min_value} - {question.max_value} (ステップ: {question.step_value})
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Public Link */}
        <PublicUrlSection surveyId={survey.id} />
      </div>
    </div>
  )
} 