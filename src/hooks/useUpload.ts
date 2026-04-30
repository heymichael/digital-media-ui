import { useState, useCallback } from 'react'
import { useMediaFetch } from '../lib/media-fetch'
import type { Asset } from './useAssets'

interface UploadProgress {
  filename: string
  progress: number
  status: 'pending' | 'uploading' | 'finalizing' | 'complete' | 'error'
  error?: string
}

export function useUpload() {
  const mediaFetch = useMediaFetch()
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const uploadFile = useCallback(async (file: File): Promise<Asset | null> => {
    const filename = file.name

    setUploads((prev) => [
      ...prev,
      { filename, progress: 0, status: 'pending' },
    ])

    try {
      // Step 1: Initiate upload
      setUploads((prev) =>
        prev.map((u) =>
          u.filename === filename ? { ...u, status: 'uploading', progress: 10 } : u
        )
      )

      const initiateResponse = await mediaFetch('/upload/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          content_type: file.type,
          size_bytes: file.size,
        }),
      })

      if (!initiateResponse.ok) {
        throw new Error('Failed to initiate upload')
      }

      const { draft_id, upload_url, gcs_path } = await initiateResponse.json()

      // Step 2: Upload to GCS
      setUploads((prev) =>
        prev.map((u) =>
          u.filename === filename ? { ...u, progress: 30 } : u
        )
      )

      const uploadResponse = await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage')
      }

      // Step 3: Finalize
      setUploads((prev) =>
        prev.map((u) =>
          u.filename === filename ? { ...u, status: 'finalizing', progress: 80 } : u
        )
      )

      const finalizeResponse = await mediaFetch('/upload/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft_id, gcs_path }),
      })

      if (!finalizeResponse.ok) {
        throw new Error('Failed to finalize upload')
      }

      const asset = await finalizeResponse.json()

      setUploads((prev) =>
        prev.map((u) =>
          u.filename === filename ? { ...u, status: 'complete', progress: 100 } : u
        )
      )

      return asset
    } catch (err) {
      setUploads((prev) =>
        prev.map((u) =>
          u.filename === filename
            ? { ...u, status: 'error', error: err instanceof Error ? err.message : 'Upload failed' }
            : u
        )
      )
      return null
    }
  }, [mediaFetch])

  const uploadFiles = useCallback(
    async (files: File[]): Promise<Asset[]> => {
      setIsUploading(true)
      const results: Asset[] = []

      for (const file of files) {
        const asset = await uploadFile(file)
        if (asset) results.push(asset)
      }

      setIsUploading(false)
      return results
    },
    [uploadFile]
  )

  const clearUploads = useCallback(() => {
    setUploads([])
  }, [])

  return { uploads, isUploading, uploadFiles, clearUploads }
}
