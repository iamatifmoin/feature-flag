"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { apiFetch } from "../lib/api";
import { clearAuth, getStoredUser } from "../lib/auth";

interface CheckResult {
  found: boolean;
  featureKey: string;
  isEnabled: boolean | null;
}

function FeatureCheckContent() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("your organization");
  const [featureKey, setFeatureKey] = useState("");
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser?.orgName) {
      setOrgName(storedUser.orgName);
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await apiFetch<CheckResult>("/api/flags/check", {
        method: "POST",
        body: JSON.stringify({ featureKey })
      });
      setResult(response);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to check feature"
      );
      setResult(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    clearAuth();
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-panel backdrop-blur sm:p-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-sunset">{orgName}</p>
            <h1 className="mt-4 font-[var(--font-heading)] text-4xl font-semibold text-graphite">
              Feature availability check
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Ask whether a feature is enabled for your organization without exposing admin controls.
            </p>
          </div>
          <button
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </div>

        <div className="mt-10 rounded-[2rem] bg-peach p-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Feature Key</span>
              <input
                className="w-full rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm outline-none transition focus:border-sunset"
                value={featureKey}
                onChange={(event) => {
                  setFeatureKey(event.target.value);
                  setResult(null);
                }}
                placeholder="new_checkout_flow"
                required
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <button
              className="rounded-2xl bg-sunset px-5 py-3 text-sm font-semibold text-white transition hover:bg-violetink disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Checking..." : "Check"}
            </button>
          </form>

          {result ? (
            result.found && result.isEnabled ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-medium text-lime">
                ✓ {result.featureKey} is ENABLED for your organization
              </div>
            ) : result.found && result.isEnabled === false ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm font-medium text-rust">
                ✗ {result.featureKey} is DISABLED for your organization
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-medium text-amberline">
                Feature &apos;{result.featureKey}&apos; does not exist for your organization
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function FeatureCheckPage() {
  return (
    <ProtectedRoute allowedRoles={["end_user"]}>
      <FeatureCheckContent />
    </ProtectedRoute>
  );
}
