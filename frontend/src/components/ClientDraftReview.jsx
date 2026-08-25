import React, { useState } from "react";
import { CheckCircle2, MessageSquare } from "lucide-react";
import { apiFetch } from "../utils/api";
import AttachmentList from "./AttachmentList";

const submissionFileDownloadUrl = (requestId, file) =>
  `/api/service-requests/${requestId}/submissions/files/${file.id}/download`;

export default function ClientDraftReview({ requestId, submission, onReviewed }) {
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [feedbackNote, setFeedbackNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function submitReview(decision, note) {
    setIsSubmitting(true);
    setErrorMessage("");
    try {
      const response = await apiFetch(
        `/api/service-requests/${requestId}/submissions/${submission.id}/review`,
        {
          method: "PATCH",
          body: JSON.stringify({ decision, feedbackNote: note }),
        }
      );
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Could not submit your review.");
      onReviewed?.(data.data);
    } catch (error) {
      setErrorMessage(error.message || "Could not submit your review.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-aku-green/5 border border-aku-green/20 rounded-2xl p-6">
      <h3 className="font-display font-bold text-lg text-text-primary mb-1">
        Your draft is ready for review
      </h3>
      <p className="text-text-secondary text-sm mb-5">
        Take a look at the files below, then approve the draft or let us know if changes are needed.
      </p>

      {submission.note && (
        <div className="bg-white border border-surface-border rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1.5">
            Note from the team
          </p>
          <p className="text-sm text-text-secondary leading-relaxed">{submission.note}</p>
        </div>
      )}

      <div className="mb-5">
        <AttachmentList
          attachments={submission.files}
          requestId={requestId}
          title="Draft Files"
          emptyStateText="No files attached."
          downloadUrlBuilder={submissionFileDownloadUrl}
        />
      </div>

      {errorMessage && (
        <p className="text-red-500 text-sm mb-4" role="alert">
          {errorMessage}
        </p>
      )}

      {isRequestingChanges ? (
        <div>
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">
            What needs to change?
          </label>
          <textarea
            rows={3}
            value={feedbackNote}
            onChange={(e) => setFeedbackNote(e.target.value)}
            placeholder="Describe what you'd like changed..."
            className="w-full bg-white border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-aku-green/50 transition-colors resize-none mb-3"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => submitReview("request_changes", feedbackNote)}
              disabled={isSubmitting || !feedbackNote.trim()}
              className="bg-aku-primary text-white font-semibold text-sm px-6 py-3 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow-green transition-all duration-300"
            >
              {isSubmitting ? "Sending…" : "Send Feedback"}
            </button>
            <button
              onClick={() => setIsRequestingChanges(false)}
              disabled={isSubmitting}
              className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => submitReview("approve")}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-aku-primary text-white font-semibold text-sm px-6 py-3 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow-green transition-all duration-300"
          >
            <CheckCircle2 size={16} aria-hidden="true" />
            {isSubmitting ? "Approving…" : "Approve Draft"}
          </button>
          <button
            onClick={() => setIsRequestingChanges(true)}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-white border border-surface-border text-text-primary font-semibold text-sm px-6 py-3 rounded-full hover:bg-surface-subtle transition-all duration-300"
          >
            <MessageSquare size={16} aria-hidden="true" />
            Request Changes
          </button>
        </div>
      )}
    </div>
  );
}
