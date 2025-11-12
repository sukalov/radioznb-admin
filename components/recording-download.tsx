'use client'
import { Download } from 'lucide-react'

export default function RecordingDownload({ fileUrl }: { fileUrl: string }) {
  return (
    <button
      className="text-muted-foreground hover:text-muted-foreground/80"
      onClick={() => {
        window.open(fileUrl, '_blank')
      }}
    >
      <Download />
    </button>
  )
}
