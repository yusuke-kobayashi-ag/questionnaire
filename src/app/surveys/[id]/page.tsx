import { surveyOperations } from '@/lib/database'
import { notFound } from 'next/navigation'
import SurveyResponseForm from '@/components/SurveyResponseForm'

interface SurveyPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const resolvedParams = await params
  const surveyId = parseInt(resolvedParams.id)
  
  if (isNaN(surveyId)) {
    notFound()
  }

  const survey = await surveyOperations.findUnique(surveyId, { include: { questions: true } })
  
  if (survey && !survey.is_active) {
    notFound()
  }

  if (!survey) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-gray-900 mb-4">
              {survey.description}
            </p>
          )}
          <p className="text-sm text-gray-900">
            質問数: {survey.questions.length}
          </p>
        </div>

        <SurveyResponseForm survey={survey} />
      </div>
    </div>
  )
} 