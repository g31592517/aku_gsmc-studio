import React, { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    // Persist user across page refreshes
    const stored = localStorage.getItem("aku_user");
    return stored ? JSON.parse(stored) : null;
  });

  function signIn(userData) {
    setCurrentUser(userData);
    localStorage.setItem("aku_user", JSON.stringify(userData));
  }

  function signOut() {
    setCurrentUser(null);
    localStorage.removeItem("aku_user");
  }

  return (
    <UserContext.Provider value={{ currentUser, signIn, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(UserContext);
}
