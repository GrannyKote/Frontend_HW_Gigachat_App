import type { Scope } from "../types";

const KEY = "hw1.auth";

export type AuthState = { credentials: string; scope: Scope } | null;

export function loadAuth(): AuthState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "credentials" in parsed &&
      "scope" in parsed &&
      typeof (parsed as any).credentials === "string" &&
      typeof (parsed as any).scope === "string"
    ) {
      return parsed as AuthState;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveAuth(auth: Exclude<AuthState, null>) {
  localStorage.setItem(KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

