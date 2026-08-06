import React, { useState, useRef } from "react";
import { Upload, X, CheckCircle2 } from "lucide-react";
import { apiFetch } from "../utils/api";

export default function DeliverablesUploadCard({ requestId, currentStatus, onUploaded }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [staffNote, setStaffNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  function handleFileSelection(incomingFiles) {
    const newFiles = Array.from(incomingFiles).map((file) => ({
      file,
      fileId: `deliverable-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(fileId) {
    setSelectedFiles((prev) => prev.filter((f) => f.fileId !== fileId));
  }

  async function handleUpload() {
    if (selectedFiles.length === 0) return;
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const formData = new FormData();
      selectedFiles.forEach(({ file }) => formData.append("deliverables", file));
      if (staffNote.trim()) formData.append("staffNote", staffNote.trim());

      const response = await apiFetch(`/api/service-requests/${requestId}/deliverables`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Upload failed.");

      setSelectedFiles([]);
      setStaffNote("");
      onUploaded?.(data.data);
    } catch (error) {
      setErrorMessage(error.message || "Could not upload deliverables.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isCompleted = currentStatus === "completed";

  return (
    <div className="bg-white border border-surface-border rounded-2xl p-6">
      <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-4">
        Deliver Completed Work
      </h3>

      {isCompleted && (
        <div className="flex items-center gap-2 text-aku-green text-xs font-medium mb-4">
          <CheckCircle2 size={14} className="flex-shrink-0" aria-hidden="true" />
          This request is completed — you can still add more files below.
        </div>
      )}

      <div
        className="rounded-xl border-2 border-dashed border-surface-border hover:border-aku-green/40 p-6 text-center cursor-pointer transition-colors"
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Select final deliverable files"
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelection(e.target.files)}
          aria-label="Deliverable file upload input"
        />
        <Upload size={22} className="text-text-muted mx-auto mb-2" aria-hidden="true" />
        <p className="text-sm text-text-primary font-medium">Click to select final files</p>
      </div>

      {selectedFiles.length > 0 && (
        <ul className="mt-3 space-y-2" aria-label="Selected deliverable files">
          {selectedFiles.map(({ file, fileId }) => (
            <li
              key={fileId}
              className="flex items-center gap-2 bg-surface-subtle border border-surface-border rounded-lg px-3 py-2"
            >
              <span className="text-xs text-text-primary truncate flex-1">{file.name}</span>
              <button
                onClick={() => removeFile(fileId)}
                className="text-text-muted hover:text-red-400 flex-shrink-0"
                aria-label={`Remove ${file.name}`}
              >
                <X size={13} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <textarea
        rows={2}
        value={staffNote}
        onChange={(e) => setStaffNote(e.target.value)}
        placeholder="Optional note to include with this delivery..."
        aria-label="Delivery note"
        className="w-full mt-3 bg-surface-subtle border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-aku-green/50 transition-colors resize-none"
      />

      {errorMessage && (
        <p className="text-red-500 text-xs mt-2" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={isSubmitting || selectedFiles.length === 0}
        className="w-full mt-3 bg-aku-primary text-white font-semibold text-sm py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow-green transition-all duration-300"
      >
        {isSubmitting ? "Uploading…" : "Upload & Mark Completed"}
      </button>
    </div>
  );
}
