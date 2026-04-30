import { useEffect } from 'react'
import { useAssets, type Asset } from '../hooks/useAssets'
import { AssetCard } from './AssetCard'

interface AssetGridProps {
  searchQuery: string
  onSelectAsset: (asset: Asset) => void
  selectedAssetId?: string
  refreshKey?: number
}

export function AssetGrid({ searchQuery, onSelectAsset, selectedAssetId, refreshKey }: AssetGridProps) {
  const { assets, loading, error, refetch } = useAssets({
    searchQuery: searchQuery || undefined,
  })

  useEffect(() => {
    if (refreshKey && refreshKey > 0) {
      refetch()
    }
  }, [refreshKey, refetch])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Loading assets...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center text-destructive">
        {error}
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        {searchQuery ? 'No assets found' : 'No assets yet. Upload some images!'}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          isSelected={asset.id === selectedAssetId}
          onClick={() => onSelectAsset(asset)}
        />
      ))}
    </div>
  )
}
