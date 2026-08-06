import React from "react";
import { useCurrentUser } from "../context/UserContext";

export default function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser, openAuthModal } = useCurrentUser();

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-header">
        <div className="text-center max-w-sm">
          <h1 className="font-display font-bold text-2xl text-text-primary mb-3">
            Sign In Required
          </h1>
          <p className="text-text-muted text-sm mb-6">
            Please sign in to access this page.
          </p>
          <button
            onClick={() => openAuthModal()}
            className="bg-aku-primary text-white font-semibold text-sm px-6 py-3 rounded-full hover:shadow-glow-green transition-all duration-300"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 pt-header">
        <div className="text-center max-w-sm">
          <h1 className="font-display font-bold text-2xl text-text-primary mb-3">
            Access Restricted
          </h1>
          <p className="text-text-muted text-sm mb-6">
            You don't have permission to view this page.
          </p>
          <a
            href="/"
            className="inline-block bg-aku-primary text-white font-semibold text-sm px-6 py-3 rounded-full hover:shadow-glow-green transition-all duration-300"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  return children;
}
