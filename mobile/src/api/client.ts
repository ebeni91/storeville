export type Store = {
  id: number;
  name: string;
  slug: string;
  category: string;
  primary_color?: string;
};

export type OrderPayload = {
  store: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: Array<{
    product: number;
    quantity: number;
  }>;
  payment_method?: string;
};

export type RegisterPayload = {
  username: string;
  password: string;
  email?: string;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    const maybeJson = await response.json().catch(() => null);
    const message = maybeJson?.detail || maybeJson?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function fetchStores(lat?: number, lng?: number, radius = 10) {
  const query = lat != null && lng != null ? `?lat=${lat}&lng=${lng}&radius=${radius}` : '';
  return request<Store[]>(`/api/stores/${query}`);
}

export function fetchStoreBySlug(slug: string) {
  return request<Store>(`/api/stores/${encodeURIComponent(slug)}/`);
}

export function createOrder(payload: OrderPayload, token?: string) {
  return request('/api/orders/', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: token ? { Authorization: `Token ${token}` } : undefined
  });
}

export function getOrderStatus(reference: string) {
  return request(`/api/orders/status/?ref=${encodeURIComponent(reference)}`);
}

export function registerUser(payload: RegisterPayload) {
  return request('/api/users/register/', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function loginUser(username: string, password: string) {
  return request<{ token: string }>('/api/users/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

export { API_BASE_URL };
