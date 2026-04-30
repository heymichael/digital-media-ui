import { useAuthUser as useSharedAuthUser } from '@haderach/shared-ui'
import type { BaseAuthUser } from '@haderach/shared-ui'

export interface AuthUser extends BaseAuthUser {
  canUpload: boolean
}

export function useAuthUser(): AuthUser {
  const user = useSharedAuthUser<AuthUser>()
  const isDevBypass = user.email === 'dev@haderach.ai'
  return { ...user, canUpload: user.canUpload ?? isDevBypass }
}
