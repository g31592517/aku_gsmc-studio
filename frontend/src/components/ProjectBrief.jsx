import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Image,
  BookOpen,
  Package,
  Film,
  Mic2,
  Upload,
  FileText,
  Music,
  X,
  Check,
  ChevronRight,
} from "lucide-react";
import { useCurrentUser } from "../context/UserContext";
import { apiFetch } from "../utils/api";

const WIZARD_STEPS = ["Service", "Vision", "Assets", "Details", "Review"];

// service id -> exact `name` in the service_categories table
const SERVICE_CATEGORY_NAMES = {
  "flyer-poster-design": "Flyer & Poster Design",
  "print-publication-design": "Print & Publication Design",
  "merchandise-mockup-design": "Merchandise & Mockup Design",
  "animated-explainer-videos": "Animated Explainer Videos",
  "podcast-production": "Podcast Production",
  "videography-photography": "Professional Videography & Photography",
};

const availableServices = [
  {
    id: "flyer-poster-design",
    icon: Image,
    label: "Flyer & Poster Design",
  },
  {
    id: "print-publication-design",
    icon: BookOpen,
    label: "Print & Publication Design",
  },
  {
    id: "merchandise-mockup-design",
    icon: Package,
    label: "Merchandise & Mockup Design",
  },
  {
    id: "animated-explainer-videos",
    icon: Film,
    label: "Animated Explainer Videos",
  },
  {
    id: "podcast-production",
    icon: Mic2,
    label: "Podcast Production",
  },
  {
    id: "videography-photography",
    icon: Video,
    label: "Professional Videography & Photography",
  },
];

const projectBudgetOptions = [
  "Under Ksh.500",
  "Ksh.500 – Ksh.1,500",
  "Ksh.1,500 – Ksh5,000",
  "Ksh5,000 – Ksh15,000",
  "Ksh.15,000+",
];

function getUploadedFileIcon(mimeType) {
  if (mimeType.startsWith("image/")) return <Image size={14} aria-hidden="true" />;
  if (mimeType.startsWith("audio/")) return <Music size={14} aria-hidden="true" />;
  return <FileText size={14} aria-hidden="true" />;
}

export default function ProjectSubmissionWizard() {
  const { currentUser, openAuthModal } = useCurrentUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedService, setSelectedService] = useState(null);
  const [projectVision, setProjectVision] = useState("");
  const [uploadedInspirationFiles, setUploadedInspirationFiles] = useState([]);
  const [projectDetails, setProjectDetails] = useState({
    budgetRange: "",
    projectDeadline: "",
    additionalNotes: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const fileInputRef = useRef(null);

  const handleFileSelection = (incomingFiles) => {
    const newFiles = Array.from(incomingFiles).map((file) => ({
      file,
      fileName: file.name,
      mimeType: file.type,
      fileSizeBytes: file.size,
      fileId: `file-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }));
    setUploadedInspirationFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDropZoneDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    handleFileSelection(e.dataTransfer.files);
  };

  const removeUploadedFile = (fileId) =>
    setUploadedInspirationFiles((prev) => prev.filter((f) => f.fileId !== fileId));

  const updateProjectDetail = (field, value) =>
    setProjectDetails((prev) => ({ ...prev, [field]: value }));

  const stepCompletionStatus = [
    selectedService !== null,
    projectVision.trim().length > 10,
    true, // assets step is optional
    !!projectDetails.budgetRange,
    true, // review step always completable
  ];

  const handleFinalSubmission = async () => {
    if (!currentUser) return;

    setSubmissionError("");
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("serviceType", SERVICE_CATEGORY_NAMES[selectedService]);
      formData.append("projectVision", projectVision);
      formData.append("budgetRange", projectDetails.budgetRange);
      if (projectDetails.projectDeadline) {
        formData.append("projectDeadline", projectDetails.projectDeadline);
      }
      formData.append("additionalNotes", projectDetails.additionalNotes);
      uploadedInspirationFiles.forEach(({ file }) => formData.append("attachments", file));

      const submitResponse = await apiFetch("/api/service-requests", {
        method: "POST",
        body: formData,
      });
      const submitData = await submitResponse.json();
      if (!submitData.success) {
        throw new Error(submitData.message || "Could not submit your brief.");
      }

      setIsSubmitted(true);
    } catch (error) {
      setSubmissionError(error.message || "Could not connect to the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setIsSubmitted(false);
    setCurrentStep(0);
    setSelectedService(null);
    setProjectVision("");
    setUploadedInspirationFiles([]);
    setSubmissionError("");
    setProjectDetails({
      budgetRange: "",
      projectDeadline: "",
      additionalNotes: "",
    });
  };

  const selectedServiceData = availableServices.find((s) => s.id === selectedService);

  return (
    <section
      id="contact"
      className="py-24 px-6 relative bg-surface-subtle section-divider scroll-mt-header"
      aria-labelledby="brief-heading"
    >
      <div
        className="glow-orb absolute bottom-0 right-0 w-[500px] h-[400px] pointer-events-none"
        style={{ background: "rgba(102,45,145,0.10)" }}
        aria-hidden="true"
      />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-aku-greenLight text-sm font-semibold tracking-widest uppercase">
            Get Started
          </span>
          <h2
            id="brief-heading"
            className="font-display font-extrabold text-4xl md:text-5xl text-text-primary mt-2 mb-3"
          >
            Share Your Project Brief
          </h2>
          <p className="text-text-secondary text-lg">
            Tell us what you have in mind.
            Upload any inspiration behind the idea. We'll deliver the best outcome
          </p>
        </motion.div>

        {/* Wizard card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-surface-border p-8 shadow-card"
          role="region"
          aria-label="Project submission form"
        >
          {isSubmitted ? (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
              role="status"
              aria-live="polite"
            >
              <div className="w-20 h-20 rounded-full bg-aku-primary flex items-center justify-center shadow-glow-green mb-6">
                <Check size={32} className="text-white" strokeWidth={2.5} aria-hidden="true" />
              </div>
              <h3 className="font-display font-bold text-3xl text-text-primary mb-3">
                Brief Received
              </h3>
              <p className="text-text-secondary max-w-sm">
                We'll review your project and reach out within 24 hours. 
              </p>
              <button
                onClick={resetWizard}
                className="mt-8 text-sm text-aku-greenLight hover:text-text-primary transition-colors"
              >
                Submit another brief →
              </button>
            </motion.div>
          ) : (
            <>
              {/* Step Progress Indicator */}
              <nav
                aria-label="Form steps"
                className="flex items-center gap-1 mb-10"
              >
                {WIZARD_STEPS.map((stepLabel, stepIndex) => (
                  <React.Fragment key={stepLabel}>
                    <div
                      className={`flex items-center gap-2 ${
                        stepIndex <= currentStep ? "text-text-primary" : "text-text-muted"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          stepIndex < currentStep
                            ? "bg-aku-primary text-white"
                            : stepIndex === currentStep
                            ? "bg-surface-muted text-text-primary ring-1 ring-aku-green"
                            : "bg-surface-overlay text-text-muted"
                        }`}
                        aria-current={stepIndex === currentStep ? "step" : undefined}
                      >
                        {stepIndex < currentStep ? (
                          <Check size={12} strokeWidth={3} aria-hidden="true" />
                        ) : (
                          stepIndex + 1
                        )}
                      </div>
                      <span className="hidden sm:block text-xs font-medium">
                        {stepLabel}
                      </span>
                    </div>
                    {stepIndex < WIZARD_STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-px transition-all duration-500 ${
                          stepIndex < currentStep
                            ? "bg-aku-primary"
                            : "bg-surface-border"
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </React.Fragment>
                ))}
              </nav>

              <AnimatePresence mode="wait">
                {/* Step 0 — Service Selection */}
                {currentStep === 0 && (
                  <motion.div
                    key="service-selection"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-display font-bold text-2xl text-text-primary mb-2">
                      Choose a service that you want
                    </h3>
                    
                    <div
                      className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                      role="radiogroup"
                      aria-label="Select a service"
                    >
                      {availableServices.map(({ id, icon: Icon, label }) => (
                        <button
                          key={id}
                          onClick={() => setSelectedService(id)}
                          role="radio"
                          aria-checked={selectedService === id}
                          className={`flex flex-col items-center gap-3 p-5 rounded-2xl border transition-all duration-300 ${
                            selectedService === id
                              ? "border-aku-green/60 bg-aku-green/10 shadow-glow-green-sm"
                              : "border-surface-border bg-surface-subtle hover:border-aku-green/30"
                          }`}
                        >
                          <div
                            className="w-12 h-12 rounded-xl bg-aku-green flex items-center justify-center flex-shrink-0"
                            aria-hidden="true"
                          >
                            <Icon size={22} className="text-white" />
                          </div>
                          <span className="text-sm font-semibold text-text-primary text-center leading-snug">
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 1 — Project Vision */}
                {currentStep === 1 && (
                  <motion.div
                    key="project-vision"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-display font-bold text-2xl text-text-primary mb-2">
                      Describe your vision
                    </h3>
                    <p className="text-text-muted text-sm mb-6">
                      The more context you provide, the better we can serve your
                      goals.
                    </p>
                    <label htmlFor="project-vision-input" className="sr-only">
                      Describe your project vision
                    </label>
                    <textarea
                      id="project-vision-input"
                      rows={7}
                      value={projectVision}
                      onChange={(e) => setProjectVision(e.target.value)}
                      placeholder="Tell us about your vision... What are you creating? Who is the audience? What emotion or message should it convey?"
                      className="w-full bg-surface-subtle border border-surface-border rounded-2xl p-5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-aku-green/50 transition-colors resize-none leading-relaxed"
                    />
                    <p className="text-xs text-text-muted mt-2 text-right" aria-live="polite">
                      {projectVision.length} characters
                    </p>
                  </motion.div>
                )}

                {/* Step 2 — Asset Upload */}
                {currentStep === 2 && (
                  <motion.div
                    key="asset-upload"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-display font-bold text-2xl text-text-primary mb-2">
                      Upload inspiration assets
                    </h3>
                    <p className="text-text-muted text-sm mb-6">
                      Images, videos, PDFs, or audio files — anything that helps
                      us understand your direction. This step is optional.
                    </p>

                    {/* Drop zone */}
                    <div
                      className={`rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer ${
                        isDraggingOver
                          ? "border-aku-green bg-aku-green/10"
                          : "border-surface-border hover:border-aku-green/40 hover:bg-aku-green/[0.025]"
                      }`}
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                      onDragLeave={() => setIsDraggingOver(false)}
                      onDrop={handleDropZoneDrop}
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      aria-label="Upload inspiration files — click or drag and drop"
                      onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => handleFileSelection(e.target.files)}
                        accept="image/*,video/*,audio/*,.pdf"
                        aria-label="File upload input"
                      />
                      <Upload
                        size={30}
                        className="text-text-muted mx-auto mb-3"
                        aria-hidden="true"
                      />
                      <p className="text-text-primary font-medium mb-1">
                        Drop files here or click to browse
                      </p>
                      <p className="text-xs text-text-muted">
                        Images · Videos · PDFs · Audio recordings
                      </p>
                    </div>

                    {/* Uploaded file previews */}
                    {uploadedInspirationFiles.length > 0 && (
                      <ul
                        className="mt-4 grid grid-cols-2 gap-2"
                        aria-label="Uploaded files"
                      >
                        {uploadedInspirationFiles.map((file) => (
                          <li
                            key={file.fileId}
                            className="bg-surface-subtle border border-surface-border rounded-xl p-3 flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-lg bg-aku-green/15 flex items-center justify-center text-aku-greenLight flex-shrink-0">
                              {getUploadedFileIcon(file.mimeType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-text-primary truncate font-medium">
                                {file.fileName}
                              </p>
                              <p className="text-xs text-text-muted">
                                {(file.fileSizeBytes / 1024).toFixed(0)} KB
                              </p>
                            </div>
                            <button
                              onClick={() => removeUploadedFile(file.fileId)}
                              className="text-text-muted hover:text-red-400 transition-colors flex-shrink-0"
                              aria-label={`Remove ${file.fileName}`}
                            >
                              <X size={14} aria-hidden="true" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}

                {/* Step 3 — Project Details */}
                {currentStep === 3 && (
                  <motion.div
                    key="project-details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-display font-bold text-2xl text-text-primary mb-6">
                      Your project details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="field-budget"
                          className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2"
                        >
                          Budget Range
                        </label>
                        <select
                          id="field-budget"
                          value={projectDetails.budgetRange}
                          onChange={(e) => updateProjectDetail("budgetRange", e.target.value)}
                          className="w-full bg-surface-subtle border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-aku-green/50 transition-colors bg-transparent"
                        >
                          <option value="" className="bg-surface-overlay">
                            Select budget range...
                          </option>
                          {projectBudgetOptions.map((option) => (
                            <option key={option} value={option} className="bg-surface-overlay">
                              {option}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="field-deadline"
                          className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2"
                        >
                          Project Deadline
                        </label>
                        <input
                          id="field-deadline"
                          type="date"
                          value={projectDetails.projectDeadline}
                          onChange={(e) => updateProjectDetail("projectDeadline", e.target.value)}
                          className="w-full bg-surface-subtle border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-aku-green/50 transition-colors [color-scheme:dark]"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label
                        htmlFor="field-notes"
                        className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2"
                      >
                        Additional Notes
                      </label>
                      <textarea
                        id="field-notes"
                        rows={3}
                        value={projectDetails.additionalNotes}
                        onChange={(e) => updateProjectDetail("additionalNotes", e.target.value)}
                        placeholder="Anything else we should know about your project?"
                        className="w-full bg-surface-subtle border border-surface-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-aku-green/50 transition-colors resize-none"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 4 — Review & Submit */}
                {currentStep === 4 && (
                  <motion.div
                    key="review-submit"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="font-display font-bold text-2xl text-text-primary mb-6">
                      Review your brief
                    </h3>
                    <dl className="space-y-3">
                      {[
                        { term: "Service", definition: selectedServiceData?.label },
                        {
                          term: "Vision",
                          definition:
                            projectVision.slice(0, 140) +
                            (projectVision.length > 140 ? "…" : ""),
                        },
                        {
                          term: "Assets",
                          definition:
                            uploadedInspirationFiles.length > 0
                              ? `${uploadedInspirationFiles.length} file(s) attached`
                              : "No files uploaded",
                        },
                        { term: "Budget", definition: projectDetails.budgetRange },
                        {
                          term: "Deadline",
                          definition: projectDetails.projectDeadline || "Not specified",
                        },
                      ].map(({ term, definition }) => (
                        <div
                          key={term}
                          className="flex gap-4 items-start bg-surface-subtle border border-surface-border rounded-xl p-4"
                        >
                          <dt className="text-xs font-semibold text-text-muted uppercase tracking-wider w-20 flex-shrink-0 mt-0.5">
                            {term}
                          </dt>
                          <dd className="text-sm text-text-primary flex-1 leading-relaxed">
                            {definition || "—"}
                          </dd>
                        </div>
                      ))}
                    </dl>
                    {!currentUser && (
                      <div className="mt-5 bg-aku-green/5 border border-aku-green/20 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
                        <p className="text-sm text-text-secondary">
                          Sign in to submit your brief.
                        </p>
                        <button
                          type="button"
                          onClick={() => openAuthModal({ redirectOnSuccess: false })}
                          className="text-sm font-semibold text-white bg-aku-primary px-5 py-2.5 rounded-full hover:shadow-glow-green-sm transition-all duration-300"
                        >
                          Sign In
                        </button>
                      </div>
                    )}
                    {submissionError && (
                      <p className="text-red-500 text-sm mt-4" role="alert">
                        {submissionError}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation controls */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-border">
                <button
                  onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                  className={`text-sm font-medium text-text-muted hover:text-text-primary transition-colors ${
                    currentStep === 0 ? "invisible" : ""
                  }`}
                  aria-label="Go to previous step"
                >
                  ← Back
                </button>

                {currentStep < WIZARD_STEPS.length - 1 ? (
                  <button
                    onClick={() => setCurrentStep((s) => s + 1)}
                    disabled={!stepCompletionStatus[currentStep]}
                    className="flex items-center gap-2 bg-aku-primary text-white font-semibold px-7 py-3 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-glow-green transition-all duration-300 hover:scale-105 active:scale-95 text-sm"
                    aria-label="Continue to next step"
                  >
                    Continue
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinalSubmission}
                    disabled={isSubmitting || !currentUser}
                    className="flex items-center gap-2 bg-aku-primary text-white font-semibold px-7 py-3 rounded-full hover:shadow-glow-green disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 active:scale-95 text-sm"
                    aria-label="Submit your project brief"
                  >
                    {isSubmitting ? "Submitting…" : "Submit Brief"}
                    <Check size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
