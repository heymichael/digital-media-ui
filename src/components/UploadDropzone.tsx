import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Check, AlertCircle } from 'lucide-react'
import { useUpload } from '../hooks/useUpload'

interface UploadDropzoneProps {
  onClose: () => void
  onUploadComplete: () => void
}

export function UploadDropzone({ onClose, onUploadComplete }: UploadDropzoneProps) {
  const { uploads, isUploading, uploadFiles, clearUploads } = useUpload()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const results = await uploadFiles(acceptedFiles)
      if (results.length > 0) {
        onUploadComplete()
      }
    },
    [uploadFiles, onUploadComplete]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'],
    },
    disabled: isUploading,
  })

  const handleClose = () => {
    clearUploads()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-medium text-foreground">Upload Images</h2>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4">
          <div
            {...getRootProps()}
            className={`flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-muted-foreground'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input {...getInputProps()} />
            <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-foreground">
              {isDragActive ? 'Drop files here' : 'Drag & drop images, or click to select'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              PNG, JPG, GIF, WebP, SVG
            </p>
          </div>

          {uploads.length > 0 && (
            <div className="mt-4 space-y-2">
              {uploads.map((upload) => (
                <div
                  key={upload.filename}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-foreground">{upload.filename}</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full transition-all ${
                          upload.status === 'error' ? 'bg-destructive' : 'bg-primary'
                        }`}
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="shrink-0">
                    {upload.status === 'complete' && (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                    {upload.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                    {['pending', 'uploading', 'finalizing'].includes(upload.status) && (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end border-t border-border px-4 py-3">
          <button
            onClick={handleClose}
            className="rounded-lg bg-muted px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
