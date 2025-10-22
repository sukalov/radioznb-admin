"use client";
import { Download } from "lucide-react";

export default function RecordingDownload({
  recordingId,
}: {
  recordingId: string;
}) {
  return (
    <button
      className="text-secondary hover:text-secondary-hover"
      onClick={() => {
        return;
        // window.open(url, "_blank");
      }}
    >
      <Download />
    </button>
  );
}
