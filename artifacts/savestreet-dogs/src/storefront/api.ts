import { auth } from "@/lib/firebase";

export type StorefrontApiError = Error & { status?: number };

export type CreateOrderInput = {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  deliveryNotes?: string;
  items: Array<{ productId: string; quantity: number }>;
  paymentDone: true;
};

export type CreatedOrder = {
  orderCode: string;
  totalRupees?: number;
};

export type OrderProduct = {
  productId?: string;
  name?: string;
  productName?: string;
  imagePath?: string;
  imageUrl?: string;
  productImageUrl?: string;
  imageUrls?: string[];
  quantity?: number;
  unitPriceRupees?: number;
  priceRupees?: number;
  totalRupees?: number;
};

export type OrderTimelineEntry = {
  status?: string;
  label?: string;
  description?: string;
  date?: string;
  timestamp?: string;
  completed?: boolean;
  current?: boolean;
};

export type TrackedOrder = {
  orderCode?: string;
  id?: string;
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  deliveryNotes?: string;
  paymentStatus?: string;
  orderStatus?: string;
  status?: string;
  expectedDelivery?: string | null;
  createdAt?: string;
  updatedAt?: string;
  expectedDate?: string;
  estimatedDeliveryDate?: string;
  delayReason?: string;
  deliveryInfo?: string;
  delivery?: {
    address?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    notes?: string;
  };
  items?: OrderProduct[];
  products?: OrderProduct[];
  timeline?: OrderTimelineEntry[];
  statusTimeline?: OrderTimelineEntry[];
  totalRupees?: number;
  total?: number;
};

export async function storefrontJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string; message?: string } | null;
    const error = new Error(
      body?.error ?? body?.message ?? `Request failed (${response.status})`,
    ) as StorefrontApiError;
    error.status = response.status;
    throw error;
  }

  return response.status === 204 ? undefined as T : await response.json() as T;
}

export function storageImageUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("/objects/")) return `/api/storage${path}`;
  return path;
}

export function apiErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The request could not be completed.";
}