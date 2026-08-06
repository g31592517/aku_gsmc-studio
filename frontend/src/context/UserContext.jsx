import React, { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

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

  return (
    <UserContext.Provider
      value={{ currentUser, signIn, signOut, authModalState, openAuthModal, closeAuthModal }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(UserContext);
}
