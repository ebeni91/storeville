export const getBaseUrl = () => {
  if (typeof window === "undefined") return "http://backend:8000";
  return "http://localhost:8000";
};

// 📍 RE-ADD PARAMS HERE:
export async function fetchStores(lat?: number, lng?: number, radius: number = 10) {
  let url = `${getBaseUrl()}/api/stores/`;
  if (lat && lng) {
    url += `?lat=${lat}&lng=${lng}&radius=${radius}`;
  }

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch stores");
  return res.json();
}

// ... keep existing createOrder and getOrderStatus functions
export async function createOrder(orderData: any) {
  const res = await fetch(`${getBaseUrl()}/api/orders/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(JSON.stringify(errorData));
  }
  return res.json();
}

export async function getOrderStatus(ref: string) {
  const res = await fetch(`${getBaseUrl()}/api/orders/status/?ref=${encodeURIComponent(ref)}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    return res.json().then(data => { throw new Error(data.message || "Failed to fetch status") });
  }
  return res.json();
}