import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

function requestsSeenKey(userId) {
  return `aku_requests_seen_${userId}`;
}

// Counts how many of the client's requests changed since they last opened
// "My Requests" — a lightweight, no-backend-changes stand-in for real
// notifications, using a per-user "last seen" timestamp in localStorage.
export function useUnseenRequestUpdates(currentUser, seenVersion) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "client") {
      setCount(0);
      return;
    }

    let cancelled = false;

    async function fetchCount() {
      try {
        const response = await apiFetch(`/api/service-requests/user/${currentUser.userId}`);
        const data = await response.json();
        if (!data.success || cancelled) return;

        const lastSeen = localStorage.getItem(requestsSeenKey(currentUser.userId));
        const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;

        const unseen = data.data.filter(
          (request) => new Date(request.updated_at).getTime() > lastSeenTime
        ).length;

        setCount(unseen);
      } catch {
        // Badge just won't show — not worth surfacing an error for this.
      }
    }

    fetchCount();

    return () => { cancelled = true; };
  }, [currentUser, seenVersion]);

  return count;
}
