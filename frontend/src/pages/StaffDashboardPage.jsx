import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Image as ImageIcon, Clock, CheckCircle2 } from "lucide-react";
import StatusProgressBar from "../components/StatusProgressBar";
import AttachmentList from "../components/AttachmentList";
import StaffSubmissionCard from "../components/StaffSubmissionCard";
import { apiFetch } from "../utils/api";

// Full status list — used for badge labels/colours everywhere on this page.
const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "assigned", label: "Assigned" },
  { value: "in-progress", label: "In Progress" },
  { value: "awaiting-review", label: "Awaiting Client Review" },
  { value: "draft-approved", label: "Draft Approved" },
  { value: "completed", label: "Completed" },
];

// Statuses staff can set directly from the dropdown. "awaiting-review",
// "draft-approved" and "completed" are reached only through the draft/final
// submission workflow (enforced server-side too — see routes/serviceRequests.js).
const MANUALLY_SETTABLE_STATUS_OPTIONS = STATUS_OPTIONS.filter((s) =>
  ["pending", "assigned", "in-progress"].includes(s.value)
);

const STATUS_COLOURS = {
  pending: "bg-amber-100 text-amber-700",
  assigned: "bg-blue-100 text-blue-700",
  "in-progress": "bg-violet-100 text-violet-700",
  "awaiting-review": "bg-orange-100 text-orange-700",
  "draft-approved": "bg-teal-100 text-teal-700",
  completed: "bg-green-100 text-green-700",
};

const SUMMARY_CARD_CONFIG = [
  { key: "total", label: "Total Requests", colour: "border-l-text-muted" },
  { key: "pending", label: "Pending", colour: "border-l-amber-400" },
  { key: "in_progress", label: "In Progress", colour: "border-l-violet-400" },
  { key: "awaiting_review", label: "Awaiting Client Review", colour: "border-l-orange-400" },
  { key: "draft_approved", label: "Draft Approved", colour: "border-l-teal-400" },
  { key: "completed", label: "Completed", colour: "border-l-aku-green" },
];

export default function StaffDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filters, setFilters] = useState({ status: "", serviceType: "", clientEmail: "" });
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  async function fetchSummary() {
    try {
      const res = await apiFetch("/api/service-requests/dashboard/summary");
      const data = await res.json();
      if (data.success) setSummary(data.data);
    } catch {
      console.error("Could not load dashboard summary.");
    }
  }

  const fetchRequests = useCallback(async () => {
    setIsLoadingRequests(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.serviceType) params.append("serviceType", filters.serviceType);
      if (filters.clientEmail) params.append("clientEmail", filters.clientEmail);

      const res = await apiFetch(`/api/service-requests?${params.toString()}`);
      const data = await res.json();
      if (data.success) setRequests(data.data);
    } catch {
      setErrorMessage("Could not load requests.");
    } finally {
      setIsLoadingRequests(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  async function openRequestDetail(requestId) {
    try {
      const res = await apiFetch(`/api/service-requests/${requestId}?includeNotes=true`);
      const data = await res.json();
      if (data.success) setSelectedRequest(data.data);
    } catch {
      setErrorMessage("Could not load request details.");
    }
  }

  if (selectedRequest) {
    return (
      <StaffRequestDetailView
        request={selectedRequest}
        onBack={() => { setSelectedRequest(null); fetchRequests(); fetchSummary(); }}
        onRequestUpdated={(updated) => setSelectedRequest(updated)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-surface-subtle pt-header pb-16 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <span className="text-aku-greenLight text-xs font-semibold tracking-widest uppercase">
                Staff Portal
              </span>
              <h1 className="font-display font-extrabold text-3xl text-text-primary mt-1">
                Graphics & Design Dashboard
              </h1>
            </div>
            <Link
              to="/staff/inspiration"
              className="flex items-center gap-2 bg-white border border-surface-border text-text-primary font-semibold text-sm px-5 py-2.5 rounded-full hover:border-aku-green/40 hover:bg-surface-subtle transition-all duration-300 w-fit"
            >
              <ImageIcon size={16} aria-hidden="true" />
              Manage Inspiration & Assets
            </Link>
          </div>

          {/* Summary cards */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
              {SUMMARY_CARD_CONFIG.map(({ key, label, colour }) => (
                <div
                  key={key}
                  className={`bg-white border border-surface-border border-l-4 ${colour} rounded-2xl p-5`}
                >
                  <p className="font-display font-extrabold text-3xl text-text-primary">
                    {summary[key] || 0}
                  </p>
                  <p className="text-text-muted text-xs mt-1 font-medium">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="bg-white border border-surface-border rounded-2xl p-5 mb-6 flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Filter by client email..."
              value={filters.clientEmail}
              onChange={(e) => setFilters((f) => ({ ...f, clientEmail: e.target.value }))}
              className="flex-1 bg-surface-subtle border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-aku-green/50 transition-colors"
            />
            <select
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              className="bg-surface-subtle border border-surface-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-aku-green/50 transition-colors"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Request list */}
          {isLoadingRequests ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-surface-overlay rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 bg-white border border-surface-border rounded-3xl">
              <p className="text-text-muted text-base">No requests match the current filters.</p>
            </div>
          ) : (
            <div className="bg-white border border-surface-border rounded-2xl overflow-hidden">
              <table className="w-full text-sm" aria-label="Service requests">
                <thead>
                  <tr className="border-b border-surface-border bg-surface-subtle">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">ID</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Client</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Service</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">Submitted</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-text-muted uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request, index) => (
                    <tr
                      key={request.id}
                      className={`border-b border-surface-border hover:bg-surface-subtle cursor-pointer transition-colors ${
                        index === requests.length - 1 ? "border-b-0" : ""
                      }`}
                      onClick={() => openRequestDetail(request.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View request ${request.id}`}
                      onKeyDown={(e) => e.key === "Enter" && openRequestDetail(request.id)}
                    >
                      <td className="px-5 py-4 text-text-muted font-mono text-xs">#{request.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-text-primary">{request.client_email}</p>
                        <p className="text-text-muted text-xs mt-0.5">{request.client_contact}</p>
                      </td>
                      <td className="px-5 py-4 text-text-secondary hidden md:table-cell">{request.service_type}</td>
                      <td className="px-5 py-4 text-text-muted hidden lg:table-cell">
                        {new Date(request.created_at).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLOURS[request.status]}`}>
                          {STATUS_OPTIONS.find((s) => s.value === request.status)?.label || request.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

const submissionFileDownloadUrl = (requestId, file) =>
  `/api/service-requests/${requestId}/submissions/files/${file.id}/download`;

function StaffRequestDetailView({ request, onBack, onRequestUpdated }) {
  const [newStatus, setNewStatus] = useState(request.status);
  const [staffNote, setStaffNote] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const submissions = request.submissions || [];

  // The plain "open request" fetch doesn't include submissions — fetch them
  // once on first load; any submit/review action afterwards returns the full
  // payload (including submissions) directly, so no refetch is needed then.
  useEffect(() => {
    if (request.submissions) return;
    let cancelled = false;
    (async () => {
      const res = await apiFetch(`/api/service-requests/${request.id}/submissions`);
      const data = await res.json();
      if (!cancelled && data.success) {
        onRequestUpdated({ ...request, submissions: data.data });
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.id]);

  useEffect(() => {
    setNewStatus(request.status);
  }, [request.status]);

  async function refreshRequest() {
    const refreshed = await apiFetch(`/api/service-requests/${request.id}?includeNotes=true`);
    const refreshedData = await refreshed.json();
    if (refreshedData.success) onRequestUpdated({ ...refreshedData.data, submissions: request.submissions });
  }

  async function handleStatusUpdate() {
    setIsSavingStatus(true);
    try {
      const res = await apiFetch(`/api/service-requests/${request.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ newStatus, staffNote }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMessage("Status updated successfully.");
        setStaffNote("");
        await refreshRequest();
      } else {
        setSuccessMessage(data.message || "Could not update status.");
      }
    } catch {
      setSuccessMessage("Could not update status. Please try again.");
    } finally {
      setIsSavingStatus(false);
    }
  }

  async function handleAddNote() {
    if (!newNoteText.trim()) return;
    setIsSavingNote(true);
    try {
      await apiFetch(`/api/service-requests/${request.id}/notes`, {
        method: "POST",
        body: JSON.stringify({ noteText: newNoteText }),
      });
      setNewNoteText("");
      await refreshRequest();
    } catch {
      console.error("Could not save note.");
    } finally {
      setIsSavingNote(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-subtle pt-header pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-aku-green transition-colors mb-8 font-medium"
        >
          ← Back to Dashboard
        </button>

        {request.status === "awaiting-review" && (
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium rounded-xl px-4 py-3 mb-6">
            <Clock size={16} className="flex-shrink-0" aria-hidden="true" />
            Awaiting Client Review — the client has been notified and needs to review the latest draft.
          </div>
        )}
        {request.status === "draft-approved" && (
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-sm font-medium rounded-xl px-4 py-3 mb-6">
            <CheckCircle2 size={16} className="flex-shrink-0" aria-hidden="true" />
            Draft Approved — Final Work Can Be Submitted.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left column — request details */}
          <div className="lg:col-span-3 space-y-5">

            {/* Client info */}
            <div className="bg-white border border-surface-border rounded-2xl p-6">
              <h2 className="font-display font-bold text-xl text-text-primary mb-4">
                Request #{request.id}
              </h2>
              <dl className="space-y-3">
                {[
                  { term: "Service", definition: request.service_type },
                  { term: "Email", definition: request.client_email },
                  { term: "Contact", definition: request.client_contact },
                  { term: "Budget", definition: request.budget_range || "Not specified" },
                  { term: "Deadline", definition: request.project_deadline || "Not specified" },
                  { term: "Submitted", definition: new Date(request.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) },
                ].map(({ term, definition }) => (
                  <div key={term} className="flex gap-4 text-sm">
                    <dt className="w-24 flex-shrink-0 text-text-muted font-medium">{term}</dt>
                    <dd className="text-text-primary">{definition}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Project description */}
            <div className="bg-white border border-surface-border rounded-2xl p-6">
              <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-3">
                Project Description
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {request.project_vision}
              </p>
            </div>

            {/* Client-submitted attachments */}
            <AttachmentList
              attachments={request.attachments || []}
              requestId={request.id}
              title="Client Assets"
              emptyStateText="No files uploaded by the client."
              showMimeType
            />

            {/* Draft / final submission history */}
            {submissions.length > 0 && (
              <div className="bg-white border border-surface-border rounded-2xl p-6">
                <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-4">
                  Submission History
                </h3>
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="bg-surface-subtle border border-surface-border rounded-xl p-4">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <span className="text-sm font-semibold text-text-primary capitalize">
                          {submission.submission_type} — {new Date(submission.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                        {submission.submission_type === "draft" && (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            submission.approval_status === "approved" ? "bg-green-100 text-green-700"
                            : submission.approval_status === "changes_requested" ? "bg-red-100 text-red-700"
                            : "bg-amber-100 text-amber-700"
                          }`}>
                            {submission.approval_status === "approved" ? "Approved"
                              : submission.approval_status === "changes_requested" ? "Changes Requested"
                              : "Pending Review"}
                          </span>
                        )}
                      </div>
                      {submission.note && (
                        <p className="text-text-secondary text-sm mb-2">{submission.note}</p>
                      )}
                      {submission.feedback_note && (
                        <p className="text-red-600 text-sm mb-3">
                          <span className="font-medium">Client feedback:</span> {submission.feedback_note}
                        </p>
                      )}
                      <AttachmentList
                        attachments={submission.files}
                        requestId={request.id}
                        title="Files"
                        downloadUrlBuilder={submissionFileDownloadUrl}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Internal notes — staff only */}
            <div className="bg-white border border-surface-border rounded-2xl p-6">
              <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-4">
                Internal Notes
              </h3>
              {request.internalNotes && request.internalNotes.length > 0 ? (
                <ul className="space-y-3 mb-5">
                  {request.internalNotes.map((note) => (
                    <li key={note.id} className="bg-surface-subtle border border-surface-border rounded-xl p-4">
                      <p className="text-text-secondary text-sm leading-relaxed">{note.note_text}</p>
                      <p className="text-text-muted text-xs mt-2">
                        {new Date(note.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-text-muted text-sm mb-5">No internal notes yet.</p>
              )}
              <textarea
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Add an internal note..."
                className="w-full bg-surface-subtle border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-aku-green/50 transition-colors resize-none mb-3"
              />
              <button
                onClick={handleAddNote}
                disabled={isSavingNote || !newNoteText.trim()}
                className="bg-aku-primary text-white font-semibold text-sm px-5 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow-green-sm transition-all duration-300"
              >
                {isSavingNote ? "Saving…" : "Add Note"}
              </button>
            </div>
          </div>

          {/* Right column — status management + submissions */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-surface-border rounded-2xl p-6">
              <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-4">
                Update Status
              </h3>
              <StatusProgressBar currentStatus={request.status} />
              <div className="mt-8 space-y-4">
                <select
                  value={MANUALLY_SETTABLE_STATUS_OPTIONS.some((s) => s.value === newStatus) ? newStatus : ""}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-surface-subtle border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-aku-green/50 transition-colors"
                  aria-label="Select new status"
                >
                  {!MANUALLY_SETTABLE_STATUS_OPTIONS.some((s) => s.value === request.status) && (
                    <option value="" disabled>
                      {STATUS_OPTIONS.find((s) => s.value === request.status)?.label || request.status}
                    </option>
                  )}
                  {MANUALLY_SETTABLE_STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <textarea
                  rows={2}
                  value={staffNote}
                  onChange={(e) => setStaffNote(e.target.value)}
                  placeholder="Optional note about this update..."
                  className="w-full bg-surface-subtle border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-aku-green/50 transition-colors resize-none"
                />
                <button
                  onClick={handleStatusUpdate}
                  disabled={isSavingStatus || !MANUALLY_SETTABLE_STATUS_OPTIONS.some((s) => s.value === newStatus) || newStatus === request.status}
                  className="w-full bg-aku-primary text-white font-semibold text-sm py-3 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow-green transition-all duration-300"
                >
                  {isSavingStatus ? "Saving…" : "Save Status"}
                </button>
                {successMessage && (
                  <p className="text-aku-green text-xs text-center font-medium">{successMessage}</p>
                )}
              </div>
            </div>

            <StaffSubmissionCard
              requestId={request.id}
              currentStatus={request.status}
              onSubmitted={(updated) => onRequestUpdated(updated)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
