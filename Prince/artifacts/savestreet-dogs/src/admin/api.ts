import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { auth, storage } from "@/lib/firebase";

export type AdminApiError = Error & { status?: number };

export async function adminJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(path, { ...init, credentials: "include", headers });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    const error = new Error(body?.error ?? `Request failed (${response.status})`) as AdminApiError;
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? undefined as T : await response.json() as T;
}

export async function uploadAdminImage(file: File): Promise<string> {
  const supportedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
  if (!supportedTypes.has(file.type)) {
    throw new Error("Choose a JPG, PNG, WebP, or GIF image.");
  }
  if (file.size > 10 * 1024 * 1024) throw new Error("Images must be 10 MB or smaller.");
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  const imageRef = ref(storage, `savestreet/images/${crypto.randomUUID()}-${safeName}`);
  const uploaded = await uploadBytes(imageRef, file, { contentType: file.type });
  return getDownloadURL(uploaded.ref);
}

export function objectUrl(path?: string): string {
  if (!path) return "";
  if (/^(https?:|data:|blob:)/.test(path)) return path;
  if (path.startsWith("/api/storage/")) return path;
  if (
    path.startsWith("/objects/") &&
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return `/api/storage${path}`;
  }
  return path;
}

export function apiErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The request could not be completed.";
}