import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCurrentUser } from "../context/UserContext";
import StatusProgressBar from "../components/StatusProgressBar";
import AttachmentList from "../components/AttachmentList";
import { apiFetch } from "../utils/api";

const STATUS_LABELS = {
  pending: "Pending",
  assigned: "Assigned",
  "in-progress": "In Progress",
  "awaiting-review": "Awaiting Review",
  completed: "Completed",
};

const STATUS_COLOURS = {
  pending: "bg-amber-100 text-amber-700",
  assigned: "bg-blue-100 text-blue-700",
  "in-progress": "bg-violet-100 text-violet-700",
  "awaiting-review": "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
};

export default function MyRequestsPage() {
  const { currentUser } = useCurrentUser();
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchUserRequests() {
      try {
        const response = await apiFetch(`/api/service-requests/user/${currentUser.userId}`);
        const data = await response.json();
        if (data.success) {
          setRequests(data.data);
        } else {
          setErrorMessage("Could not load your requests.");
        }
      } catch {
        setErrorMessage("Could not connect to the server.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchUserRequests();
  }, [currentUser]);

  async function openRequestDetail(requestId) {
    try {
      const response = await apiFetch(`/api/service-requests/${requestId}`);
      const data = await response.json();
      if (data.success) setSelectedRequest(data.data);
    } catch {
      setErrorMessage("Could not load request details.");
    }
  }

  if (selectedRequest) {
    return (
      <RequestDetailView
        request={selectedRequest}
        onBack={() => setSelectedRequest(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white pt-header pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <span className="text-aku-greenLight text-xs font-semibold tracking-widest uppercase">
                My Account
              </span>
              <h1 className="font-display font-extrabold text-3xl text-text-primary mt-1">
                My Requests
              </h1>
              <p className="text-text-muted text-sm mt-1">
                Track the progress of everything you have submitted.
              </p>
            </div>
            <a
              href="#contact"
              className="flex items-center gap-2 bg-aku-primary text-white font-semibold text-sm px-6 py-3 rounded-full hover:shadow-glow-green transition-all duration-300 w-fit"
            >
              Request Another Service
            </a>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-surface-overlay rounded-2xl animate-pulse" />
              ))}
            </div>
          )}

          {/* Error state */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-600 text-sm">
              {errorMessage}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && requests.length === 0 && !errorMessage && (
            <div className="text-center py-20 border border-surface-border rounded-3xl">
              <p className="font-display font-bold text-xl text-text-primary mb-2">
                No requests yet
              </p>
              <p className="text-text-muted text-sm mb-6">
                Once you submit a service request it will appear here.
              </p>
              <a
                href="#contact"
                className="bg-aku-primary text-white font-semibold text-sm px-6 py-3 rounded-full hover:shadow-glow-green transition-all duration-300"
              >
                Submit Your First Request
              </a>
            </div>
          )}

          {/* Request list */}
          {!isLoading && requests.length > 0 && (
            <div className="space-y-4">
              {requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="bg-white border border-surface-border rounded-2xl p-6 hover:border-aku-green/30 hover:shadow-card transition-all duration-300 cursor-pointer"
                  onClick={() => openRequestDetail(request.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${request.service_type} request`}
                  onKeyDown={(e) => e.key === "Enter" && openRequestDetail(request.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                    <div>
                      <p className="font-display font-bold text-lg text-text-primary">
                        {request.service_type}
                      </p>
                      <p className="text-text-muted text-xs mt-0.5">
                        Submitted {new Date(request.created_at).toLocaleDateString("en-GB", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${STATUS_COLOURS[request.status]}`}>
                      {STATUS_LABELS[request.status]}
                    </span>
                  </div>
                  <StatusProgressBar currentStatus={request.status} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function RequestDetailView({ request, onBack }) {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });

  const uploadedFiles = (request.attachments || []).filter((f) => !f.is_deliverable);
  const deliverables = (request.attachments || []).filter((f) => f.is_deliverable);

  return (
    <div className="min-h-screen bg-white pt-header pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-aku-green transition-colors mb-8 font-medium"
        >
          ← Back to My Requests
        </button>

        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white border border-surface-border rounded-2xl p-6">
            <h2 className="font-display font-bold text-xl text-text-primary mb-5">
              {request.service_type}
            </h2>
            <StatusProgressBar currentStatus={request.status} />
          </div>

          {/* Project description */}
          <div className="bg-surface-subtle border border-surface-border rounded-2xl p-6">
            <h3 className="font-semibold text-text-primary mb-3 text-sm uppercase tracking-wider">
              Your Description
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed">
              {request.project_vision}
            </p>
          </div>

          {/* Deliverables from AKU Creative Services */}
          <AttachmentList
            attachments={deliverables}
            requestId={request.id}
            title="Deliverables from AKU Creative Services"
            emptyStateText="Your completed work will appear here once it's ready."
          />

          {/* Attachments you uploaded */}
          <AttachmentList
            attachments={uploadedFiles}
            requestId={request.id}
            title="Your Uploaded Files"
            emptyStateText="You didn't attach any files to this request."
          />

          {/* Status history */}
          {request.statusHistory && request.statusHistory.length > 0 && (
            <div className="bg-surface-subtle border border-surface-border rounded-2xl p-6">
              <h3 className="font-semibold text-text-primary mb-4 text-sm uppercase tracking-wider">
                Status History
              </h3>
              <ol className="space-y-3">
                {request.statusHistory.map((entry, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-aku-green mt-1.5 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <span className="font-medium text-text-primary">
                        {STATUS_LABELS[entry.new_status] || entry.new_status}
                      </span>
                      <span className="text-text-muted ml-2">
                        {formatDate(entry.changed_at)}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
