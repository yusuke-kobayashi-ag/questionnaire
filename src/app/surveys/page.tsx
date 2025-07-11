import { surveyOperations } from '@/lib/database'
import Link from 'next/link'

export default async function SurveysPage() {
  const surveys = await surveyOperations.findMany({ where: { isActive: true } })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            利用可能なアンケート
          </h1>
          <p className="text-gray-600">
            以下のアンケートからお選びいただき、ご回答ください。
          </p>
        </div>

        {surveys.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              現在利用可能なアンケートはありません。
            </p>
            <Link
              href="/"
              className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              ホームに戻る
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {surveys.map((survey: any) => (
              <div key={survey.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {survey.title}
                  </h3>
                  {survey.description && (
                    <p className="text-gray-600 mb-4 text-sm">
                      {survey.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span>質問数: {survey.questions ? survey.questions.length : 0}</span>
                    <span>
                      作成日: {new Date(survey.created_at).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <Link
                    href={`/surveys/${survey.id}`}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors block text-center"
                  >
                    アンケートに回答
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
} 