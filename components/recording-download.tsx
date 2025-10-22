"use client";
import { Download } from "lucide-react";

export default function RecordingDownload({ fileUrl }: { fileUrl: string }) {
  return (
    <button
      className="text-secondary hover:text-secondary-hover"
      onClick={() => {
        window.open(fileUrl, "_blank");
      }}
    >
      <Download />
    </button>
  );
}
