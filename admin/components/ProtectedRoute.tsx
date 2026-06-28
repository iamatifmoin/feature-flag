"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getStoredToken, parseToken } from "../lib/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({
  children,
  allowedRoles = []
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    const payload = parseToken(token);
    if (!payload) {
      clearAuth();
      router.replace("/login");
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
      clearAuth();
      router.replace("/login");
      return;
    }

    setIsAllowed(true);
  }, [allowedRoles, router]);

  if (!isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-skyglass px-6">
        <div className="rounded-3xl border border-white/70 bg-white/90 px-6 py-4 text-sm text-slate-600 shadow-panel">
          Checking session...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
