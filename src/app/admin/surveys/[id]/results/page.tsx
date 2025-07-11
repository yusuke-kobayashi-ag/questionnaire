import { requireAdminAuth } from '@/lib/auth'
import { surveyOperations } from '@/lib/database'
import { notFound } from 'next/navigation'
import SurveyResults from '@/components/SurveyResults'

interface SurveyResultsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SurveyResultsPage({ params }: SurveyResultsPageProps) {
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

  // デバッグ用ログ
  console.log('Survey data structure:', JSON.stringify(survey, null, 2))
  console.log('Questions count:', survey.questions?.length || 0)
  console.log('Responses count:', survey.responses?.length || 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              アンケート結果: {survey.title}
            </h1>
            <p className="mt-2 text-gray-600">
              {survey.description}
            </p>
          </div>
          
          <SurveyResults survey={survey} />
        </div>
      </div>
    </div>
  )
} 