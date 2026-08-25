import React from "react";

const STATUS_STEPS = [
  { key: "pending", label: "Pending" },
  { key: "assigned", label: "Assigned" },
  { key: "in-progress", label: "In Progress" },
  { key: "awaiting-review", label: "Awaiting Review" },
  { key: "draft-approved", label: "Draft Approved" },
  { key: "completed", label: "Completed" },
];

export default function StatusProgressBar({ currentStatus }) {
  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="w-full" aria-label={`Request status: ${currentStatus}`}>
      <div className="flex items-center justify-between relative">
        {/* Connecting line behind the dots */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-surface-border z-0" />
        <div
          className="absolute top-3 left-0 h-0.5 bg-aku-primary z-0 transition-all duration-500"
          style={{
            width: currentIndex === 0
              ? "0%"
              : `${(currentIndex / (STATUS_STEPS.length - 1)) * 100}%`,
          }}
        />

        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center z-10 gap-2">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? "bg-aku-primary border-aku-primary"
                    : isCurrent
                    ? "bg-white border-aku-primary"
                    : "bg-white border-surface-border"
                }`}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {isCurrent && (
                  <div className="w-2 h-2 rounded-full bg-aku-primary" aria-hidden="true" />
                )}
              </div>
              <span className={`text-xs font-medium text-center hidden sm:block ${
                isCurrent ? "text-aku-green" : isCompleted ? "text-text-secondary" : "text-text-muted"
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
