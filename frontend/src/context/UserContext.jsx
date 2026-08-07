import React, { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

function requestsSeenKey(userId) {
  return `aku_requests_seen_${userId}`;
}

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    // Persist user across page refreshes
    const stored = localStorage.getItem("aku_user");
    return stored ? JSON.parse(stored) : null;
  });

  const [authModalState, setAuthModalState] = useState({
    isOpen: false,
    redirectOnSuccess: true,
  });

  // Bumped whenever markRequestsSeen() runs, so components watching request
  // activity (e.g. the navbar's unseen-updates badge) know to recompute.
  const [requestsSeenVersion, setRequestsSeenVersion] = useState(0);

  function signIn(userData) {
    setCurrentUser(userData);
    localStorage.setItem("aku_user", JSON.stringify(userData));
  }

  function signOut() {
    setCurrentUser(null);
    localStorage.removeItem("aku_user");
  }

  function openAuthModal(options = {}) {
    setAuthModalState({
      isOpen: true,
      redirectOnSuccess: options.redirectOnSuccess !== false,
    });
  }

  function closeAuthModal() {
    setAuthModalState((prev) => ({ ...prev, isOpen: false }));
  }

  function markRequestsSeen() {
    if (!currentUser) return;
    localStorage.setItem(requestsSeenKey(currentUser.userId), new Date().toISOString());
    setRequestsSeenVersion((v) => v + 1);
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
        signIn,
        signOut,
        authModalState,
        openAuthModal,
        closeAuthModal,
        requestsSeenVersion,
        markRequestsSeen,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(UserContext);
}
