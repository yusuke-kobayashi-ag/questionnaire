import { requireAdminAuth } from '@/lib/auth'
import AdminDashboard from '@/components/AdminDashboard'

export default async function AdminPage() {
  await requireAdminAuth()
  
  return <AdminDashboard />
} 