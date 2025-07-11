import { requireAdminAuth } from '@/lib/auth'
import SurveyForm from '@/components/SurveyForm'

export default async function NewSurveyPage() {
  await requireAdminAuth()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">新規アンケート作成</h1>
          </div>
          <SurveyForm />
        </div>
      </div>
    </div>
  )
} 