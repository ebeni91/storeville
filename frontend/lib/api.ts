// Helper to get the correct URL
export const getBaseUrl = () => {
  if (typeof window === "undefined") {
    // We are on the server (Docker container)
    return "http://backend:8000";
  }
  // We are on the client (Browser)
  return "http://localhost:8000";
};

// export async function fetchStores() {
//   const res = await fetch(`${getBaseUrl()}/api/stores/`, {
//     cache: "no-store", // Always fetch fresh data
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch stores");
//   }

//   return res.json();
// }



// Update the fetchStores function signature
export async function fetchStores(lat?: number, lng?: number, radius: number = 10) {
  let url = `${getBaseUrl()}/api/stores/`;
  
  // Append location params if they exist
  if (lat && lng) {
    url += `?lat=${lat}&lng=${lng}&radius=${radius}`;
  }

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch stores");
  }

  return res.json();
}


// ... (keep getBaseUrl and fetchStores) ...

export async function createOrder(orderData: any) {
  const res = await fetch(`${getBaseUrl()}/api/orders/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(JSON.stringify(errorData));
  }

  return res.json();
}

// ... (keep existing imports and functions)

export async function getOrderStatus(ref: string) {
  const res = await fetch(`${getBaseUrl()}/api/orders/status/?ref=${encodeURIComponent(ref)}`, {
    cache: "no-store",
  });
  
  if (!res.ok) {
    // Return null or throw depending on preference, but here we return the error payload
    return res.json().then(data => { throw new Error(data.message || "Failed to fetch status") });
  }

  return res.json();
}