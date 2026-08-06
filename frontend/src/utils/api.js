export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };

  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("aku_user"));
  } catch {
    storedUser = null;
  }

  if (storedUser?.token) {
    headers.Authorization = `Bearer ${storedUser.token}`;
  }

  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${API_BASE_URL}${path}`, { ...options, headers });
}
