'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminDashboard() {
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; survey: any }>({ isOpen: false, survey: null })
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchSurveys()
  }, [])

  const fetchSurveys = async () => {
    try {
      const response = await fetch('/api/admin/surveys')
      if (response.ok) {
        const data = await response.json()
        setSurveys(data)
      }
    } catch (error) {
      console.error('Error fetching surveys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const openDeleteModal = (survey: any) => {
    setDeleteModal({ isOpen: true, survey })
  }

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, survey: null })
  }

  const handleDelete = async () => {
    if (!deleteModal.survey) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/surveys/${deleteModal.survey.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // アンケート一覧を再取得
        await fetchSurveys()
        closeDeleteModal()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'アンケートの削除に失敗しました')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('アンケートの削除に失敗しました')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              アンケート管理システム
            </h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">アンケート一覧</h2>
            <Link
              href="/admin/surveys/new"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              新規アンケート作成
            </Link>
          </div>

          {surveys.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">アンケートがありません</p>
              <p className="text-gray-400 mt-2">
                新規アンケートを作成してください
              </p>
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {surveys.map((survey: any) => (
                  <li key={survey.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {survey.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {survey.description}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            作成日: {new Date(survey.createdAt).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex space-x-2">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              survey.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {survey.isActive ? '有効' : '無効'}
                          </span>
                          <Link
                            href={`/admin/surveys/${survey.id}`}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            詳細
                          </Link>
                          <Link
                            href={`/admin/surveys/${survey.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            編集
                          </Link>
                          <Link
                            href={`/admin/surveys/${survey.id}/results`}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            結果
                          </Link>
                          <button
                            onClick={() => openDeleteModal(survey)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
                          >
                            削除
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>

      {/* 削除確認モーダル */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                アンケートを削除しますか？
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                以下のアンケートを削除します：
              </p>
              <p className="font-medium text-gray-900 mb-4">
                {deleteModal.survey?.title}
              </p>
              <p className="text-sm text-red-600 mb-6">
                ⚠️ この操作は取り消せません。アンケートに関連する質問、回答データもすべて削除されます。
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {deleting ? '削除中...' : '削除する'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 