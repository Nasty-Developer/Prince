import { auth } from "@/lib/firebase";

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
  const ticket = await adminJson<{ uploadURL: string; objectPath: string }>(
    "/api/storage/uploads/request-url",
    { method: "POST", body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }) },
  );
  const upload = await fetch(ticket.uploadURL, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
  if (!upload.ok) throw new Error("The image upload did not complete.");
  return ticket.objectPath;
}

export function objectUrl(path: string): string {
  return path.startsWith("http") ? path : `/api/storage${path}`;
}

export function apiErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The request could not be completed.";
}