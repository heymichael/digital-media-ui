import { useState, useEffect } from 'react'
import { Image as ImageIcon } from 'lucide-react'
import { useMediaFetch } from '../lib/media-fetch'
import type { Asset } from '../hooks/useAssets'

interface AssetCardProps {
  asset: Asset
  isSelected: boolean
  onClick: () => void
}

export function AssetCard({ asset, isSelected, onClick }: AssetCardProps) {
  const mediaFetch = useMediaFetch()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    mediaFetch(`/assets/${asset.id}/url`)
      .then(async (response) => {
        if (!response.ok || cancelled) return
        const data = await response.json()
        if (!cancelled) setImageUrl(data.url)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [asset.id])

  return (
    <button
      onClick={onClick}
      className={`group relative aspect-square overflow-hidden rounded-lg border transition-all ${
        isSelected
          ? 'border-ring ring-2 ring-ring'
          : 'border-border hover:border-border-hover'
      }`}
    >
      {loading ? (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt={asset.alt_text || asset.filename}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <ImageIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
        <p className="truncate text-xs text-white">
          {asset.title || asset.filename}
        </p>
      </div>
    </button>
  )
}
