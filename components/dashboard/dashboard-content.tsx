"use client"

import { useState, useCallback } from 'react'
import { ProfessionalTemplates } from '@/components/dashboard/professional-templates'
import { InlineChat } from '@/components/dashboard/inline-chat'

export default function DashboardContent() {
  const [chatActive, setChatActive] = useState(false)

  const activateChat = useCallback(() => {
    setChatActive(true)
  }, [])

  const restoreTemplates = useCallback(() => {
    setChatActive(false)
  }, [])

  return (
    <div className="space-y-5">
      {!chatActive && (
        <div data-templates-visible>
          <ProfessionalTemplates 
            showHeadings={true} 
            showCategories={false} 
            maxItems={6} 
            horizontal
            compact
            onActivate={activateChat}
          />
        </div>
      )}

      <InlineChat tall={chatActive} onActivate={activateChat} onShowTemplates={restoreTemplates} />
    </div>
  )
}

