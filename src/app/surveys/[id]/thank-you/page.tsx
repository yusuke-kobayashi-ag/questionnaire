import Link from 'next/link'

interface ThankYouPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ThankYouPage({ params }: ThankYouPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            以上で終了です！
          </h1>
          <p className="text-gray-600">
            アンケートのご回答をいただき、ありがとうございました。
          </p>
        </div>
      </div>
    </div>
  )
} 