export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  orgId: string | null;
  exp?: number;
  iat?: number;
}

export interface StoredUser {
  id: string;
  name?: string;
  email: string;
  role: string;
  orgId: string | null;
  orgName?: string;
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "="
  );
  return window.atob(padded);
}

export function parseToken(token: string): TokenPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const [, payload] = token.split(".");
    return JSON.parse(decodeBase64Url(payload)) as TokenPayload;
  } catch {
    return null;
  }
}

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem("token");
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem("user");
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StoredUser;
  } catch {
    return null;
  }
}

export function saveAuth(token: string, user: StoredUser) {
  window.localStorage.setItem("token", token);
  window.localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth() {
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("user");
}
