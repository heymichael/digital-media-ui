import { useState, useCallback, useRef } from 'react'
import {
  AppRail,
  useRailExpanded,
  PaneToolbar,
  PaneLayout,
  ChatPanel,
} from '@haderach/shared-ui'
import type { ChatPanelHandle, PaneId, PaneLayoutHandle, DetailPaneId } from '@haderach/shared-ui'

import { useAuthUser } from './auth/AuthUserContext'
import { MediaWorkPane } from './views/MediaWorkPane'

export function App() {
  const authUser = useAuthUser()

  const [railExpanded, toggleRail] = useRailExpanded()
  const [chatOpen, setChatOpen] = useState(false)
  const [detailPane, setDetailPane] = useState<DetailPaneId | null>('data')

  const [refreshKey, setRefreshKey] = useState(0)

  const chatRef = useRef<ChatPanelHandle>(null)
  const paneRef = useRef<PaneLayoutHandle>(null)

  const handleToolResult = useCallback((toolNames: string[]) => {
    setRefreshKey((k) => k + 1)
  }, [])

  const handlePaneToggle = useCallback((id: PaneId) => {
    paneRef.current?.togglePane(id)
  }, [])

  const handleLayoutChange = useCallback((chat: boolean, detail: DetailPaneId | null) => {
    setChatOpen(chat)
    setDetailPane(detail)
  }, [])

  return (
    <div className="app-shell">
      <AppRail
        apps={authUser.accessibleApps}
        activeAppId="media"
        expanded={railExpanded}
        onToggle={toggleRail}
        userEmail={authUser.email}
        userPhotoURL={authUser.photoURL}
        userDisplayName={authUser.displayName}
        onSignOut={authUser.signOut}
        openPanes={{ chat: chatOpen, analytics: false, data: detailPane === 'data', schedule: false, admin: false, media: false }}
        getIdToken={authUser.getIdToken}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <PaneToolbar
          activePanes={{
            chat: chatOpen,
            analytics: false,
            data: detailPane === 'data',
            schedule: false,
            admin: false,
            media: false,
          }}
          panes={['chat', 'data']}
          onPaneToggle={handlePaneToggle}
        />

        <PaneLayout
          ref={paneRef}
          chatOpen={chatOpen}
          detailPane={detailPane}
          onLayoutChange={handleLayoutChange}
          chatContent={
            <ChatPanel
              ref={chatRef}
              mode="panel"
              appContext="media"
              getIdToken={authUser.getIdToken}
              onToolResult={handleToolResult}
              inputPlaceholder="How can I help you manage media?"
            />
          }
          dataContent={
            <div className="flex flex-1 min-h-0 flex-col p-2">
              <MediaWorkPane
                canUpload={authUser.canUpload}
                refreshKey={refreshKey}
              />
            </div>
          }
        />
      </div>
    </div>
  )
}
