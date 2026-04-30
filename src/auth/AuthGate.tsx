import type { ReactNode } from 'react'
import { AuthGate as SharedAuthGate } from '@haderach/shared-ui'
import type { UserDoc } from '@haderach/shared-ui'

interface AuthGateProps {
  children: ReactNode
}

interface MediaAuthExtra {
  canUpload: boolean
}

const APP_PATH = '/media/'
const APP_ID = 'media'

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function mapUserDocToMediaExtra(userDoc: UserDoc): MediaAuthExtra {
  const roles = asStringArray(userDoc.roles)
  return {
    canUpload: roles.includes('admin') || roles.includes('media_uploader'),
  }
}

export function AuthGate({ children }: AuthGateProps) {
  return (
    <SharedAuthGate<MediaAuthExtra>
      appPath={APP_PATH}
      appId={APP_ID}
      mapUserDocToExtra={mapUserDocToMediaExtra}
    >
      {children}
    </SharedAuthGate>
  )
}
