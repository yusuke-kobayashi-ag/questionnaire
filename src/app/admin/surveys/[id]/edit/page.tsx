import { surveyOperations } from '@/lib/database'
import { notFound } from 'next/navigation'
import { requireAdminAuth } from '@/lib/auth'
import SurveyEditForm from '@/components/SurveyEditForm'

interface SurveyEditPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SurveyEditPage({ params }: SurveyEditPageProps) {
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
        <SurveyEditForm survey={survey} />
      </div>
    </div>
  )
} 