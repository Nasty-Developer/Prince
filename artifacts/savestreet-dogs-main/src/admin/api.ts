import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { fetchWithTimeout } from "@workspace/api-client-react";
import { auth } from "@/lib/firebase-auth";
import { storage } from "@/lib/firebase-storage";

export type AdminApiError = Error & { status?: number };

export async function adminJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetchWithTimeout(path, { ...init, credentials: "include", headers });
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
  let uploadFile = file;
  if (file.type !== "image/gif" && file.size > 200 * 1024 && typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const compressed = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.82),
      );
      if (compressed && compressed.size < file.size) {
        const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
        uploadFile = new File([compressed], `${baseName}.webp`, {
          type: "image/webp",
          lastModified: file.lastModified,
        });
      }
    }
    bitmap.close();
  }
  const safeName = uploadFile.name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-");
  const imageRef = ref(storage, `savestreet/images/${crypto.randomUUID()}-${safeName}`);
  const uploaded = await uploadBytes(imageRef, uploadFile, {
    contentType: uploadFile.type,
    cacheControl: "public, max-age=31536000, immutable",
  });
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