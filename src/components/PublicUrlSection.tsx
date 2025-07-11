'use client'

interface PublicUrlSectionProps {
  surveyId: number
}

export default function PublicUrlSection({ surveyId }: PublicUrlSectionProps) {
  const handleCopyUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(`${window.location.origin}/surveys/${surveyId}`)
      alert('URLをコピーしました')
    }
  }

  return (
    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-blue-900 mb-2">公開URL</h3>
      <div className="flex items-center space-x-2">
        <code className="text-sm bg-white px-2 py-1 rounded border text-blue-900 flex-1">
          {typeof window !== 'undefined' ? window.location.origin : ''}/surveys/{surveyId}
        </code>
        <button
          onClick={handleCopyUrl}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          コピー
        </button>
      </div>
    </div>
  )
} 