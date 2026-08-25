import React, { useState, useRef } from "react";
import { Upload, X, Clock } from "lucide-react";
import { apiFetch } from "../utils/api";

const FORM_CONFIG = {
  draft: {
    heading: "Submit Draft",
    dropzoneLabel: "Click to select draft files",
    notePlaceholder: "Optional note to include with this draft...",
    buttonLabel: "Submit Draft for Review",
    submittingLabel: "Submitting…",
  },
  final: {
    heading: "Submit Completed Work",
    dropzoneLabel: "Click to select final files",
    notePlaceholder: "Optional note to include with the final work...",
    buttonLabel: "Submit Completed Work",
    submittingLabel: "Submitting…",
  },
};

export default function StaffSubmissionCard({ requestId, currentStatus, onSubmitted }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef(null);

  if (currentStatus === "awaiting-review") {
    return (
      <div className="bg-white border border-surface-border rounded-2xl p-6">
        <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-4">
          Draft Submitted
        </h3>
        <div className="flex items-center gap-2 text-text-secondary text-sm">
          <Clock size={16} className="flex-shrink-0 text-aku-amber" aria-hidden="true" />
          Waiting for the client to review the draft.
        </div>
      </div>
    );
  }

  const submissionType = currentStatus === "in-progress" ? "draft" : currentStatus === "draft-approved" ? "final" : null;
  if (!submissionType) return null;

  const config = FORM_CONFIG[submissionType];

  function handleFileSelection(incomingFiles) {
    const newFiles = Array.from(incomingFiles).map((file) => ({
      file,
      fileId: `submission-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  }

  function removeFile(fileId) {
    setSelectedFiles((prev) => prev.filter((f) => f.fileId !== fileId));
  }

  async function handleSubmit() {
    if (selectedFiles.length === 0) return;
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const formData = new FormData();
      selectedFiles.forEach(({ file }) => formData.append("files", file));
      formData.append("submissionType", submissionType);
      if (note.trim()) formData.append("note", note.trim());

      const response = await apiFetch(`/api/service-requests/${requestId}/submissions`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Submission failed.");

      setSelectedFiles([]);
      setNote("");
      onSubmitted?.(data.data);
    } catch (error) {
      setErrorMessage(error.message || "Could not submit files.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-surface-border rounded-2xl p-6">
      <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-4">
        {config.heading}
      </h3>

      <div
        className="rounded-xl border-2 border-dashed border-surface-border hover:border-aku-green/40 p-6 text-center cursor-pointer transition-colors"
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label={config.dropzoneLabel}
        onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelection(e.target.files)}
          aria-label="File upload input"
        />
        <Upload size={22} className="text-text-muted mx-auto mb-2" aria-hidden="true" />
        <p className="text-sm text-text-primary font-medium">{config.dropzoneLabel}</p>
      </div>

      {selectedFiles.length > 0 && (
        <ul className="mt-3 space-y-2" aria-label="Selected files">
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
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={config.notePlaceholder}
        aria-label="Submission note"
        className="w-full mt-3 bg-surface-subtle border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-aku-green/50 transition-colors resize-none"
      />

      {errorMessage && (
        <p className="text-red-500 text-xs mt-2" role="alert">
          {errorMessage}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || selectedFiles.length === 0}
        className="w-full mt-3 bg-aku-primary text-white font-semibold text-sm py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow-green transition-all duration-300"
      >
        {isSubmitting ? config.submittingLabel : config.buttonLabel}
      </button>
    </div>
  );
}
