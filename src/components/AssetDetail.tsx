import { useState, useEffect } from 'react'
import { X, Trash2, Check, AlertTriangle } from 'lucide-react'
import { useMediaFetch } from '../lib/media-fetch'
import type { Asset } from '../hooks/useAssets'

interface AssetDetailProps {
  asset: Asset
  onClose: () => void
  onUpdate: (asset: Asset) => void
  onDeleted?: () => void
}

export function AssetDetail({ asset, onClose, onUpdate, onDeleted }: AssetDetailProps) {
  const mediaFetch = useMediaFetch()
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [title, setTitle] = useState(asset.title || '')
  const [altText, setAltText] = useState(asset.alt_text || '')
  const [description, setDescription] = useState(asset.description || '')
  const [approvedPublic, setApprovedPublic] = useState(asset.approved_public)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteWarning, setDeleteWarning] = useState<{ ref_count: number } | null>(null)

  useEffect(() => {
    setTitle(asset.title || '')
    setAltText(asset.alt_text || '')
    setDescription(asset.description || '')
    setApprovedPublic(asset.approved_public)
    setDeleteWarning(null)
    
    mediaFetch(`/assets/${asset.id}/url`)
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json()
          setImageUrl(data.url)
        }
      })
      .catch(() => {})
  }, [asset.id])

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await mediaFetch(`/assets/${asset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || null,
          alt_text: altText || null,
          description: description || null,
          approved_public: approvedPublic,
        }),
      })

      if (response.ok) {
        const updated = await response.json()
        onUpdate(updated)
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (force = false) => {
    setDeleting(true)
    try {
      const url = force ? `/assets/${asset.id}?force=true` : `/assets/${asset.id}`
      const response = await mediaFetch(url, { method: 'DELETE' })
      const data = await response.json()

      if (data.warning && !force) {
        setDeleteWarning({ ref_count: data.ref_count })
        setDeleting(false)
        return
      }

      if (data.deleted) {
        onDeleted?.()
        onClose()
      }
    } finally {
      setDeleting(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium text-foreground">Asset Details</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {imageUrl && (
          <div className="mb-4 overflow-hidden rounded-lg border border-border">
            <img
              src={imageUrl}
              alt={asset.alt_text || asset.filename}
              className="w-full object-contain"
            />
          </div>
        )}

        <div className="mb-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{asset.filename}</p>
          <p>
            {asset.width && asset.height
              ? `${asset.width} × ${asset.height} • `
              : ''}
            {formatBytes(asset.size_bytes)}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Alt Text</label>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={approvedPublic}
              onChange={(e) => setApprovedPublic(e.target.checked)}
              className="h-4 w-4 rounded border-input bg-background text-primary"
            />
            <span className="text-sm text-foreground">Approved for public use</span>
          </label>
        </div>

        {deleteWarning && (
          <div className="mt-4 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-500" />
              <div className="text-sm">
                <p className="font-medium text-yellow-500">
                  {deleteWarning.ref_count} reference(s) exist
                </p>
                <p className="text-muted-foreground">
                  This asset is used elsewhere. Delete anyway?
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => handleDelete(true)}
                    disabled={deleting}
                    className="rounded bg-destructive px-2 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete anyway
                  </button>
                  <button
                    onClick={() => setDeleteWarning(null)}
                    className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <button
          onClick={() => handleDelete()}
          disabled={deleting}
          className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : (
            <>
              <Check className="h-4 w-4" />
              Save
            </>
          )}
        </button>
      </div>
    </div>
  )
}
