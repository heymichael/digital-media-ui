import { useState, useCallback } from 'react'
import { Upload, Search, X } from 'lucide-react'
import { AssetGrid } from '../components/AssetGrid'
import { AssetDetail } from '../components/AssetDetail'
import { UploadDropzone } from '../components/UploadDropzone'
import type { Asset } from '../hooks/useAssets'

interface MediaWorkPaneProps {
  canUpload: boolean
  refreshKey?: number
}

export function MediaWorkPane({ canUpload, refreshKey }: MediaWorkPaneProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [gridRefreshKey, setGridRefreshKey] = useState(0)

  const handleUploadComplete = useCallback(() => {
    setShowUpload(false)
    setGridRefreshKey((k) => k + 1)
  }, [])

  const handleAssetUpdate = useCallback((updated: Asset) => {
    setSelectedAsset(updated)
    setGridRefreshKey((k) => k + 1)
  }, [])

  const handleAssetDeleted = useCallback(() => {
    setSelectedAsset(null)
    setGridRefreshKey((k) => k + 1)
  }, [])

  return (
    <div className="flex flex-1 min-h-0 flex-col rounded-xl border border-border bg-card text-card-foreground shadow-sm">
      <div className="flex items-end gap-2 border-b border-border mx-4 mt-4 mb-0 pb-2 h-12">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground mb-0.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search…"
          className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {canUpload && (
          <button
            onClick={() => setShowUpload(true)}
            className="text-muted-foreground hover:text-foreground mb-0.5"
            aria-label="Upload"
          >
            <Upload className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 overflow-y-auto p-4">
          <AssetGrid
            searchQuery={searchQuery}
            onSelectAsset={setSelectedAsset}
            selectedAssetId={selectedAsset?.id}
            refreshKey={gridRefreshKey + (refreshKey ?? 0)}
          />
        </div>

        {selectedAsset && (
          <div className="w-80 border-l border-border overflow-y-auto">
            <AssetDetail
              asset={selectedAsset}
              onClose={() => setSelectedAsset(null)}
              onUpdate={handleAssetUpdate}
              onDeleted={handleAssetDeleted}
            />
          </div>
        )}
      </div>

      {showUpload && (
        <UploadDropzone
          onClose={() => setShowUpload(false)}
          onUploadComplete={handleUploadComplete}
        />
      )}
    </div>
  )
}
