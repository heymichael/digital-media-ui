import { useState, useEffect, useCallback } from 'react'
import { useAuthUser } from '@haderach/shared-ui'
import { useMediaFetch } from '../lib/media-fetch'

export interface Asset {
  id: string
  org_slug: string
  gcs_bucket: string
  gcs_path: string
  filename: string
  content_type: string
  size_bytes: number
  width: number | null
  height: number | null
  title: string | null
  alt_text: string | null
  description: string | null
  approved_public: boolean
  uploaded_by: string
  created_at: string
  updated_at: string
  reference_count?: number
}

interface UseAssetsOptions {
  searchQuery?: string
  limit?: number
}

export function useAssets(options: UseAssetsOptions = {}) {
  const authUser = useAuthUser()
  const mediaFetch = useMediaFetch()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAssets = useCallback(async () => {
    if (!authUser?.email) return

    setLoading(true)
    setError(null)

    try {
      let response: Response
      if (options.searchQuery) {
        response = await mediaFetch('/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: options.searchQuery,
            mode: 'hybrid',
            limit: options.limit || 50,
          }),
        })
      } else {
        response = await mediaFetch(`/assets?limit=${options.limit || 50}`)
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch assets: ${response.status}`)
      }

      const data = await response.json()
      setAssets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assets')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.email, options.searchQuery, options.limit])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  return { assets, loading, error, refetch: fetchAssets }
}

export function useAsset(assetId: string | null) {
  const authUser = useAuthUser()
  const mediaFetch = useMediaFetch()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authUser?.email || !assetId) {
      setAsset(null)
      return
    }

    setLoading(true)
    setError(null)

    mediaFetch(`/assets/${assetId}`)
      .then(async (response) => {
        if (!response.ok) throw new Error(`Failed to fetch asset: ${response.status}`)
        const data = await response.json()
        setAsset(data)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to fetch asset')
      })
      .finally(() => {
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser?.email, assetId])

  return { asset, loading, error, setAsset }
}
