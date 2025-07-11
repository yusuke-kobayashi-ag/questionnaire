import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            アンケートシステム
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            アンケートを作成・管理できます。問題があれば小林まで
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/surveys"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              アンケートに回答する
            </Link>
            <Link
              href="/admin/login"
              className="bg-white hover:bg-gray-50 text-indigo-600 px-8 py-3 rounded-lg text-lg font-medium border-2 border-indigo-600 transition-colors"
            >
              管理者ログイン
            </Link>
          </div>
        </div>

        
      </div>
    </div>
  )
}
