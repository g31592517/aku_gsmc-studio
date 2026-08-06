import React, { useState } from "react";
import { FileText, Download } from "lucide-react";
import { apiFetch } from "../utils/api";

export default function AttachmentList({
  attachments = [],
  requestId,
  title = "Attachments",
  emptyStateText = "No files yet.",
  showMimeType = false,
}) {
  const [downloadingId, setDownloadingId] = useState(null);

  async function handleDownload(attachment) {
    setDownloadingId(attachment.id);
    try {
      const response = await apiFetch(
        `/api/service-requests/${requestId}/attachments/${attachment.id}/download`
      );
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.file_name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Could not download file:", error);
    } finally {
      setDownloadingId(null);
    }
  }

  return (
    <div className="bg-white border border-surface-border rounded-2xl p-6">
      <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-4">
        {title}
        {attachments.length > 0 ? ` (${attachments.length})` : ""}
      </h3>

      {attachments.length === 0 ? (
        <p className="text-text-muted text-sm">{emptyStateText}</p>
      ) : (
        <ul className="space-y-2">
          {attachments.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 bg-surface-subtle border border-surface-border rounded-xl px-4 py-3"
            >
              <FileText size={16} className="text-aku-green flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">{file.file_name}</p>
                <p className="text-xs text-text-muted">
                  {showMimeType && `${file.mime_type} · `}
                  {(file.file_size_bytes / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                onClick={() => handleDownload(file)}
                disabled={downloadingId === file.id}
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-aku-green hover:bg-aku-green/10 transition-colors disabled:opacity-40"
                aria-label={`Download ${file.file_name}`}
              >
                <Download size={16} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
