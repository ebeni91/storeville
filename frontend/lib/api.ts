// Helper to get the correct URL
export const getBaseUrl = () => {
  if (typeof window === "undefined") {
    // We are on the server (Docker container)
    return "http://backend:8000";
  }
  // We are on the client (Browser)
  return "http://localhost:8000";
};

export async function fetchStores() {
  const res = await fetch(`${getBaseUrl()}/api/stores/`, {
    cache: "no-store", // Always fetch fresh data
  });

  if (!res.ok) {
    throw new Error("Failed to fetch stores");
  }

  return res.json();
}