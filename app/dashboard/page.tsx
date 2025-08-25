import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

import DashboardContent from '@/components/dashboard/dashboard-content'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }


  return (
    <div className="py-2 md:py-4">
      <div className="max-w-5xl mx-auto px-2">
        {/* Client wrapper controls templates collapse and chat expansion */}
        <DashboardContent />
      </div>
    </div>
  )
}
